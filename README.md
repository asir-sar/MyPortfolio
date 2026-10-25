# Sarwari A. Basit — Zero-Trust IT Security Portfolio

> **Private Access Web Portfolio** for **Sarwari Abdul Basit**  
> M.Sc. Informatik (IT-Sicherheit) @ Universität Passau · Werkstudent @ Airport Munich Logistic and Services GmbH  
> Designed for static hosting on **GitHub Pages** with **Zero-Trust Client-Side AES-256-GCM Encryption**.

---

## 🔒 1. Security Architecture & Threat Model

### The Challenge of GitHub Pages
GitHub Pages is a static hosting platform. On public repositories, typical password implementations (such as JavaScript `if (pass === "secret")`) are insecure because the source code and HTML can be inspected directly in DevTools.

### The Zero-Trust Solution
This portfolio implements **Envelope Encryption** powered entirely by the browser-native **Web Crypto API**:
1. **Master Content Encryption**: The entire portfolio HTML is encrypted with a cryptographically secure 256-bit AES-GCM Master Key ($K_{master}$).
2. **Key Derivation (PBKDF2)**: When a company or recruiter inputs their unique access code (e.g. `BMW-SECURITY` or `DEMO-2026`), the browser derives a 256-bit key ($K_{company}$) using **PBKDF2 with 100,000 iterations of SHA-256** and a unique per-company salt.
3. **Envelope Decryption**: $K_{company}$ deciphers the Master Key from the company's designated envelope slot.
4. **Payload Injection**: The Master Key deciphers the encrypted HTML payload into memory and mounts it into the DOM.
5. **Rate Limiting & Anti-Brute-Force**: The security gateway enforces client-side exponential backoff delays (5s after 3 failed attempts, 30s lockout after 5 failed attempts) to mitigate automated guessing.
6. **Zero Dependencies**: Native browser Web Crypto API guarantees fast performance (<150ms decryption) with zero third-party npm package vulnerabilities.

---

## 🚀 2. Quick Start & Local Testing

### Option A: Open directly in your browser
Simply double-click [`index.html`](file:///e:/myDocs/myPortifolio/index.html) or open it with VS Code Live Server.

### Option B: Pre-configured Access Codes
You can immediately test the authentication gateway using any of the following pre-configured credentials:

| Access Code | Authorized Entity | Mode |
|---|---|---|
| `DEMO-2026` / `DEMO` | Demo Recruiter Preview | General Evaluation |
| `AIRPORT-MUNICH` | Airport Munich Logistic and Services GmbH | Werkstudent Verification |
| `BMW-SECURITY` / `BMW` | BMW Group Information Security | Employer Review |
| `SIEMENS-SECURITY` / `SIEMENS` | Siemens AG Cyber Review | Employer Review |
| `AIRBUS-CYBER` / `AIRBUS` | Airbus Defence & Space | Employer Review |
| `UNI-PASSAU` / `PASSAU` | Universität Passau IT-Sicherheit | Academic Verification |

---

## 🛠️ 3. Managing Access Codes for Employers

When applying to a new company (e.g. *Tesla*, *Deutsche Telekom*, or *Google*), you can generate a tailored access code in seconds using either the graphical browser tool or the Node.js CLI script.

### Method 1: Graphical Key Manager (`access_manager.html`)
1. Open [`access_manager.html`](file:///e:/myDocs/myPortifolio/access_manager.html) in your browser.
2. Click **Add Company** and enter the company name and your chosen code (e.g., `TESLA-CYBER-2026`).
3. Click **Compile & Encrypt Now**.
4. Click **Copy Payload** and save it to `payload.js` or replace `window.SECURE_VAULT_PAYLOAD`.

### Method 2: Command Line (`generate_access.js`)
If you have Node.js installed:
```bash
node generate_access.js
```
This generates `payload.json` containing updated AES-256-GCM ciphertext and slot mappings.

---

## 🌐 4. GitHub Pages Deployment Guide

To deploy your secure portfolio to `https://<your-username>.github.io`:

1. **Keep Source Safe**: Keep `portfolio_template.html` and `access_manager.html` for your own editing.
2. **Deploying with Zero-Trust Content Protection**:
   - Run `access_manager.html` or `generate_access.js` to compile the encrypted payload.
   - Deploy `index.html`, `assets/`, and the encrypted payload to GitHub Pages.
   - When hosted on GitHub Pages, only the **ciphertext** is visible to anyone inspecting the site. Without the company access code, nobody can decrypt your portfolio!
3. **Sharing with Recruiters**:
   - In your job application email or cover letter, write:
     > *"You can review my confidential technical portfolio at `https://<username>.github.io` using your dedicated access code: `[COMPANY-CODE]`."*
   - This immediately shows recruiters that you take data security, zero-trust, and confidentiality seriously!

---

## 📂 5. Project Directory Structure

```
myPortfolio/
├── index.html              # Security Gateway & Decrypted Vault Canvas
├── access_manager.html     # Offline GUI Key & Access Code Generator
├── generate_access.js      # CLI Build Script (Node.js crypto)
├── portfolio_template.html # Unencrypted HTML template (for your edits)
├── portfolio_template.js   # Template JS export for offline dev
├── my_info.md              # Original resume source data
├── DESIGN.md               # Architectural & Design specification document
├── README.md               # This documentation
└── assets/
    ├── css/
    │   └── main.css        # Cybersecurity Dark Design System (Vanilla CSS)
    ├── js/
    │   ├── auth.js         # Web Crypto AES-256-GCM + PBKDF2 Engine
    │   └── main.js         # Typewriter, Project Filter, Modal & HUD Controller
    └── img/
        ├── Img.jpg          # Professional headshot (Sarwari A. Basit)
        └── hero-bg.jpeg     # Backdrop image
```

---

## 📊 6. Technical Stack & Standards

- **Core**: HTML5, Vanilla JavaScript (ES2022+), Vanilla CSS3
- **Cryptography**: Web Crypto API (`SubtleCrypto` AES-256-GCM, PBKDF2-SHA256)
- **Typography**: Space Grotesk, Inter, JetBrains Mono
- **Icons**: Bootstrap Icons v1.11.3 (Local offline font)
- **Design Tokens**: Void Black (`#0A0E17`), Cyber Teal (`#00D4AA`), Signal Blue (`#0EA5E9`), Slate (`#1E293B`)
- **Responsive**: Fully optimized across desktop, tablet, and mobile displays
