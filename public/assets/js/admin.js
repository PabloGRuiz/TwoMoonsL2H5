// ==========================================================================
// ADMIN CMS MODULE - L2 TWO MOONS
// Powers live editing of rates, downloads, server status, news and users
// ==========================================================================

const AdminCMS = {
  activeContent: null,

  async init() {
    this.setupTabNavigation();
    this.setupFormListeners();
  },

  // Switch between admin tabs (General, Rates, Descargas, etc.)
  setupTabNavigation() {
    const navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTab = item.getAttribute('data-tab');
        
        // Update active nav button
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Update active pane
        document.querySelectorAll('.admin-tab-pane').forEach(pane => {
          pane.classList.remove('active');
        });
        const activePane = document.getElementById(targetTab);
        if (activePane) activePane.classList.add('active');

        // If user opened users or news tab, refresh their data
        if (targetTab === 'admin-tab-users') {
          this.loadUsersList();
        } else if (targetTab === 'admin-tab-news') {
          this.loadNewsAdminList();
        }
      });
    });
  },

  // Open Admin CMS Modal and populate all form fields with current data
  async openDashboard() {
    if (!Auth.isAdmin()) {
      showToast('No tienes permisos de Administrador', 'error');
      return;
    }

    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      if (data.success && data.data) {
        this.activeContent = data.data;
        this.populateForms(data.data);
      }
    } catch (err) {
      console.error('Error loading content for admin:', err);
    }

    openModal('admin-cms-modal');
  },

  // Populate inputs with current database values
  populateForms(content) {
    if (!content) return;
    const { serverInfo, rates, downloads, social } = content;

    // General
    this.setValue('adm-server-name', serverInfo?.name);
    this.setValue('adm-server-chronicle', serverInfo?.chronicle);
    this.setValue('adm-server-engine', serverInfo?.engine);
    this.setValue('adm-server-players', serverInfo?.onlinePlayers);
    this.setValue('adm-server-slogan', serverInfo?.slogan);
    this.setValue('adm-server-subtitle', serverInfo?.subtitle);
    this.setValue('adm-server-announcement', serverInfo?.announcement);

    // Status Radio
    const statusRadio = document.querySelector(`input[name="server_status"][value="${serverInfo?.status}"]`);
    if (statusRadio) statusRadio.checked = true;

    // Rates
    this.setValue('adm-rate-exp', rates?.exp);
    this.setValue('adm-rate-sp', rates?.sp);
    this.setValue('adm-rate-adena', rates?.adena);
    this.setValue('adm-rate-drop', rates?.drop);
    this.setValue('adm-rate-spoil', rates?.spoil);
    this.setValue('adm-rate-party', rates?.partyExp);
    this.setValue('adm-rate-raid', rates?.raidDrop);
    this.setValue('adm-safe-enchant', rates?.safeEnchant);
    this.setValue('adm-max-enchant-weapon', rates?.maxEnchantWeapon);
    this.setValue('adm-max-enchant-armor', rates?.maxEnchantArmor);
    this.setValue('adm-buff-duration', rates?.buffDuration);
    this.setValue('adm-buff-slots', rates?.buffSlots);
    this.setValue('adm-subclass', rates?.subClass);
    this.setValue('adm-noblesse', rates?.noblesse);

    // Downloads
    this.setValue('adm-dl-launcher-name', downloads?.launcherName);
    this.setValue('adm-dl-launcher-ver', downloads?.launcherVersion);
    this.setValue('adm-dl-launcher-url', downloads?.launcherDirect);
    this.setValue('adm-dl-client-mega', downloads?.clientMega);
    this.setValue('adm-dl-client-mediafire', downloads?.clientMediafire);
    this.setValue('adm-dl-client-drive', downloads?.clientDrive);
    this.setValue('adm-dl-patch-mega', downloads?.patchMega);
    this.setValue('adm-dl-patch-mediafire', downloads?.patchMediafire);
    this.setValue('adm-dl-patch-drive', downloads?.patchDrive);

    // Social
    this.setValue('adm-social-discord', social?.discord);
    this.setValue('adm-social-whatsapp', social?.whatsapp);
    this.setValue('adm-social-youtube', social?.youtube);
    this.setValue('adm-social-tiktok', social?.tiktok);
    this.setValue('adm-social-facebook', social?.facebook);
    this.setValue('adm-social-email', social?.email);
  },

  setValue(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  },

  getValue(id, fallback = '') {
    const el = document.getElementById(id);
    return el ? el.value.trim() : fallback;
  },

  setupFormListeners() {
    // Save General
    const formGeneral = document.getElementById('form-admin-general');
    if (formGeneral) {
      formGeneral.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedStatus = document.querySelector('input[name="server_status"]:checked')?.value || 'ONLINE';
        const payload = {
          serverInfo: {
            ...this.activeContent?.serverInfo,
            name: this.getValue('adm-server-name'),
            chronicle: this.getValue('adm-server-chronicle'),
            engine: this.getValue('adm-server-engine'),
            onlinePlayers: parseInt(this.getValue('adm-server-players'), 10) || 0,
            slogan: this.getValue('adm-server-slogan'),
            subtitle: this.getValue('adm-server-subtitle'),
            announcement: this.getValue('adm-server-announcement'),
            status: selectedStatus,
            statusText: selectedStatus === 'ONLINE' ? 'Servidor Activo' : (selectedStatus === 'MAINTENANCE' ? 'Mantenimiento' : 'Próximamente')
          }
        };
        this.saveContentUpdate(payload);
      });
    }

    // Save Rates
    const formRates = document.getElementById('form-admin-rates');
    if (formRates) {
      formRates.addEventListener('submit', (e) => {
        e.preventDefault();
        const payload = {
          rates: {
            ...this.activeContent?.rates,
            exp: this.getValue('adm-rate-exp'),
            sp: this.getValue('adm-rate-sp'),
            adena: this.getValue('adm-rate-adena'),
            drop: this.getValue('adm-rate-drop'),
            spoil: this.getValue('adm-rate-spoil'),
            partyExp: this.getValue('adm-rate-party'),
            raidDrop: this.getValue('adm-rate-raid'),
            safeEnchant: this.getValue('adm-safe-enchant'),
            maxEnchantWeapon: this.getValue('adm-max-enchant-weapon'),
            maxEnchantArmor: this.getValue('adm-max-enchant-armor'),
            buffDuration: this.getValue('adm-buff-duration'),
            buffSlots: this.getValue('adm-buff-slots'),
            subClass: this.getValue('adm-subclass'),
            noblesse: this.getValue('adm-noblesse')
          }
        };
        this.saveContentUpdate(payload);
      });
    }

    // Save Downloads
    const formDownloads = document.getElementById('form-admin-downloads');
    if (formDownloads) {
      formDownloads.addEventListener('submit', (e) => {
        e.preventDefault();
        const payload = {
          downloads: {
            ...this.activeContent?.downloads,
            launcherName: this.getValue('adm-dl-launcher-name'),
            launcherVersion: this.getValue('adm-dl-launcher-ver'),
            launcherDirect: this.getValue('adm-dl-launcher-url'),
            clientMega: this.getValue('adm-dl-client-mega'),
            clientMediafire: this.getValue('adm-dl-client-mediafire'),
            clientDrive: this.getValue('adm-dl-client-drive'),
            patchMega: this.getValue('adm-dl-patch-mega'),
            patchMediafire: this.getValue('adm-dl-patch-mediafire'),
            patchDrive: this.getValue('adm-dl-patch-drive')
          }
        };
        this.saveContentUpdate(payload);
      });
    }

    // Save Social
    const formSocial = document.getElementById('form-admin-social');
    if (formSocial) {
      formSocial.addEventListener('submit', (e) => {
        e.preventDefault();
        const payload = {
          social: {
            discord: this.getValue('adm-social-discord'),
            whatsapp: this.getValue('adm-social-whatsapp'),
            youtube: this.getValue('adm-social-youtube'),
            tiktok: this.getValue('adm-social-tiktok'),
            facebook: this.getValue('adm-social-facebook'),
            email: this.getValue('adm-social-email')
          }
        };
        this.saveContentUpdate(payload);
      });
    }

    // Create News Form
    const formCreateNews = document.getElementById('form-admin-create-news');
    if (formCreateNews) {
      formCreateNews.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = this.getValue('adm-news-title');
        const category = this.getValue('adm-news-category');
        const summary = this.getValue('adm-news-summary');
        const content = this.getValue('adm-news-content');

        if (!title || !content) {
          showToast('Por favor completa título y contenido', 'error');
          return;
        }

        try {
          const res = await fetch('/api/admin/news', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Auth.getToken()}`
            },
            body: JSON.stringify({ title, category, summary, content })
          });
          const data = await res.json();
          if (data.success) {
            showToast('¡Noticia publicada con éxito!', 'success');
            formCreateNews.reset();
            this.loadNewsAdminList();
            App.loadNews(); // refresh public news
          } else {
            showToast(data.message || 'Error al publicar noticia', 'error');
          }
        } catch (err) {
          showToast('Error de conexión', 'error');
        }
      });
    }

    // Change Admin Password Form
    const formPass = document.getElementById('form-admin-password');
    if (formPass) {
      formPass.addEventListener('submit', async (e) => {
        e.preventDefault();
        const curPass = this.getValue('adm-pass-current');
        const newPass = this.getValue('adm-pass-new');
        const newPassConfirm = this.getValue('adm-pass-confirm');

        if (newPass !== newPassConfirm) {
          showToast('Las contraseñas nuevas no coinciden', 'error');
          return;
        }

        try {
          await Auth.changePassword(curPass, newPass);
          showToast('¡Contraseña de administrador actualizada!', 'success');
          formPass.reset();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    }
  },

  // Send update to server and instantly refresh frontend
  async saveContentUpdate(payload) {
    const token = Auth.getToken();
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('¡Cambios guardados y aplicados a la web!', 'success');
        this.activeContent = data.data;
        // Instantly re-render public site
        App.renderContent(data.data);
      } else {
        showToast(data.message || 'Error al guardar cambios', 'error');
      }
    } catch (err) {
      showToast('Error de red al guardar contenido', 'error');
    }
  },

  // Load news list in admin pane with delete button
  async loadNewsAdminList() {
    const container = document.getElementById('admin-news-list');
    if (!container) return;

    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.success && data.data) {
        container.innerHTML = data.data.map(item => `
          <div class="news-admin-item">
            <div class="news-admin-info">
              <h5>${item.title}</h5>
              <span><i class="fa-solid fa-tag"></i> ${item.category} | <i class="fa-regular fa-calendar"></i> ${item.date}</span>
            </div>
            <div class="news-admin-actions">
              <button class="btn-icon-danger" onclick="AdminCMS.deleteNewsItem('${item.id}')" title="Eliminar noticia">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        `).join('');
      }
    } catch (err) {
      container.innerHTML = '<p class="text-muted">Error al cargar noticias</p>';
    }
  },

  async deleteNewsItem(id) {
    if (!confirm('¿Seguro que deseas eliminar esta noticia?')) return;
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Noticia eliminada correctamente', 'success');
        this.loadNewsAdminList();
        App.loadNews();
      }
    } catch {
      showToast('Error al eliminar noticia', 'error');
    }
  },

  // Load registered users list
  async loadUsersList() {
    const tbody = document.getElementById('admin-users-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1.5rem;">Cargando jugadores...</td></tr>';

    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay usuarios registrados</td></tr>';
          return;
        }

        tbody.innerHTML = data.data.map((u, i) => `
          <tr>
            <td>#${i + 1}</td>
            <td><strong>${u.username}</strong></td>
            <td>${u.email || '<span style="color:#64748b;">Sin correo</span>'}</td>
            <td><span class="role-badge ${u.role}">${u.role}</span></td>
            <td>${new Date(u.createdAt).toLocaleDateString()}</td>
          </tr>
        `).join('');
      }
    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#fca5a5;">Error al cargar lista de usuarios</td></tr>';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminCMS.init();
});
