/**
 * SARWARI A. BASIT — ZERO-TRUST STATIC VAULT CRYPTOGRAPHIC ENGINE
 * Web Crypto API (AES-256-GCM + PBKDF2-SHA256)
 * Zero external dependencies. Browser native cryptographic guarantees.
 */

(function () {
  'use strict';

  // State Management
  const STATE = {
    failedAttempts: 0,
    lockoutUntil: 0,
    isDecrypting: false,
    currentCompany: null
  };

  // Utilities for ArrayBuffer & Hex
  const CryptoUtils = {
    bufferToHex(buffer) {
      return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    },

    hexToBuffer(hex) {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
      }
      return bytes.buffer;
    },

    strToBuffer(str) {
      return new TextEncoder().encode(str);
    },

    bufferToStr(buffer) {
      return new TextDecoder().decode(buffer);
    },

    async sha256Hex(str) {
      const data = this.strToBuffer(str);
      const hash = await crypto.subtle.digest('SHA-256', data);
      return this.bufferToHex(hash);
    },

    async deriveKey(passphrase, saltBuffer) {
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        this.strToBuffer(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      return crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    }
  };

  // DOM Elements
  const dom = {
    gateway: document.getElementById('auth-gateway'),
    form: document.getElementById('auth-form'),
    input: document.getElementById('auth-code-input'),
    submitBtn: document.getElementById('auth-submit-btn'),
    terminal: document.getElementById('auth-terminal'),
    vaultContent: document.getElementById('vault-content'),
    lockBtn: null // bound after portfolio mount
  };

  // Terminal Logger
  function logTerminal(message, type = 'normal') {
    if (!dom.terminal) return;
    const line = document.createElement('div');
    line.className = `auth-terminal-line ${type}`;
    const timestamp = new Date().toTimeString().split(' ')[0];
    line.textContent = `[${timestamp}] ${message}`;
    dom.terminal.appendChild(line);
    dom.terminal.scrollTop = dom.terminal.scrollHeight;
  }

  // Rate Limiting & Lockout
  function checkLockout() {
    const now = Date.now();
    if (now < STATE.lockoutUntil) {
      const remainingSec = Math.ceil((STATE.lockoutUntil - now) / 1000);
      logTerminal(`LOCKOUT ACTIVE: Please wait ${remainingSec}s before retrying.`, 'error');
      dom.input.disabled = true;
      dom.submitBtn.disabled = true;
      setTimeout(checkLockout, 1000);
      return true;
    }

    if (dom.input && dom.input.disabled) {
      dom.input.disabled = false;
      dom.submitBtn.disabled = false;
      dom.input.focus();
      logTerminal(`Brute-force lockout expired. Ready for authentication.`, 'normal');
    }
    return false;
  }

  function registerFailure() {
    STATE.failedAttempts++;
    if (dom.gateway) {
      const card = dom.gateway.querySelector('.auth-card');
      if (card) {
        card.classList.remove('shake-error');
        void card.offsetWidth; // trigger reflow
        card.classList.add('shake-error');
      }
    }

    if (STATE.failedAttempts >= 5) {
      STATE.lockoutUntil = Date.now() + 30000; // 30s lockout
      logTerminal(`Security alert: Multiple invalid keys detected. Rate-limit lockout triggered (30s).`, 'error');
      checkLockout();
    } else if (STATE.failedAttempts >= 3) {
      STATE.lockoutUntil = Date.now() + 5000; // 5s lockout
      logTerminal(`Warning: Consecutive auth failures. Brief cooldown active (5s).`, 'error');
      checkLockout();
    } else {
      logTerminal(`Access Denied: Unrecognized access key or signature mismatch.`, 'error');
    }
  }

  // Main Decryption Procedure
  async function authenticateCode(rawCode) {
    if (STATE.isDecrypting || checkLockout()) return;

    const code = rawCode.trim().toUpperCase();
    if (!code) {
      logTerminal(`Error: Access key cannot be empty.`, 'error');
      return;
    }

    STATE.isDecrypting = true;
    dom.submitBtn.disabled = true;
    dom.submitBtn.innerHTML = `<i class="bi bi-cpu"></i> <span>Verifying...</span>`;

    logTerminal(`Evaluating credential signature...`);

    try {
      // 1. Fetch Payload Envelope
      const payload = window.SECURE_VAULT_PAYLOAD;
      if (!payload || !payload.slots) {
        throw new Error('Vault payload not loaded.');
      }

      // 2. Hash normalized code
      const codeHash = await CryptoUtils.sha256Hex(code);
      logTerminal(`SHA-256 Digest: ${codeHash.substring(0, 16)}...`);

      // 3. Find Matching Slot
      const slot = payload.slots[codeHash];
      if (!slot) {
        await new Promise(r => setTimeout(r, 600)); // anti-timing variance
        registerFailure();
        return;
      }

      logTerminal(`Matching slot verified for: ${slot.companyName}`, 'success');
      logTerminal(`Executing PBKDF2 key derivation (100,000 rounds)...`);

      // 4. Derive slot key
      const saltBuf = CryptoUtils.hexToBuffer(slot.salt);
      const slotIv = CryptoUtils.hexToBuffer(slot.iv);
      const derivedKey = await CryptoUtils.deriveKey(code, saltBuf);

      // 5. Decrypt Master Key
      logTerminal(`Decrypting Master Content Key via AES-256-GCM...`);
      const encMasterKeyBuf = CryptoUtils.hexToBuffer(slot.encryptedKey);
      
      let masterKeyRaw;
      try {
        masterKeyRaw = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: slotIv },
          derivedKey,
          encMasterKeyBuf
        );
      } catch (err) {
        logTerminal(`Integrity verification failed on slot envelope.`, 'error');
        registerFailure();
        return;
      }

      // 6. Import Master Key
      const masterKey = await crypto.subtle.importKey(
        'raw',
        masterKeyRaw,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      // 7. Decrypt Portfolio Content Payload
      logTerminal(`Unpacking encrypted HTML payload...`);
      const payloadIv = CryptoUtils.hexToBuffer(payload.iv);
      const ciphertextBuf = CryptoUtils.hexToBuffer(payload.ciphertext);

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: payloadIv },
        masterKey,
        ciphertextBuf
      );

      const htmlContent = CryptoUtils.bufferToStr(decryptedBuffer);
      logTerminal(`AES-256-GCM authentication tag verified!`, 'success');
      logTerminal(`Session authorized for ${slot.companyName}. Mounting vault...`, 'success');

      // 8. Success: Mount & Reveal
      await new Promise(r => setTimeout(r, 400));
      STATE.currentCompany = slot.companyName;

      // Persist in SessionStorage
      sessionStorage.setItem('zeroTrustSession', JSON.stringify({
        authenticated: true,
        companyName: slot.companyName,
        codeHash: codeHash,
        cachedHtml: htmlContent,
        timestamp: Date.now()
      }));

      mountPortfolio(htmlContent, slot.companyName);

    } catch (error) {
      console.error('Decryption error:', error);
      logTerminal(`Decryption fault: ${error.message}`, 'error');
      registerFailure();
    } finally {
      STATE.isDecrypting = false;
      dom.submitBtn.disabled = false;
      dom.submitBtn.innerHTML = `<i class="bi bi-shield-check"></i> <span>Authenticate</span>`;
    }
  }

  // Mount Decrypted Portfolio into DOM
  function mountPortfolio(htmlContent, companyName) {
    if (!dom.vaultContent) return;

    dom.vaultContent.innerHTML = htmlContent;
    dom.vaultContent.style.display = 'block';

    // Update verified badge in navbar
    const sessionBadge = document.getElementById('nav-session-text');
    if (sessionBadge) {
      sessionBadge.textContent = `VERIFIED: ${companyName}`;
    }

    // Hide lockscreen
    if (dom.gateway) {
      dom.gateway.classList.add('unlocked');
      setTimeout(() => {
        dom.gateway.style.display = 'none';
      }, 500);
    }

    // Attach Lock Session Button
    const lockBtn = document.getElementById('btn-lock-session');
    if (lockBtn) {
      lockBtn.addEventListener('click', lockVault);
    }

    // Initialize Main UI Interactions
    if (window.initPortfolio) {
      window.initPortfolio();
    }
  }

  // Re-Lock Session
  function lockVault() {
    sessionStorage.removeItem('zeroTrustSession');
    if (dom.vaultContent) {
      dom.vaultContent.innerHTML = '';
      dom.vaultContent.style.display = 'none';
    }
    if (dom.gateway) {
      dom.gateway.style.display = 'flex';
      void dom.gateway.offsetWidth;
      dom.gateway.classList.remove('unlocked');
    }
    if (dom.input) {
      dom.input.value = '';
      dom.input.focus();
    }
    logTerminal(`Session cleared. Vault locked under Zero-Trust protocol.`, 'normal');
  }

  // Dynamic Demo Pills Renderer
  function updateDemoPills() {
    const pillsContainer = document.querySelector('.demo-pills');
    if (!pillsContainer) return;

    let companySlots = [];
    try {
      const stored = localStorage.getItem('PORTFOLIO_COMPANY_SLOTS');
      if (stored) companySlots = JSON.parse(stored);
    } catch (e) {}

    if (!Array.isArray(companySlots) || companySlots.length === 0) {
      if (window.SECURE_VAULT_PAYLOAD && window.SECURE_VAULT_PAYLOAD.slots) {
        companySlots = Object.values(window.SECURE_VAULT_PAYLOAD.slots).map(s => ({
          name: s.companyName,
          code: s.companyName.split(' ')[0].toUpperCase()
        }));
      }
    }

    if (Array.isArray(companySlots) && companySlots.length > 0) {
      pillsContainer.innerHTML = '';
      // Take up to 8 distinct codes
      const uniqueCodes = [];
      for (const slot of companySlots) {
        if (!uniqueCodes.includes(slot.code) && uniqueCodes.length < 8) {
          uniqueCodes.push(slot.code);
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'demo-pill-btn';
          btn.setAttribute('data-code', slot.code);
          btn.textContent = slot.code;
          btn.addEventListener('click', () => {
            if (dom.input) {
              dom.input.value = slot.code;
              authenticateCode(slot.code);
            }
          });
          pillsContainer.appendChild(btn);
        }
      }
    }
  }

  // Ensure Payload Is Initialized
  async function ensurePayloadLoaded() {
    // 1. Check LocalStorage for synchronized payload from access_manager.html
    try {
      const storedPayload = localStorage.getItem('SECURE_VAULT_PAYLOAD');
      if (storedPayload) {
        const parsed = JSON.parse(storedPayload);
        if (parsed && parsed.ciphertext && parsed.slots) {
          window.SECURE_VAULT_PAYLOAD = parsed;
          logTerminal(`[SYNC] Loaded ${Object.keys(parsed.slots).length} active keys from local vault.`, 'success');
          updateDemoPills();
          return;
        }
      }
    } catch (e) {
      console.warn("Could not parse stored payload:", e);
    }

    // 2. Check if window.SECURE_VAULT_PAYLOAD already defined (e.g. from payload.js)
    if (window.SECURE_VAULT_PAYLOAD && window.SECURE_VAULT_PAYLOAD.ciphertext) {
      updateDemoPills();
      return;
    }

    // 3. Fallback: compile in memory with custom slots or default slots
    if (window.PORTFOLIO_TEMPLATE_HTML) {
      try {
        logTerminal(`[DEV ENGINE] Encrypting vault template with AES-256-GCM...`);

        // Check if custom slots exist in localStorage
        let targetSlots = null;
        try {
          const storedSlots = localStorage.getItem('PORTFOLIO_COMPANY_SLOTS');
          if (storedSlots) targetSlots = JSON.parse(storedSlots);
        } catch (e) {}

        if (!Array.isArray(targetSlots) || targetSlots.length === 0) {
          targetSlots = [
            { name: "Demo Recruiter Preview", code: "DEMO-2026" },
            { name: "Demo Recruiter Preview (Short)", code: "DEMO" },
            { name: "Airport Munich Logistic & Services GmbH", code: "AIRPORT-MUNICH" },
            { name: "BMW Group Information Security", code: "BMW-SECURITY" },
            { name: "BMW Group (Short)", code: "BMW" },
            { name: "Siemens AG Cyber Review", code: "SIEMENS-SECURITY" },
            { name: "Siemens AG (Short)", code: "SIEMENS" },
            { name: "Airbus Defence & Cyber", code: "AIRBUS-CYBER" },
            { name: "Airbus Defence (Short)", code: "AIRBUS" },
            { name: "Universität Passau IT-Sicherheit", code: "UNI-PASSAU" },
            { name: "Universität Passau (Short)", code: "PASSAU" }
          ];
        }

        const masterKeyRaw = crypto.getRandomValues(new Uint8Array(32));
        const masterKey = await crypto.subtle.importKey(
          'raw',
          masterKeyRaw,
          { name: 'AES-GCM' },
          false,
          ['encrypt']
        );

        const payloadIv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedHtml = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: payloadIv },
          masterKey,
          CryptoUtils.strToBuffer(window.PORTFOLIO_TEMPLATE_HTML)
        );

        const slotsObject = {};
        for (const slot of targetSlots) {
          const normCode = slot.code.trim().toUpperCase();
          const codeHash = await CryptoUtils.sha256Hex(normCode);
          const salt = crypto.getRandomValues(new Uint8Array(16));
          const slotIv = crypto.getRandomValues(new Uint8Array(12));

          const slotKey = await CryptoUtils.deriveKey(normCode, salt);
          const encMasterKey = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: slotIv },
            slotKey,
            masterKeyRaw
          );

          slotsObject[codeHash] = {
            companyName: slot.name,
            salt: CryptoUtils.bufferToHex(salt),
            iv: CryptoUtils.bufferToHex(slotIv),
            encryptedKey: CryptoUtils.bufferToHex(encMasterKey)
          };
        }

        window.SECURE_VAULT_PAYLOAD = {
          version: "2.0",
          cipher: "AES-256-GCM",
          kdf: "PBKDF2-SHA256-100K",
          iv: CryptoUtils.bufferToHex(payloadIv),
          ciphertext: CryptoUtils.bufferToHex(encryptedHtml),
          slots: slotsObject
        };

        logTerminal(`[VAULT READY] Ciphertext sealed. Zero-Trust perimeter armed.`, 'success');
        updateDemoPills();
      } catch (e) {
        console.error("Payload initialization error:", e);
      }
    }
  }

  // Auto-Login from Session Storage
  async function checkExistingSession() {
    const sessionDataStr = sessionStorage.getItem('zeroTrustSession');
    if (!sessionDataStr) return;

    try {
      const session = JSON.parse(sessionDataStr);
      if (session && session.authenticated && session.codeHash && window.SECURE_VAULT_PAYLOAD) {
        const payload = window.SECURE_VAULT_PAYLOAD;
        const slot = payload.slots[session.codeHash];
        if (slot) {
          logTerminal(`Active session detected for: ${slot.companyName}.`, 'success');
          if (session.cachedHtml) {
            mountPortfolio(session.cachedHtml, slot.companyName);
          }
        }
      }
    } catch (e) {
      sessionStorage.removeItem('zeroTrustSession');
    }
  }

  // Event Listeners
  async function initAuth() {
    if (!dom.form) return;

    dom.form.addEventListener('submit', (e) => {
      e.preventDefault();
      authenticateCode(dom.input.value);
    });

    logTerminal(`SYSTEM INITIALIZED: AES-256-GCM Zero-Trust Vault active.`);
    logTerminal(`Awaiting employer or reviewer access credentials...`);

    // Ensure payload is prepared & dynamic pills are rendered
    await ensurePayloadLoaded();

    // Check existing session
    checkExistingSession();
  }

  // Expose API for access manager & external triggers
  window.ZeroTrustAuth = {
    authenticate: authenticateCode,
    lock: lockVault,
    utils: CryptoUtils,
    ensurePayload: ensurePayloadLoaded
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
})();
