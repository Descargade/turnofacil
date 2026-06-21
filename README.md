# TurnoFácil

Plataforma SaaS de gestión de turnos para barberías, peluquerías, estudios de tatuajes y consultorios odontológicos.

## Características principales

- **Landing page** premium optimizada para conversión
- **Sistema de autenticación** con roles (Super Admin, Admin del negocio, Cliente)
- **Dashboard** con métricas en tiempo real
- **Calendario** con vistas diaria, semanal y mensual
- **Gestión de servicios** con categorías, precios y duraciones
- **Gestión de equipo** con especialidades y disponibilidad horaria
- **Sistema de turnos** con reserva pública, confirmación, cancelación y reprogramación
- **Gestión de clientes** con historial de turnos
- **Configuración del negocio** (logo, colores, redes sociales, WhatsApp)
- **Sistema de suscripción** con periodo de prueba de 30 días
- **Reserva pública** para clientes externos
- **Multi-tenant** con aislamiento completo de datos
- **Mobile-first** y responsive completo

## Tecnologías

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **UI:** Shadcn UI (Radix UI primitives)
- **Backend:** Next.js API Routes, Prisma 7, PostgreSQL
- **Autenticación:** NextAuth v5 (Credentials Provider)
- **Validación:** Zod v4
- **Estado:** Zustand, React Query

## Requisitos previos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd turnofacil
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar el archivo `.env` con tus datos:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/turnos_saas?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secreto-super-seguro"
```

### 4. Configurar la base de datos

```bash
# Generar cliente de Prisma
npx prisma generate

# Crear migraciones
npx prisma migrate dev

# Cargar datos de ejemplo
npx prisma db seed
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Credenciales de demostración

### Super Admin
- **Email:** admin@turnofacil.com
- **Contraseña:** Admin123!

### Dueño de negocio
- **Email:** carlos@barberiaelcorte.com
- **Contraseña:** Carlos123!

### Reserva pública
Accedé a `http://localhost:3000/barberia-el-corte` para probar el flujo de reserva público.

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/              # Páginas de autenticación
│   │   ├── login/
│   │   └── registro/
│   ├── (dashboard)/         # Panel de administración
│   │   ├── dashboard/
│   │   ├── servicios/
│   │   ├── equipo/
│   │   ├── calendario/
│   │   ├── turnos/
│   │   ├── clientes/
│   │   ├── configuracion/
│   │   └── suscripcion/
│   ├── (public)/            # Páginas públicas
│   │   └── [businessSlug]/
│   ├── api/                 # API Routes
│   │   ├── auth/
│   │   ├── services/
│   │   ├── employees/
│   │   ├── appointments/
│   │   ├── customers/
│   │   ├── business/
│   │   ├── dashboard/
│   │   └── availability/
│   ├── layout.tsx
│   └── page.tsx             # Landing page
├── components/
│   ├── layout/              # Sidebar, Header
│   └── ui/                  # Componentes Shadcn UI
├── lib/
│   ├── auth.ts              # Configuración NextAuth
│   ├── auth-utils.ts        # Helpers de autenticación
│   ├── prisma.ts            # Cliente Prisma singleton
│   ├── utils.ts             # Utilidades generales
│   └── validations.ts       # Schemas Zod
├── types/
│   └── index.ts             # Tipos TypeScript
└── proxy.ts                 # Protección de rutas
```

## API Endpoints

### Autenticación
- `POST /api/auth/registro` - Registrar nuevo usuario
- `POST /api/auth/[...nextauth]` - Login/Logout

### Servicios
- `GET /api/services` - Listar servicios
- `POST /api/services` - Crear servicio
- `GET /api/services/[id]` - Obtener servicio
- `PUT /api/services/[id]` - Actualizar servicio
- `DELETE /api/services/[id]` - Eliminar servicio

### Empleados
- `GET /api/employees` - Listar empleados
- `POST /api/employees` - Crear empleado
- `GET /api/employees/[id]` - Obtener empleado
- `PUT /api/employees/[id]` - Actualizar empleado
- `DELETE /api/employees/[id]` - Eliminar empleado

### Turnos
- `GET /api/appointments` - Listar turnos (con filtros)
- `POST /api/appointments` - Crear turno
- `GET /api/appointments/[id]` - Obtener turno
- `PUT /api/appointments/[id]` - Actualizar turno
- `DELETE /api/appointments/[id]` - Cancelar turno

### Clientes
- `GET /api/customers` - Listar clientes
- `POST /api/customers` - Crear cliente
- `GET /api/customers/[id]` - Obtener cliente
- `PUT /api/customers/[id]` - Actualizar cliente
- `DELETE /api/customers/[id]` - Eliminar cliente

### Negocio
- `GET /api/business` - Obtener datos del negocio
- `PUT /api/business` - Actualizar configuración

### Dashboard
- `GET /api/dashboard` - Obtener métricas

### Disponibilidad
- `GET /api/availability` - Obtener disponibilidad
- `POST /api/availability` - Configurar disponibilidad

## Despliegue

### Vercel (Recomendado)

1. Push el repositorio a GitHub
2. Importar el proyecto en Vercel
3. Configurar variables de entorno
4. Conectar a una base de datos PostgreSQL (Neon, Supabase, etc.)
5. Deploy automático

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual

```bash
npm run build
npm start
```

## Variables de entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | Sí |
| `NEXTAUTH_URL` | URL base de la aplicación | Sí |
| `NEXTAUTH_SECRET` | Secreto para JWT (generar con `openssl rand -base64 32`) | Sí |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth | No |
| `GOOGLE_CLIENT_SECRET` | Client Secret de Google OAuth | No |

## Licencia

MIT

## Soporte

Si tenés problemas o preguntas, creá un issue en el repositorio.
