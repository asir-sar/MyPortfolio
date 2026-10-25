/**
 * SARWARI A. BASIT — PORTFOLIO INTERACTIONS & HUD CONTROLLER
 * Zero external framework dependencies. Clean, modern vanilla JS.
 */

(function () {
  'use strict';

  // Project Details Database (for interactive deep-dive modal)
  const PROJECT_DETAILS = {
    'auto-grc': {
      title: 'AUTO-GRC: Automated Governance, Risk & Compliance for IaC',
      category: 'IT Security & GRC',
      badge: 'SECURITY / COMPLIANCE',
      overview: 'An automated security compliance scanning framework designed to evaluate Infrastructure-as-Code (Terraform, Kubernetes, CloudFormation) against strict security benchmarks (ISO 27001, NIST 800-53, CIS Benchmarks).',
      architecture: [
        'Static Analysis Engine parsing IaC configuration trees into AST models.',
        'Policy-as-Code engine mapping cloud infrastructure states to compliance control matrices.',
        'Continuous drift detection alert pipeline integrated into CI/CD pipelines.',
        'Automated executive & technical audit reporting generation.'
      ],
      techStack: ['Python', 'Docker', 'Terraform', 'Static Analysis', 'JSON Schema', 'GitLab CI'],
      impact: 'Reduces manual compliance audit overhead by 80% while preventing misconfigurations before deployment.'
    },
    'smart-home-attack': {
      title: 'Attack Against Smart Home: Simulation & Chain Attack Toolkit',
      category: 'Cyber Attack & Penetration Testing',
      badge: 'PENTEST / SIMULATION',
      overview: 'A complete virtual smart home environment designed to simulate multi-stage chain attacks against IoT ecosystems, demonstrating lateral movement from compromised edge devices to central controller systems.',
      architecture: [
        'Simulated IoT network comprising Zigbee/Wi-Fi connected endpoints and central gateway.',
        'Automated chain attack engine demonstrating firmware vulnerability exploitation, credential harvesting, and session replay.',
        'Defense mitigation blueprint demonstrating micro-segmentation, mutual TLS (mTLS), and zero-trust perimeter enforcement.',
        'Interactive telemetry dashboard monitoring real-time packet telemetry and attack vectors.'
      ],
      techStack: ['Python', 'Linux Network Namespaces', 'Wireshark', 'IoT Security', 'Cryptography', 'Socket API'],
      impact: 'Demonstrated real-world threat vectors in IoT automation and validated defense-in-depth isolation controls.'
    },
    'erp-system': {
      title: 'Enterprise Resource Planning System (ERP)',
      category: 'Enterprise Software & Cloud',
      badge: 'FULL-STACK / RBAC',
      overview: 'Comprehensive enterprise operational platform featuring strict Role-Based Access Control (RBAC), multi-tenant financial reporting, departmental resource allocation, and audited transaction logging.',
      architecture: [
        'Multi-tiered microservice architecture with encrypted database storage.',
        'Granular RBAC permission hierarchy ensuring zero unauthorized privilege escalations.',
        'RESTful API architecture with JWT authentication, rate limiting, and HMAC signing.',
        'Real-time data visualization and automated PDF financial audit reports.'
      ],
      techStack: ['Node.js', 'Express', 'React', 'MongoDB', 'RESTful APIs', 'JWT', 'Docker'],
      impact: 'Streamlined administrative overhead across multiple business units with complete tamper-evident audit trails.'
    },
    'ims-system': {
      title: 'Inventory Management System (IMS)',
      category: 'Enterprise Software & Operations',
      badge: 'SUPPLY CHAIN / ASSET TRACKING',
      overview: 'High-performance inventory and IT asset lifecycle tracking system featuring real-time barcode/QR indexing, stock depreciation calculation, and automated supplier replenishment alerts.',
      architecture: [
        'High-concurrency database schema designed to prevent race conditions during bulk stock movements.',
        'IT Asset Management (ITAM) subsystem with hardware MAC/IP tracking and license verification.',
        'Secure multi-user session management with activity auditing.'
      ],
      techStack: ['PHP', 'MySQL', 'JavaScript', 'HTML5', 'CSS3', 'Bootstrap'],
      impact: 'Eliminated inventory discrepancies and enabled full hardware lifecycle visibility for enterprise assets.'
    },
    'language-academy': {
      title: 'Language Academy Management System',
      category: 'Education & Operations Platform',
      badge: 'WEB APPLICATION',
      overview: 'End-to-end institutional operations suite handling student enrollment, instructor scheduling, curriculum tracking, automated fee invoicing, and gradebook management.',
      architecture: [
        'Secure multi-portal system (Student, Instructor, Administrator) with isolated views.',
        'Automated notification pipeline for scheduling adjustments and exam alerts.',
        'Responsive mobile-first user interface for seamless on-the-go portal access.'
      ],
      techStack: ['PHP', 'MySQL', 'JavaScript', 'CSS3', 'Responsive UI'],
      impact: 'Centralized manual paper workflows into a modern, accessible digital student information platform.'
    },
    'movie-buddy': {
      title: 'MovieBuddy: AI Conversational Recommendation Bot',
      category: 'AI & Conversational Engineering',
      badge: 'AI / RAG / CHATBOT',
      overview: 'Intelligent conversational assistant utilizing NLP and RAG-style semantic matching to recommend tailored films based on user moods, themes, and nuanced conversational queries.',
      architecture: [
        'Natural Language Processing pipeline extracting user intent, genre affinity, and sentiment.',
        'Vector similarity search ranking movies by thematic similarity rather than shallow keyword matching.',
        'Integration with third-party cinema database APIs with intelligent response caching.'
      ],
      techStack: ['Node.js', 'NLP Methods', 'REST APIs', 'Express', 'JavaScript', 'HTML/CSS'],
      impact: 'Showcases practical AI integration, prompt design, and conversational user experience.'
    }
  };

  // Typewriter Engine
  class TypeWriter {
    constructor(el, phrases, wait = 2500) {
      this.el = el;
      this.phrases = phrases;
      this.wait = parseInt(wait, 10);
      this.txt = '';
      this.phraseIndex = 0;
      this.isDeleting = false;
      this.tick();
    }

    tick() {
      const current = this.phraseIndex % this.phrases.length;
      const fullTxt = this.phrases[current];

      if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
      } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
      }

      this.el.innerHTML = `<span class="txt">${this.txt}</span>`;

      let typeSpeed = 80;
      if (this.isDeleting) {
        typeSpeed /= 2;
      }

      if (!this.isDeleting && this.txt === fullTxt) {
        typeSpeed = this.wait;
        this.isDeleting = true;
      } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.phraseIndex++;
        typeSpeed = 400;
      }

      setTimeout(() => this.tick(), typeSpeed);
    }
  }

  // Initialize Portfolio Features
  window.initPortfolio = function () {
    // 1. Initialize Typewriter
    const typingElement = document.getElementById('hero-typing-target');
    if (typingElement) {
      const phrases = [
        'IT Security Student @ Universität Passau',
        'Werkstudent Informatik @ Munich Airport BHS',
        'Zero-Trust Architecture & Native Security Solutions',
        'Full-Stack Developer & Vulnerability Analyst'
      ];
      new TypeWriter(typingElement, phrases, 2200);
    }

    // 2. Active Navigation Spy & Smooth Scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateNavSpy() {
      const scrollY = window.pageYOffset + 120;
      sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop;
        const sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', updateNavSpy, { passive: true });
    updateNavSpy();

    // 3. Mobile Navigation Drawer Toggle
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-menu-links');
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('mobile-open');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.toggle('bi-list');
          icon.classList.toggle('bi-x');
        }
      });

      // Close mobile nav on click
      navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('mobile-open');
          const icon = mobileToggle.querySelector('i');
          if (icon) {
            icon.classList.add('bi-list');
            icon.classList.remove('bi-x');
          }
        });
      });
    }

    // 4. Project Category Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // 5. Interactive Project Details Modal
    const modalOverlay = document.getElementById('project-modal');
    const modalContent = document.getElementById('modal-details-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    function openProjectModal(projectId) {
      const data = PROJECT_DETAILS[projectId];
      if (!data || !modalOverlay || !modalContent) return;

      const techBadges = data.techStack
        .map(t => `<span class="badge badge-teal">${t}</span>`)
        .join(' ');

      const archList = data.architecture
        .map(a => `<li style="margin-bottom:0.6rem; color:var(--text-secondary);"><i class="bi bi-shield-check" style="color:var(--accent-teal); margin-right:0.5rem;"></i>${a}</li>`)
        .join('');

      modalContent.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
          <span class="badge badge-blue" style="margin-bottom:0.75rem;">${data.badge}</span>
          <h2 style="font-size: 1.6rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">${data.title}</h2>
          <p style="font-size: 0.85rem; font-family: var(--font-mono); color: var(--accent-teal);">${data.category}</p>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 1rem; color: var(--text-primary); margin-bottom: 0.5rem; text-transform: uppercase; font-family: var(--font-mono); font-size: 0.8rem; letter-spacing: 0.05em;">Project Synopsis</h4>
          <p style="color: var(--text-secondary); line-height: 1.65;">${data.overview}</p>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 1rem; color: var(--text-primary); margin-bottom: 0.5rem; text-transform: uppercase; font-family: var(--font-mono); font-size: 0.8rem; letter-spacing: 0.05em;">System Architecture & Security Controls</h4>
          <ul style="list-style: none; padding-left: 0;">${archList}</ul>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 1rem; color: var(--text-primary); margin-bottom: 0.5rem; text-transform: uppercase; font-family: var(--font-mono); font-size: 0.8rem; letter-spacing: 0.05em;">Technology Stack</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">${techBadges}</div>
        </div>

        <div style="background: rgba(0, 212, 170, 0.06); border-left: 3px solid var(--accent-teal); padding: 1rem 1.25rem; border-radius: 0 8px 8px 0;">
          <strong style="color: var(--accent-teal); font-family: var(--font-mono); font-size: 0.8rem; text-transform: uppercase; display: block; margin-bottom: 0.25rem;">Measurable Impact</strong>
          <span style="font-size: 0.9rem; color: var(--text-secondary);">${data.impact}</span>
        </div>
      `;

      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    document.querySelectorAll('.project-view-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const projectId = btn.getAttribute('data-project');
        if (projectId) openProjectModal(projectId);
      });
    });

    // 6. Copy to Clipboard Utility
    window.copyToClipboard = function (text, btnElement, label) {
      navigator.clipboard.writeText(text).then(() => {
        const originalHtml = btnElement.innerHTML;
        btnElement.innerHTML = `<i class="bi bi-check2"></i> Copied!`;
        btnElement.style.borderColor = 'var(--accent-teal)';
        btnElement.style.color = 'var(--accent-teal)';

        setTimeout(() => {
          btnElement.innerHTML = originalHtml;
          btnElement.style.borderColor = '';
          btnElement.style.color = '';
        }, 2000);
      }).catch(err => {
        console.error('Copy failed:', err);
      });
    };

    // 7. Interactive Contact Terminal Form Simulation
    const contactForm = document.getElementById('contact-terminal-form');
    const formFeedback = document.getElementById('contact-form-feedback');

    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<i class="bi bi-arrow-repeat spin"></i> Transmitting Encrypted Message...`;
        }

        setTimeout(() => {
          if (formFeedback) {
            formFeedback.innerHTML = `
              <div style="background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.3); color: var(--accent-green); padding: 0.85rem 1.25rem; border-radius: 8px; font-family: var(--font-mono); font-size: 0.85rem; margin-top: 1rem;">
                <i class="bi bi-shield-check"></i> [OK] Message dispatched successfully to baset_sarwari@yahoo.com. Thank you!
              </div>
            `;
          }
          contactForm.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="bi bi-send"></i> Send Transmission`;
          }
        }, 1200);
      });
    }
  };
})();