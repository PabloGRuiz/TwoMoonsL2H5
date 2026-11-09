-- ========================================================================
-- L2 TWO MOONS - SUPABASE DATABASE SCHEMA
-- Proyecto: ickrcyzalgbcusepdmrc
-- ========================================================================

-- 1. TABLA SITE_CONTENT (Información, Rates, Descargas, Redes y Features)
create table if not exists public.site_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- Habilitar Row Level Security (RLS)
alter table public.site_content enable row level security;

-- Políticas: Lectura pública, escritura con service_role
create policy "Allow public read site_content"
  on public.site_content for select
  using (true);

create policy "Allow service_role write site_content"
  on public.site_content for all
  using (true);

-- 2. TABLA USERS (Cuentas de Jugadores y Administrador)
create table if not exists public.users (
  id text primary key,
  username text unique not null,
  email text,
  password text not null,
  role text not null default 'player',
  created_at timestamptz default now(),
  last_login timestamptz
);

alter table public.users enable row level security;

create policy "Allow service_role full access users"
  on public.users for all
  using (true);

-- 3. TABLA NEWS (Noticias, Parches y Eventos)
create table if not exists public.news (
  id text primary key,
  title text not null,
  category text not null default 'General',
  date text not null,
  summary text,
  content text not null,
  featured boolean default false,
  created_at timestamptz default now()
);

alter table public.news enable row level security;

create policy "Allow public read news"
  on public.news for select
  using (true);

create policy "Allow service_role write news"
  on public.news for all
  using (true);

-- ========================================================================
-- DATOS INICIALES POR DEFECTO (Si no existen)
-- ========================================================================

-- Insertar contenido inicial de la web
insert into public.site_content (id, data)
values (
  'main',
  '{
    "serverInfo": {
      "name": "L2 Two Moons",
      "chronicle": "High Five Part 5",
      "engine": "L2Off / Java Optimized Engine",
      "status": "ONLINE",
      "statusText": "Servidor Activo",
      "onlinePlayers": 642,
      "peakPlayers": 890,
      "openingDate": "2026-12-20T00:00:00",
      "slogan": "El despertar de las Dos Lunas",
      "subtitle": "Una experiencia High Five legendaria para la comunidad latina: equilibrio de clases, eventos masivos y estabilidad 24/7 sin Pay-To-Win.",
      "announcement": "🔥 ¡Gran Apertura Oficial el 20 de Diciembre a las 00:00! Descarga ya el Launcher y asegura tu cuenta."
    },
    "rates": {
      "exp": "x50",
      "sp": "x50",
      "adena": "x25",
      "drop": "x10",
      "spoil": "x10",
      "partyExp": "x1.5",
      "raidDrop": "x3",
      "safeEnchant": "+3 (+4 full armor)",
      "maxEnchantWeapon": "+16",
      "maxEnchantArmor": "+12",
      "blessedChance": "68%",
      "buffDuration": "2 Horas",
      "buffSlots": "28 + 4 Divine Inspiration",
      "danceSongSlots": "14 Slots",
      "autoLoot": "Habilitado (Excepto Grand Boss)",
      "autoLearnSkills": "Habilitado",
      "offlineShop": "Comando .offline",
      "subClass": "Subclase acumulativa o sin quest previa (Lvl 80)",
      "noblesse": "Quest simplificada o compra por Carmín de Boss"
    },
    "downloads": {
      "launcherName": "Two Moons Launcher v1.2",
      "launcherVersion": "1.2.0",
      "launcherSize": "8.5 MB",
      "launcherDirect": "https://mega.nz/twomoons-launcher",
      "clientMega": "https://mega.nz/twomoons-client-h5",
      "clientMediafire": "https://mediafire.com/twomoons-client-h5",
      "clientDrive": "https://drive.google.com/twomoons-client-h5",
      "patchMega": "https://mega.nz/twomoons-patch-system",
      "patchMediafire": "https://mediafire.com/twomoons-patch-system",
      "patchDrive": "https://drive.google.com/twomoons-patch-system",
      "systemRequirements": {
        "os": "Windows 7 / 10 / 11 (64-bit)",
        "ramMin": "4 GB RAM (8 GB recomendado)",
        "disk": "15 GB de espacio libre",
        "gpu": "DirectX 9.0c compatible",
        "connection": "Banda ancha estable"
      }
    },
    "social": {
      "discord": "https://discord.gg/twomoons",
      "whatsapp": "https://chat.whatsapp.com/twomoons",
      "youtube": "https://youtube.com/@l2twomoons",
      "tiktok": "https://tiktok.com/@l2twomoons",
      "facebook": "https://facebook.com/l2twomoons",
      "email": "contacto@l2twomoons.com"
    },
    "features": [
      {
        "id": "boss-jewels",
        "title": "Joyas Boss & Raras Escalonadas",
        "icon": "fa-gem",
        "description": "Sistema progresivo de Joyas Épicas y Raras por Tiers (Nivel 1 al 5) para que todos los jugadores puedan progresar de forma justa y desafiante."
      },
      {
        "id": "belts-cloaks",
        "title": "Belts & Capas Legendarias",
        "icon": "fa-shield-halved",
        "description": "Nuevas Belts y Capas personalizadas obtenibles mediante misiones de clan, cacería de Raid Bosses e intercambios de medallas PvP."
      },
      {
        "id": "auto-events",
        "title": "Eventos Automáticos Diarios",
        "icon": "fa-trophy",
        "description": "TvT (Team vs Team), CtF (Capture the Flag), Deathmatch y Torneos Last Hero cada 2 horas con recompensas automáticas en medallas y consumibles."
      },
      {
        "id": "farm-zones",
        "title": "Zonas de Farm Dinámicas & PvP Flag",
        "icon": "fa-dungeon",
        "description": "Zonas de cacería divididas en Solo Farm para jugadores casuales, Party Farm para clanes y Zonas PvP Flagged con drops mejorados."
      },
      {
        "id": "anti-cheat",
        "title": "Protección Anti-Bot & Anti-DDoS 24/7",
        "icon": "fa-lock",
        "description": "Servidor monitoreado con seguridad Active-Guard contra bots y ataques distribuidos, garantizando latencia ultra baja y combate 100% legítimo."
      },
      {
        "id": "fair-play",
        "title": "Comunidad & Economía Estable",
        "icon": "fa-scale-balanced",
        "description": "Economía de Adena cuidada. Donaciones transparentes y orientadas a cosméticos y servicios estéticos, preservando el espíritu competitivo."
      }
    ]
  }'::jsonb
)
on conflict (id) do nothing;

-- Insertar cuentas iniciales (Admin y Jugador de prueba)
insert into public.users (id, username, email, password, role)
values
  ('admin-1', 'admin', 'admin@l2twomoons.com', '$2b$10$wy0DAwGaF16OBRRLBYORfe6AZ.rJMSJZIRRbXkmcC7ucVeTbPWSdS', 'admin'),
  ('user-1790117637362', 'DarkAvenger', 'player@test.com', '$2b$10$WnvT1Rarqaldj/ZYbGu5vOxyAyXWYZo2EgAYbMlA2lOAiG.ZCFUbS', 'player')
on conflict (username) do nothing;

-- Insertar noticias iniciales
insert into public.news (id, title, category, date, summary, content, featured)
values
  ('news-1', '¡Inauguración Oficial de L2 Two Moons High Five!', 'Anuncio', '2026-09-22', 'Nos complace anunciar la apertura del servidor. Ya puedes descargar el Launcher oficial y registrar tu cuenta con anticipación.', 'Bienvenidos a L2 Two Moons. Tras meses de optimización en geodata, balance de clases y desarrollo de eventos, abrimos las puertas a la comunidad de habla hispana. ¡Preparen sus clanes!', true),
  ('news-2', 'Guía de Inicio Rápido & Zonas de Nivelación', 'Tutorial', '2026-09-20', 'Conoce dónde subir de nivel eficientemente, cómo funciona el NPC Buffer y las recompensas del Starter Kit para nuevos jugadores.', 'Al crear tu personaje recibirás un Starter Kit con armas sin grado, shot ilimitados de prueba y runas de experiencia para alcanzar nivel 40 en minutos.', false),
  ('news-3', 'Cronograma de Asedios de Castillos y Olimpiadas', 'Eventos', '2026-09-18', 'El ciclo de Olimpiadas será quincenal y los primeros asedios a Aden y Giran comenzarán el segundo fin de semana.', 'Las batallas por los castillos otorgarán puntos de clan, habilidades de señorío y bonificaciones en las tiendas de territorio para todos los integrantes.', false)
on conflict (id) do nothing;

