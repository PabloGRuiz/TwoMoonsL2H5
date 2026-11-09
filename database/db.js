const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const DB_DIR = __dirname;
const USERS_FILE = path.join(DB_DIR, 'users.json');
const CONTENT_FILE = path.join(DB_DIR, 'site-content.json');
const NEWS_FILE = path.join(DB_DIR, 'news.json');

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ickrcyzalgbcusepdmrc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
    console.log('[Database] Supabase client initialized:', SUPABASE_URL);
  } catch (err) {
    console.warn('[Database] Failed to initialize Supabase client:', err.message);
  }
}

// Default initial content
const defaultContent = {
  serverInfo: {
    name: "L2 Two Moons",
    chronicle: "High Five Part 5",
    engine: "L2Off / Java Optimized Engine",
    status: "ONLINE",
    statusText: "Servidor Activo",
    onlinePlayers: 642,
    peakPlayers: 890,
    openingDate: "2026-12-20T00:00:00",
    slogan: "El despertar de las Dos Lunas",
    subtitle: "Una experiencia High Five legendaria para la comunidad latina: equilibrio de clases, eventos masivos y estabilidad 24/7 sin Pay-To-Win.",
    announcement: "🔥 ¡Gran Apertura Oficial el 20 de Diciembre a las 00:00! Descarga ya el Launcher y asegura tu cuenta."
  },
  rates: {
    exp: "x50",
    sp: "x50",
    adena: "x25",
    drop: "x10",
    spoil: "x10",
    partyExp: "x1.5",
    raidDrop: "x3",
    safeEnchant: "+3 (+4 full armor)",
    maxEnchantWeapon: "+16",
    maxEnchantArmor: "+12",
    blessedChance: "68%",
    buffDuration: "2 Horas",
    buffSlots: "28 + 4 Divine Inspiration",
    danceSongSlots: "14 Slots",
    autoLoot: "Habilitado (Excepto Grand Boss)",
    autoLearnSkills: "Habilitado",
    offlineShop: "Comando .offline",
    subClass: "Subclase acumulativa o sin quest previa (Lvl 80)",
    noblesse: "Quest simplificada o compra por Carmín de Boss"
  },
  downloads: {
    launcherName: "Two Moons Launcher v1.2",
    launcherVersion: "1.2.0",
    launcherSize: "8.5 MB",
    launcherDirect: "https://mega.nz/twomoons-launcher",
    clientMega: "https://mega.nz/twomoons-client-h5",
    clientMediafire: "https://mediafire.com/twomoons-client-h5",
    clientDrive: "https://drive.google.com/twomoons-client-h5",
    patchMega: "https://mega.nz/twomoons-patch-system",
    patchMediafire: "https://mediafire.com/twomoons-patch-system",
    patchDrive: "https://drive.google.com/twomoons-patch-system",
    systemRequirements: {
      os: "Windows 7 / 10 / 11 (64-bit)",
      ramMin: "4 GB RAM (8 GB recomendado)",
      disk: "15 GB de espacio libre",
      gpu: "DirectX 9.0c compatible",
      connection: "Banda ancha estable"
    }
  },
  social: {
    discord: "https://discord.gg/twomoons",
    whatsapp: "https://chat.whatsapp.com/twomoons",
    youtube: "https://youtube.com/@l2twomoons",
    tiktok: "https://www.tiktok.com/@gm.wolfred",
    facebook: "https://facebook.com/l2twomoons",
    email: "contacto@l2twomoons.com"
  },
  features: [
    {
      id: "boss-jewels",
      title: "Joyas Boss & Raras Escalonadas",
      icon: "fa-gem",
      description: "Sistema progresivo de Joyas Épicas y Raras por Tiers (Nivel 1 al 5) para que todos los jugadores puedan progresar de forma justa y desafiante."
    },
    {
      id: "belts-cloaks",
      title: "Belts & Capas Legendarias",
      icon: "fa-shield-halved",
      description: "Nuevas Belts y Capas personalizadas obtenibles mediante misiones de clan, cacería de Raid Bosses e intercambios de medallas PvP."
    },
    {
      id: "auto-events",
      title: "Eventos Automáticos Diarios",
      icon: "fa-trophy",
      description: "TvT (Team vs Team), CtF (Capture the Flag), Deathmatch y Torneos Last Hero cada 2 horas con recompensas automáticas en medallas y consumibles."
    },
    {
      id: "farm-zones",
      title: "Zonas de Farm Dinámicas & PvP Flag",
      icon: "fa-dungeon",
      description: "Zonas de cacería divididas en Solo Farm para jugadores casuales, Party Farm para clanes y Zonas PvP Flagged con drops mejorados."
    },
    {
      id: "anti-cheat",
      title: "Protección Anti-Bot & Anti-DDoS 24/7",
      icon: "fa-lock",
      description: "Servidor monitoreado con seguridad Active-Guard contra bots y ataques distribuidos, garantizando latencia ultra baja y combate 100% legítimo."
    },
    {
      id: "fair-play",
      title: "Comunidad & Economía Estable",
      icon: "fa-scale-balanced",
      description: "Economía de Adena cuidada. Donaciones transparentes y orientadas a cosméticos y servicios estéticos, preservando el espíritu competitivo."
    }
  ]
};

// Default initial news
const defaultNews = [
  {
    id: "news-1",
    title: "¡Inauguración Oficial de L2 Two Moons High Five!",
    category: "Anuncio",
    date: "2026-09-22",
    summary: "Nos complace anunciar la apertura del servidor. Ya puedes descargar el Launcher oficial y registrar tu cuenta con anticipación.",
    content: "Bienvenidos a L2 Two Moons. Tras meses de optimización en geodata, balance de clases y desarrollo de eventos, abrimos las puertas a la comunidad de habla hispana. ¡Preparen sus clanes!",
    featured: true
  },
  {
    id: "news-2",
    title: "Guía de Inicio Rápido & Zonas de Nivelación",
    category: "Tutorial",
    date: "2026-09-20",
    summary: "Conoce dónde subir de nivel eficientemente, cómo funciona el NPC Buffer y las recompensas del Starter Kit para nuevos jugadores.",
    content: "Al crear tu personaje recibirás un Starter Kit con armas sin grado, shot ilimitados de prueba y runas de experiencia para alcanzar nivel 40 en minutos.",
    featured: false
  },
  {
    id: "news-3",
    title: "Cronograma de Asedios de Castillos y Olimpiadas",
    category: "Eventos",
    date: "2026-09-18",
    summary: "El ciclo de Olimpiadas será quincenal y los primeros asedios a Aden y Giran comenzarán el segundo fin de semana.",
    content: "Las batallas por los castillos otorgarán puntos de clan, habilidades de señorío y bonificaciones en las tiendas de territorio para todos los integrantes.",
    featured: false
  }
];

// Helper to safely read JSON locally
function readJSON(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return fallback;
  }
}

// Helper to safely write JSON locally (when filesystem is writable)
function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    // Expected on serverless read-only filesystems like Vercel
  }
}

// Initialize DB
async function initDB() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('site_content').select('id').eq('id', 'main').maybeSingle();
      if (!error && !data) {
        console.log('[Database] Seeding initial site_content into Supabase...');
        await supabase.from('site_content').insert({ id: 'main', data: getContentFallback() });
      }
    } catch (e) {
      console.warn('[Database] Supabase check notice:', e.message);
    }
  }

  // Ensure local files exist in dev
  if (!fs.existsSync(CONTENT_FILE)) writeJSON(CONTENT_FILE, defaultContent);
  if (!fs.existsSync(NEWS_FILE)) writeJSON(NEWS_FILE, defaultNews);
  if (!fs.existsSync(USERS_FILE)) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('twomoonsadmin2026!', salt);
    writeJSON(USERS_FILE, [
      {
        id: "admin-1",
        username: "admin",
        email: "admin@l2twomoons.com",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date().toISOString(),
        lastLogin: null
      }
    ]);
  }
}

function getContentFallback() {
  return readJSON(CONTENT_FILE, defaultContent);
}

// ========================
// CONTENT OPERATIONS
// ========================

async function getContent() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('data')
        .eq('id', 'main')
        .maybeSingle();

      if (!error && data && data.data) {
        return data.data;
      }
    } catch (err) {
      console.warn('[Database] Error fetching content from Supabase:', err.message);
    }
  }
  return getContentFallback();
}

async function updateContent(newContent) {
  const current = await getContent();
  const merged = { ...current, ...newContent };

  if (supabase) {
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({ id: 'main', data: merged, updated_at: new Date().toISOString() });
      if (error) console.warn('[Database] Supabase updateContent error:', error.message);
    } catch (err) {
      console.warn('[Database] Supabase updateContent exception:', err.message);
    }
  }

  writeJSON(CONTENT_FILE, merged);
  return merged;
}

// ========================
// NEWS OPERATIONS
// ========================

async function getNews() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('[Database] Error fetching news from Supabase:', err.message);
    }
  }
  return readJSON(NEWS_FILE, defaultNews);
}

async function createNews(newsItem) {
  const newItem = {
    id: 'news-' + Date.now(),
    date: new Date().toISOString().split('T')[0],
    featured: false,
    ...newsItem
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('news').insert(newItem).select().single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('[Database] Error inserting news in Supabase:', err.message);
    }
  }

  const news = readJSON(NEWS_FILE, defaultNews);
  news.unshift(newItem);
  writeJSON(NEWS_FILE, news);
  return newItem;
}

async function updateNews(id, updatedFields) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('news')
        .update(updatedFields)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('[Database] Error updating news in Supabase:', err.message);
    }
  }

  const news = readJSON(NEWS_FILE, defaultNews);
  const idx = news.findIndex(n => n.id === id);
  if (idx === -1) return null;
  news[idx] = { ...news[idx], ...updatedFields };
  writeJSON(NEWS_FILE, news);
  return news[idx];
}

async function deleteNews(id) {
  if (supabase) {
    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('[Database] Error deleting news in Supabase:', err.message);
    }
  }

  let news = readJSON(NEWS_FILE, defaultNews);
  const initialLength = news.length;
  news = news.filter(n => n.id !== id);
  if (news.length !== initialLength) {
    writeJSON(NEWS_FILE, news);
    return true;
  }
  return false;
}

// ========================
// USER OPERATIONS
// ========================

async function getUsers() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, role, created_at, last_login')
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          createdAt: u.created_at,
          lastLogin: u.last_login
        }));
      }
    } catch (err) {
      console.warn('[Database] Error fetching users from Supabase:', err.message);
    }
  }

  return readJSON(USERS_FILE, []);
}

async function findUserByUsername(username) {
  const cleanUsername = username.trim();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', cleanUsername)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          username: data.username,
          email: data.email,
          password: data.password,
          role: data.role,
          createdAt: data.created_at,
          lastLogin: data.last_login
        };
      }
    } catch (err) {
      console.warn('[Database] Error finding user in Supabase:', err.message);
    }
  }

  const users = readJSON(USERS_FILE, []);
  return users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase()) || null;
}

async function findUserById(id) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          username: data.username,
          email: data.email,
          password: data.password,
          role: data.role,
          createdAt: data.created_at,
          lastLogin: data.last_login
        };
      }
    } catch (err) {
      console.warn('[Database] Error finding user by id in Supabase:', err.message);
    }
  }

  const users = readJSON(USERS_FILE, []);
  return users.find(u => u.id === id) || null;
}

async function createUser(username, email, plainPassword, role = 'player') {
  const cleanUsername = username.trim();
  const existing = await findUserByUsername(cleanUsername);
  if (existing) {
    throw new Error('El nombre de usuario ya está registrado');
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(plainPassword, salt);
  const newUser = {
    id: 'user-' + Date.now(),
    username: cleanUsername,
    email: email ? email.trim() : '',
    password: hashedPassword,
    role,
    created_at: new Date().toISOString(),
    last_login: null
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
          createdAt: data.created_at
        };
      }
    } catch (err) {
      console.warn('[Database] Error creating user in Supabase:', err.message);
    }
  }

  const users = readJSON(USERS_FILE, []);
  users.push({
    ...newUser,
    createdAt: newUser.created_at,
    lastLogin: newUser.last_login
  });
  writeJSON(USERS_FILE, users);

  return {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role
  };
}

async function updateUserPassword(id, newPlainPassword) {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(newPlainPassword, salt);

  if (supabase) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('[Database] Error updating password in Supabase:', err.message);
    }
  }

  const users = readJSON(USERS_FILE, []);
  const user = users.find(u => u.id === id);
  if (!user) throw new Error('Usuario no encontrado');
  user.password = hashedPassword;
  writeJSON(USERS_FILE, users);
  return true;
}

async function updateLastLogin(id) {
  const now = new Date().toISOString();
  if (supabase) {
    try {
      await supabase.from('users').update({ last_login: now }).eq('id', id);
    } catch (err) {
      // ignore
    }
  }

  const users = readJSON(USERS_FILE, []);
  const user = users.find(u => u.id === id);
  if (user) {
    user.lastLogin = now;
    writeJSON(USERS_FILE, users);
  }
}

module.exports = {
  supabase,
  initDB,
  getContent,
  updateContent,
  getNews,
  createNews,
  updateNews,
  deleteNews,
  getUsers,
  findUserByUsername,
  findUserById,
  createUser,
  updateUserPassword,
  updateLastLogin
};
