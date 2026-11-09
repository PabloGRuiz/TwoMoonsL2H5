# L2 Two Moons - Servidor Privado Lineage II High Five

Sitio web oficial para el servidor de Lineage 2 High Five (H5 Part 5) **L2 Two Moons**, con panel de administración CMS en vivo, gestión de cuentas y base de datos en **Supabase**, preparado para despliegue serverless en **Vercel**.

---

## 🚀 Despliegue en Vercel

1. Importa el repositorio en tu panel de [Vercel](https://vercel.com/new).
2. Configura las siguientes Variables de Entorno en Vercel (*Settings -> Environment Variables*):
   * `SUPABASE_URL`: `https://ickrcyzalgbcusepdmrc.supabase.co`
   * `SUPABASE_ANON_KEY`: *(Tu Supabase Default Publishable Key)*
   * `SUPABASE_SERVICE_ROLE_KEY`: *(Tu Supabase Secret Key)*
   * `JWT_SECRET`: `l2_twomoons_ultra_secret_key_2026`
3. Haz clic en **Deploy**.

---

## 🗄️ Base de Datos Supabase

Para inicializar las tablas en tu proyecto de Supabase (`ickrcyzalgbcusepdmrc`):
1. Abre el panel de **SQL Editor** en tu proyecto de Supabase.
2. Copia y pega el contenido del archivo `supabase_schema.sql`.
3. Haz clic en **Run**.

Esto creará automáticamente:
* `site_content`: Almacena información del servidor, rates, links de descargas y redes sociales editables desde el CMS.
* `users`: Cuentas de jugadores y administrador con contraseñas encriptadas con bcrypt.
* `news`: Noticias, notas de parche y anuncios del servidor.

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor local
npm start
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

* **Cuenta Administrador por defecto:**
  * Usuario: `admin`
  * Contraseña: `twomoonsadmin2026!`
