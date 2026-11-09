// ==========================================================================
// MAIN APPLICATION SCRIPT - L2 TWO MOONS
// Orchestrates dynamic content rendering, downloads tabs, countdown and events
// ==========================================================================

const App = {
  content: null,
  countdownInterval: null,

  async init() {
    this.setupEventListeners();
    await this.loadContent();
    await this.loadNews();
  },

  // Fetch public content from backend
  async loadContent() {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      if (data.success && data.data) {
        this.content = data.data;
        this.renderContent(data.data);
      }
    } catch (err) {
      console.warn('Could not load dynamic content from API, using fallback:', err);
    }
  },

  // Render content into DOM
  renderContent(content) {
    const { serverInfo, rates, downloads, social, features } = content;

    // Server Info
    this.setText('live-server-name', serverInfo?.name);
    this.setText('hero-server-title', serverInfo?.name);
    this.setText('hero-server-slogan', serverInfo?.slogan);
    this.setText('hero-server-subtitle', serverInfo?.subtitle);
    this.setText('live-chronicle-badge', serverInfo?.chronicle);
    this.setText('live-player-count', serverInfo?.onlinePlayers);
    this.setText('stat-engine-val', serverInfo?.engine);
    this.setText('announcement-ticker-text', serverInfo?.announcement);

    // Status Badge
    const statusPill = document.getElementById('live-status-pill');
    const statusText = document.getElementById('live-status-text');
    if (statusPill && statusText) {
      if (serverInfo?.status === 'ONLINE') {
        statusPill.className = 'pulse-indicator';
        statusText.textContent = 'ONLINE';
        statusText.style.color = 'var(--status-online)';
      } else if (serverInfo?.status === 'MAINTENANCE') {
        statusPill.className = 'pulse-indicator maintenance';
        statusText.textContent = 'MANTENIMIENTO';
        statusText.style.color = 'var(--color-ember-gold)';
      } else {
        statusPill.className = 'pulse-indicator offline';
        statusText.textContent = 'PRÓXIMAMENTE';
        statusText.style.color = 'var(--status-offline)';
      }
    }

    // Rates
    this.setText('rate-val-exp', rates?.exp);
    this.setText('rate-val-sp', rates?.sp);
    this.setText('rate-val-adena', rates?.adena);
    this.setText('rate-val-drop', rates?.drop);
    this.setText('rate-val-spoil', rates?.spoil);
    this.setText('rate-val-party', rates?.partyExp);
    this.setText('rate-val-raid', rates?.raidDrop);

    this.setText('rate-val-safe-enchant', rates?.safeEnchant);
    this.setText('rate-val-max-weapon', rates?.maxEnchantWeapon);
    this.setText('rate-val-max-armor', rates?.maxEnchantArmor);
    this.setText('rate-val-buff-duration', rates?.buffDuration);
    this.setText('rate-val-buff-slots', rates?.buffSlots);
    this.setText('rate-val-subclass', rates?.subClass);
    this.setText('rate-val-noblesse', rates?.noblesse);

    // Downloads
    this.setText('launcher-name-disp', downloads?.launcherName);
    this.setText('launcher-version-disp', downloads?.launcherVersion);
    this.setText('launcher-size-disp', downloads?.launcherSize);
    this.setHref('btn-hero-download', downloads?.launcherDirect);
    this.setHref('btn-launcher-direct', downloads?.launcherDirect);
    this.setHref('mirror-client-mega', downloads?.clientMega);
    this.setHref('mirror-client-mediafire', downloads?.clientMediafire);
    this.setHref('mirror-client-drive', downloads?.clientDrive);
    this.setHref('mirror-patch-mega', downloads?.patchMega);
    this.setHref('mirror-patch-mediafire', downloads?.patchMediafire);
    this.setHref('mirror-patch-drive', downloads?.patchDrive);

    // Social Links
    this.setHref('link-discord-hero', social?.discord);
    this.setHref('link-discord-card', social?.discord);
    this.setHref('link-discord-footer', social?.discord);
    this.setHref('link-whatsapp-card', social?.whatsapp);
    this.setHref('link-whatsapp-floating', social?.whatsapp);
    this.setHref('link-youtube-card', social?.youtube);
    this.setHref('link-tiktok-card', social?.tiktok);
    this.setHref('link-facebook-footer', social?.facebook);

    // Start / update countdown
    if (serverInfo?.openingDate) {
      this.startCountdown(serverInfo.openingDate);
    }
  },

  // Helper to set element text
  setText(id, text) {
    const el = document.getElementById(id);
    if (el && text !== undefined) el.textContent = text;
  },

  // Helper to set href
  setHref(id, url) {
    const el = document.getElementById(id);
    if (el && url) el.href = url;
  },

  // Fetch and render public news
  async loadNews() {
    const grid = document.getElementById('public-news-grid');
    if (!grid) return;

    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.success && data.data) {
        grid.innerHTML = data.data.map(item => `
          <article class="news-card">
            <div>
              <div class="news-meta">
                <span class="news-category">${item.category}</span>
                <span class="news-date"><i class="fa-regular fa-clock"></i> ${item.date}</span>
              </div>
              <h3 class="news-title">${item.title}</h3>
              <p class="news-summary">${item.summary}</p>
            </div>
            <a href="javascript:void(0)" onclick="App.openNewsDetail('${encodeURIComponent(item.title)}', '${encodeURIComponent(item.content)}')" class="news-read-more">
              <span>Leer Más</span> <i class="fa-solid fa-arrow-right"></i>
            </a>
          </article>
        `).join('');
      }
    } catch (err) {
      console.warn('Error loading public news:', err);
    }
  },

  openNewsDetail(title, content) {
    alert(`${decodeURIComponent(title)}\n\n${decodeURIComponent(content)}`);
  },

  // Countdown timer
  startCountdown(targetDateStr) {
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    const target = new Date(targetDateStr).getTime();

    const update = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        document.getElementById('cd-days').textContent = '00';
        document.getElementById('cd-hours').textContent = '00';
        document.getElementById('cd-mins').textContent = '00';
        document.getElementById('cd-secs').textContent = '00';
        const title = document.getElementById('countdown-title-text');
        if (title) title.textContent = '¡SERVIDOR ACTIVO!';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const dEl = document.getElementById('cd-days');
      const hEl = document.getElementById('cd-hours');
      const mEl = document.getElementById('cd-mins');
      const sEl = document.getElementById('cd-secs');

      if (dEl) dEl.textContent = String(days).padStart(2, '0');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(mins).padStart(2, '0');
      if (sEl) sEl.textContent = String(secs).padStart(2, '0');
    };

    update();
    this.countdownInterval = setInterval(update, 1000);
  },

  setupEventListeners() {
    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('main-nav-menu');
    if (mobileBtn && navMenu) {
      mobileBtn.addEventListener('click', () => {
        navMenu.classList.toggle('open');
      });
      // Close menu when clicking link
      navMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => navMenu.classList.remove('open'));
      });
    }

    // Download Hub Tabs
    const downloadTabBtns = document.querySelectorAll('.download-tab-btn');
    downloadTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');

        downloadTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.download-tab-content').forEach(c => {
          c.classList.remove('active');
        });
        const targetContent = document.getElementById(target);
        if (targetContent) targetContent.classList.add('active');
      });
    });

    // Login Form Submit
    const formLogin = document.getElementById('form-user-login');
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('login-username').value.trim();
        const pass = document.getElementById('login-password').value;
        const alertBox = document.getElementById('login-alert');

        if (alertBox) {
          alertBox.style.display = 'none';
          alertBox.className = 'form-alert';
        }

        try {
          const res = await Auth.login(user, pass);
          showToast(`¡Bienvenido, ${res.user.username}!`, 'success');
          closeModal('login-modal');
          formLogin.reset();
        } catch (err) {
          if (alertBox) {
            alertBox.textContent = err.message;
            alertBox.className = 'form-alert error';
          } else {
            showToast(err.message, 'error');
          }
        }
      });
    }

    // Register Form Submit
    const formRegister = document.getElementById('form-user-register');
    if (formRegister) {
      formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const pass = document.getElementById('reg-password').value;
        const passConfirm = document.getElementById('reg-password-confirm').value;
        const alertBox = document.getElementById('register-alert');

        if (alertBox) {
          alertBox.style.display = 'none';
          alertBox.className = 'form-alert';
        }

        if (pass !== passConfirm) {
          if (alertBox) {
            alertBox.textContent = 'Las contraseñas no coinciden';
            alertBox.className = 'form-alert error';
          }
          return;
        }

        try {
          const res = await Auth.register(user, email, pass);
          showToast('¡Cuenta creada con éxito! Ya puedes jugar.', 'success');
          closeModal('register-modal');
          formRegister.reset();
        } catch (err) {
          if (alertBox) {
            alertBox.textContent = err.message;
            alertBox.className = 'form-alert error';
          } else {
            showToast(err.message, 'error');
          }
        }
      });
    }

    // Claim Donation Form Submit
    const formClaim = document.getElementById('form-claim-donation');
    if (formClaim) {
      formClaim.addEventListener('submit', (e) => {
        e.preventDefault();
        const charName = document.getElementById('claim-char-name').value;
        const transId = document.getElementById('claim-trans-id').value;
        showToast(`Reporte enviado para el personaje "${charName}". El Staff lo validará en breve.`, 'success');
        closeModal('claim-donation-modal');
        formClaim.reset();
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
