# Cena de Beneficio · Mano Amiga

Gestión de invitados de la Cena de Beneficio del Colegio Mano Amiga Santa María (Fundación Mano Amiga).

Hecho con Next.js, TypeScript, Tailwind CSS y Firebase (Authentication + Firestore).

## Cómo funciona

**Organizadores** (`/ingresar` → `/admin`): ingresan con su cuenta de Google (solo los emails habilitados) y cargan:

- **Invitados**: nombre, DNI, contacto, empresa/grupo, mesa y asistencia. Cada uno tiene un link y un QR propios.
- **Empresas y grupos**: para empresas que compran una mesa y envían empleados (no hace falta cargar a cada uno). El grupo tiene su propio link/QR que muestra sus mesas.
- **Mesas**: número, nombre opcional y capacidad, con la ocupación de cada una.
- **Evento**: fecha, lugar, vestimenta e información que ven los invitados.

**Invitados** (sin cuenta): ven su mesa y los datos del evento de tres formas:

1. Abriendo su link personal `/invitacion/<código>`.
2. Escaneando su QR (lleva al mismo link).
3. Buscando su DNI en la página de inicio.

Un invitado sin mesa propia ve la mesa de su grupo.

### Seguridad

- Los invitados nunca acceden a la base de datos directamente. El servidor busca su invitación con Firebase Admin, así nadie puede listar a todos los invitados.
- Las reglas de Firestore (`firestore.rules`) solo dejan leer y escribir a las cuentas de Google cuyo email figura en la colección `organizadores`.
- Tené en cuenta que cualquiera que conozca el DNI de un invitado puede ver en qué mesa está.

## Puesta en marcha

### 1. Crear el proyecto de Firebase

1. Entrá a <https://console.firebase.google.com> y creá un proyecto.
2. **Authentication** → Comenzar → habilitá el proveedor **Google**.
3. **Firestore Database** → Crear base de datos (modo producción, ubicación `southamerica-east1` o la más cercana).
4. **Configuración del proyecto → General → Tus apps** → agregá una **app web**. Copiá los valores de `firebaseConfig`.
5. **Configuración del proyecto → Cuentas de servicio** → **Generar nueva clave privada**. Se descarga un JSON; no lo compartas ni lo subas a git.

### 2. Variables de entorno

Copiá `.env.example` como `.env.local` y completalo:

- Las variables `NEXT_PUBLIC_FIREBASE_*` salen del `firebaseConfig` de la app web.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY` salen del JSON de la cuenta de servicio. La clave va entre comillas y en una sola línea, con los `\n` tal como aparecen en el JSON.

### 3. Publicar las reglas de seguridad

```bash
npm run publicar-reglas
```

Publica `firestore.rules` en el proyecto. Repetilo cada vez que cambies ese archivo.

### 4. Habilitar organizadores

Cada organizador ingresa con su cuenta de Google. Solo pueden entrar los emails que habilites:

```bash
npm run organizadores -- agregar persona@gmail.com "Nombre Apellido"
npm run organizadores -- quitar persona@gmail.com
npm run organizadores -- listar
```

### 5. Ejecutar

```bash
npm install
npm run dev
```

Abrí <http://localhost:3000>. Para el panel de organizadores, abrí <http://localhost:3000/ingresar>.

## Publicar en internet (Vercel)

1. Subí el proyecto a GitHub e importalo en <https://vercel.com>.
2. Cargá las mismas variables de `.env.local` en **Settings → Environment Variables**.
3. En Firebase, **Authentication → Configuración → Dominios autorizados**, agregá el dominio de Vercel.

Los links y QR usan el dominio desde donde los genera el organizador. Generalos desde el sitio publicado, no desde `localhost`.

## Estructura

```
src/app/page.tsx                    Inicio: datos del evento + búsqueda por DNI
src/app/invitacion/[token]/         Página del invitado o grupo
src/app/ingresar/                   Login de organizadores
src/app/admin/                      Panel: resumen, invitados, grupos, mesas, evento
src/lib/consultas.ts                Consultas del servidor (Firebase Admin)
src/lib/firebase/                   Clientes de Firebase (navegador y servidor)
src/lib/tipos.ts                    Modelo de datos
firestore.rules                     Reglas de seguridad
scripts/organizadores.mjs           Alta y baja de organizadores
scripts/publicar-reglas.mjs         Publica firestore.rules
```

Los colores de la marca se definen en `src/app/globals.css`.
