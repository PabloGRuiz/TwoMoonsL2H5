const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'l2_twomoons_ultra_secret_key_2026';

// Initialize DB
db.initDB().catch(err => console.warn('[Database] initDB warning:', err.message));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Middlewares
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Acceso no autorizado: Token requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Sesión inválida o expirada' });
    }
    req.user = decoded;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado: Se requieren permisos de Administrador' });
  }
  next();
}

// ---------------- PUBLIC / CONTENT ROUTES ---------------- //

// Get public website content
app.get('/api/content', async (req, res) => {
  try {
    const content = await db.getContent();
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el contenido', error: error.message });
  }
});

// Get public news
app.get('/api/news', async (req, res) => {
  try {
    const news = await db.getNews();
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener noticias', error: error.message });
  }
});

// ---------------- AUTH ROUTES ---------------- //

// Register a new player account
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña son obligatorios' });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'El usuario debe tener al menos 3 caracteres' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const newUser = await db.createUser(username, email, password, 'player');

    // Auto login: generate token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: '¡Cuenta creada con éxito! Bienvenido a L2 Two Moons.',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Login (players and admin)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Por favor ingresa usuario y contraseña' });
    }

    const user = await db.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

    await db.updateLastLogin(user.id);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: user.role === 'admin' ? '¡Bienvenido Administrador!' : '¡Inicio de sesión exitoso!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error durante el inicio de sesión', error: error.message });
  }
});

// Check current session
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al verificar sesión' });
  }
});

// Change user password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const match = bcrypt.compareSync(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta' });
    }

    await db.updateUserPassword(user.id, newPassword);
    res.json({ success: true, message: 'Contraseña actualizada con éxito' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar contraseña' });
  }
});

// ---------------- ADMIN CMS ROUTES ---------------- //

// Update website content (rates, serverInfo, downloads, social, features)
app.put('/api/admin/content', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updated = await db.updateContent(req.body);
    res.json({
      success: true,
      message: '¡Contenido del sitio actualizado con éxito!',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar el contenido', error: error.message });
  }
});

// Create news
app.post('/api/admin/news', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, category, summary, content, featured } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Título y contenido son obligatorios' });
    }

    const item = await db.createNews({
      title,
      category: category || 'General',
      summary: summary || title,
      content,
      featured: Boolean(featured)
    });

    res.status(201).json({ success: true, message: 'Noticia publicada con éxito', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al publicar noticia', error: error.message });
  }
});

// Update news
app.put('/api/admin/news/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.updateNews(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Noticia no encontrada' });
    }
    res.json({ success: true, message: 'Noticia actualizada con éxito', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar noticia', error: error.message });
  }
});

// Delete news
app.delete('/api/admin/news/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteNews(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Noticia no encontrada' });
    }
    res.json({ success: true, message: 'Noticia eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar noticia', error: error.message });
  }
});

// List registered users (for admin overview)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rawUsers = await db.getUsers();
    const users = rawUsers.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin
    }));
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al listar usuarios', error: error.message });
  }
});

// Export app for Vercel Serverless Function
module.exports = app;

// Start Server locally if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  L2 Two Moons Web Server Running on port ${PORT}`);
    console.log(`  Local URL: http://localhost:${PORT}`);
    console.log(`===============================================`);
  });
}
