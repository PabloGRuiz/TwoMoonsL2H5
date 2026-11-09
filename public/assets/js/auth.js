// ==========================================================================
// AUTHENTICATION MODULE - L2 TWO MOONS
// Manages player and admin sessions, registration, login and state sync
// ==========================================================================

const Auth = {
  TOKEN_KEY: 'twomoons_auth_token',
  USER_KEY: 'twomoons_user_data',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.updateUI();
  },

  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.updateUI();
  },

  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  },

  // Verify token with server on load
  async checkSession() {
    const token = this.getToken();
    if (!token) {
      this.updateUI();
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
      } else {
        this.clearSession();
      }
    } catch (err) {
      console.warn('Session check failed:', err);
    }
    this.updateUI();
  },

  // Login
  async login(username, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Error en inicio de sesión');
    }
    this.setSession(data.token, data.user);
    return data;
  },

  // Register
  async register(username, email, password) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Error en registro');
    }
    this.setSession(data.token, data.user);
    return data;
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    const token = this.getToken();
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Error al cambiar contraseña');
    }
    return data;
  },

  // Update DOM elements depending on login status
  updateUI() {
    const user = this.getUser();
    const adminTopBar = document.getElementById('admin-topbar');
    const guestNavAuth = document.getElementById('nav-guest-actions');
    const userNavAuth = document.getElementById('nav-user-actions');
    const userNameLabel = document.getElementById('nav-username-label');
    const userRoleTag = document.getElementById('nav-user-role-tag');

    if (user) {
      if (guestNavAuth) guestNavAuth.style.display = 'none';
      if (userNavAuth) userNavAuth.style.display = 'flex';
      if (userNameLabel) userNameLabel.textContent = user.username;
      if (userRoleTag) {
        userRoleTag.textContent = user.role === 'admin' ? 'Admin' : 'Jugador';
        userRoleTag.className = `role-badge ${user.role}`;
      }

      // Show/hide admin top bar and admin edit button
      if (adminTopBar) {
        if (user.role === 'admin') {
          adminTopBar.classList.add('active');
          const adminNameDisp = document.getElementById('admin-display-name');
          if (adminNameDisp) adminNameDisp.textContent = user.username;
        } else {
          adminTopBar.classList.remove('active');
        }
      }
    } else {
      if (guestNavAuth) guestNavAuth.style.display = 'flex';
      if (userNavAuth) userNavAuth.style.display = 'none';
      if (adminTopBar) adminTopBar.classList.remove('active');
    }
  }
};

// Global Toast Notification Helper
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-triangle';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Global modal helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modals when clicking backdrop
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // Check user session immediately
  Auth.checkSession();
});
