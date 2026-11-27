# BiblioWeb Manager — Pendientes y hoja de ruta

> Rama de trabajo: `sprint_1`
> Última actualización: 2026-11-26
> Estado actual: schema y migración aplicados, dominio base compilando y `next build` correcto.
> Objetivo: avanzar por partes, sin romper lo que ya funciona.

---

## 1. Estado actual

### Ya está hecho

- [x] Schema Prisma alineado con el diseño de clases (roles, permisos, clientes, ejemplares, multas, reportes y auditoría).
- [x] Migración base `prisma/migrations/20261126190253_init`.
- [x] Reglas SQL extra en `prisma/sql/extras.sql`:
  - índice único de un préstamo abierto por ejemplar,
  - CHECKs de fechas/montos,
  - trigger que cierra el préstamo y actualiza el ejemplar al registrar una devolución,
  - seed de roles, permisos y reglas de préstamo.
- [x] Better Auth con plugin `admin`, roles `ADMINISTRADOR`, `MOSTRADOR` e `INVENTARIO`.
- [x] Clases de dominio base: `Usuario`, `Cliente`, `Libro`, `Ejemplar`, `Prestamo`, `Devolucion`, `Multa`, `Sancion`, `ReglaPrestamo`, `Rol`, `Permiso`, `Autor`, `Categoria`, `Editorial`, `ReporteOperacion`, `ReporteSistema`.
- [x] Repositorios existentes: `prestamo`, `Devolucion`, `Multa`, `Sancion`, `Regla`, `Ejemplar`.
- [x] Helper de correos con Resend en `src/lib/email.ts`.
- [x] Login real con `authClient.signIn.email`, dashboard protegido y cierre de sesión.
- [x] Script `scripts/seed-admin.ts` para crear la primera cuenta.
- [x] `pnpm typecheck` y `next build` pasan.

### Pendiente inmediato

- [x] Login real con Better Auth.
- [x] Protección de rutas y permisos en servidor (`src/lib/session.ts`).
- [x] Script para crear la primera cuenta de administrador.
- [ ] Cambio de contraseña obligatorio (`debeCambiarPassword`).
- [ ] Repositorios que faltan (Cliente, Libro, Autor, Categoría, Editorial, Usuario, Reporte, Auditoría).
- [ ] Pantallas del prototipo P14.
- [ ] Flujos transaccionales de préstamo, devolución, multa y sanción.
- [ ] Pruebas y despliegue.

---

## 2. Cómo levantar el proyecto

### 2.1 Requisitos

- Node.js 20+ (el proyecto se probó con Node 26).
- `pnpm` (el repo usa `pnpm-lock.yaml`).
- PostgreSQL/Neon.
- Cuenta de Resend si se van a enviar correos.

### 2.2 Variables de entorno

Crear `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Completar:

```env
DATABASE_URL="postgresql://...-pooler.../neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://.../neondb?sslmode=require"
BETTER_AUTH_SECRET="..."   # openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_..."
EMAIL_FROM="BiblioWeb <no-reply@tudominio.com>"
```

Notas:

- `prisma7.config.ts` toma `DATABASE_URL` para las migraciones.
- Si las migraciones fallan contra el pooler de Neon, usar temporalmente `DATABASE_URL_UNPOOLED` en `DATABASE_URL` o ajustar `prisma7.config.ts`.
- `.env` está ignorado por Git. Nunca subir claves reales.

### 2.3 Instalación y base de datos

```bash
pnpm install
pnpm db:generate
pnpm db:deploy       # producción / base ya existente
# o, para desarrollo con cambios de schema:
# pnpm db:migrate
pnpm db:extras       # índices, CHECKs, trigger y seeds
pnpm dev
```

Abrir `http://localhost:3000`.

### 2.4 Comandos útiles

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
pnpm db:generate
pnpm db:migrate
pnpm db:deploy
pnpm db:extras
pnpm db:studio
```

---

## 3. Orden recomendado de trabajo

Trabajar en este orden evita bloquear pantallas por falta de autenticación o de repositorios:

1. **Fase 1:** login real, sesión, guard de permisos y cuenta inicial.
2. **Fase 2:** completar dominio y repositorios faltantes.
3. **Fase 3:** catálogo y lectores.
4. **Fase 4:** préstamos, devoluciones, multas y sanciones.
5. **Fase 5:** reportes, auditoría y correos.
6. **Fase 6:** pruebas, CI y despliegue.

---

## Fase 1 — Autenticación real y cuentas iniciales

### 1.1 Reemplazar la simulación del login

**Archivo:** `src/app/login/page.tsx`

Hoy el formulario hace `setTimeout` y navega a `/dashboard` sin autenticar. Cambiar por:

```ts
const { error } = await authClient.signIn.email({
  email: email.trim(),
  password,
  rememberMe,
});

if (error) {
  setError(error.message ?? "Correo o contraseña incorrectos.");
  return;
}

router.push("/dashboard");
router.refresh();
```

Importar:

```ts
import { authClient } from "@/lib/auth-client";
```

**Archivo:** `src/app/login/action.ts`

Está vacío. Opciones:

- **Recomendada:** borrarlo y usar `authClient` desde el componente cliente.
- Si se quiere server action, implementar `auth.api.signInEmail` con `headers()` y confiar en el plugin `nextCookies` para las cookies.

**Criterio de aceptación:**

- Credenciales incorrectas muestran un error visible.
- Credenciales correctas crean sesión y redirigen.
- Al recargar, la sesión se mantiene.
- Existe un botón/acción de cerrar sesión.

### 1.2 Crear el dashboard y proteger rutas

Crear `src/app/dashboard/page.tsx` (o la ruta que use el P14) y un guard reutilizable.

**Archivo sugerido:** `src/lib/session.ts` (o completar `src/lib/admin.ts`, que hoy está comentado).

```ts
import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireUsuario() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const usuario = await prisma.usuario.findUnique({
    where: { idAuth: session.user.id },
    include: {
      rol: { include: { permisos: { include: { permiso: true } } } },
      permisos: { include: { permiso: true } },
    },
  });

  if (!usuario) redirect("/login");
  return { session, usuario };
}

export async function requirePermiso(codigo: string) {
  const ctx = await requireUsuario();
  const permisos = [
    ...ctx.usuario.rol.permisos.map((rp) => rp.permiso.codigo),
    ...ctx.usuario.permisos.map((up) => up.permiso.codigo),
  ];

  if (!permisos.includes(codigo)) {
    throw new Error("No autorizado");
  }

  return ctx;
}
```

Usarlo en layouts/páginas/acciones de servidor. No confiar solo en el middleware: el middleware no puede consultar Prisma de forma segura en Edge y no reemplaza la autorización real.

**Criterio de aceptación:**

- `/dashboard` sin sesión redirige a `/login`.
- Un usuario sin permiso recibe 403 o una pantalla de “No autorizado”.
- El guard se reutiliza en todas las rutas privadas.

### 1.3 Script para crear el administrador inicial

El registro público está deshabilitado (`disableSignUp: true`), así que la primera cuenta debe crearse desde un script de servidor.

**Instalar `tsx`:**

```bash
pnpm add -D tsx
```

**Crear `scripts/seed-admin.ts`:**

```ts
import "dotenv/config";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const nombres = process.env.SEED_ADMIN_NOMBRES ?? "Administrador";
  const apellidos = process.env.SEED_ADMIN_APELLIDOS ?? "BiblioWeb";
  const numeroDocumento = process.env.SEED_ADMIN_DOCUMENTO ?? "00000000";

  if (!email || !password) {
    throw new Error("Definir SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD");
  }
  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    console.log("El usuario ya existe:", email);
    return;
  }

  // Sin headers, Better Auth permite el bootstrap del primer usuario.
  const { user } = await auth.api.createUser({
    body: {
      email,
      password,
      name: `${nombres} ${apellidos}`,
      role: "ADMINISTRADOR",
    },
  });

  const rol = await prisma.rol.findUniqueOrThrow({
    where: { nombre: "ADMINISTRADOR" },
  });

  await prisma.usuario.create({
    data: {
      idAuth: user.id,
      idRol: rol.id,
      nombres,
      apellidos,
      tipoDocumento: "DNI",
      numeroDocumento,
      debeCambiarPassword: true,
    },
  });

  console.log("Administrador creado:", email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Agregar a `package.json`:

```json
"seed:admin": "tsx scripts/seed-admin.ts"
```

Ejecutar:

```bash
SEED_ADMIN_EMAIL="admin@biblioweb.local" \
SEED_ADMIN_PASSWORD="Cambiar123!" \
SEED_ADMIN_NOMBRES="Ana" \
SEED_ADMIN_APELLIDOS="Pérez" \
SEED_ADMIN_DOCUMENTO="12345678" \
pnpm seed:admin
```

**Importante:** no exponer `auth.api.createUser` en una ruta pública. El bootstrap debe ser un script local o un job controlado.

**Criterio de aceptación:**

- Se crea `User`, `Account` (contraseña) y `Usuario` con rol `ADMINISTRADOR`.
- El administrador puede iniciar sesión.
- `debeCambiarPassword` queda en `true`.

### 1.4 Cambio de contraseña obligatorio

- Crear `/cambiar-password`.
- En `requireUsuario`, si `usuario.debeCambiarPassword` es `true`, redirigir allí (excepto en la propia pantalla y en logout).
- Usar `authClient.changePassword` o `auth.api.changePassword`.
- Al terminar, actualizar `Usuario.debeCambiarPassword = false` con Prisma.

**Criterio de aceptación:**

- Un usuario nuevo no puede usar el resto de la app sin cambiar la contraseña.
- Después del cambio, `debeCambiarPassword` queda en `false`.

---

## Fase 2 — Completar dominio y repositorios

### 2.1 Alinear el dominio con el schema

Hay tres clases que todavía no reflejan todos los campos del schema:

| Clase | Falta agregar |
|---|---|
| `src/models/Usuario.ts` | `numeroDocumento`, `debeCambiarPassword` |
| `src/models/Devolucion.ts` | `estadoEjemplarResultante` en `DatosDevolucion` y en `registrar()` |
| `src/models/ReglaPrestamo.ts` | `vigenteDesde`, `vigenteHasta` |

También actualizar los repositorios que reconstruyen esas clases:

- `src/repositories/Devolucion.repository.ts` debe guardar `estadoEjemplarResultante`.
- `src/repositories/Regla.repository.ts` debe mapear `vigenteDesde` y `vigenteHasta`.

**Criterio de aceptación:** `pnpm typecheck` sigue en 0 errores y los repositorios no pierden campos del schema.

### 2.2 Repositorios faltantes

Seguir el patrón existente:

- `import "server-only"` al inicio.
- `type Db = Prisma.TransactionClient` para aceptar transacciones.
- Métodos `buscar...`, `listar...`, `guardar...`.
- Método privado `aDominio(fila)` para reconstruir la clase.
- Exportar una instancia singleton (`export const xRepository = new XRepository()`).

| Repositorio | Responsabilidad mínima |
|---|---|
| `ClienteRepository` | crear, buscar por id/documento/email, listar, actualizar, incluir préstamos/multas/sanciones |
| `LibroRepository` | crear libro + autores en transacción, buscar por ISBN/id, listar catálogo, actualizar, agregar ejemplares |
| `AutorRepository` | CRUD simple |
| `CategoriaRepository` | CRUD simple |
| `EditorialRepository` | CRUD simple |
| `UsuarioRepository` | buscar por `idAuth`, listar personal, actualizar rol/permisos |
| `ReporteRepository` | guardar y listar reportes |
| `AuditoriaRepository` | registrar y listar acciones |

Además, completar los existentes:

- `EjemplarRepository`: falta crear ejemplar (`create`) y listar por libro.
- `PrestamoRepository`: faltan listados por cliente, activos y por ejemplar.
- `MultaRepository`: falta listar por cliente/estado y buscar por devolución.
- `SancionRepository`: falta listar sanciones vigentes por cliente.

**Criterio de aceptación:**

- Cada repositorio tiene las operaciones que necesitan las pantallas.
- Las operaciones que tocan varias tablas reciben `db` y se pueden usar dentro de `prisma.$transaction`.

---

## Fase 3 — Catálogo y lectores

### 3.1 Catálogo

Pantallas sugeridas:

- `/catalogo`: listado con búsqueda por título/ISBN/autor.
- `/catalogo/nuevo`: alta de libro, autores, categoría, editorial y ejemplares.
- `/catalogo/[id]`: detalle, ejemplares y disponibilidad.

Implementación:

- Server Components para lectura.
- Server Actions para escritura.
- Validar permisos con `requirePermiso("catalogo.ver")` y `requirePermiso("catalogo.gestionar")`.
- Usar `LibroRepository` y `EjemplarRepository`.

**Criterio de aceptación:**

- Se puede registrar un libro con al menos un autor y una copia.
- El listado muestra disponibilidad real.
- No se puede dar de baja un ejemplar prestado.

### 3.2 Lectores

Pantallas sugeridas:

- `/lectores`: listado y búsqueda por nombre/documento/credencial.
- `/lectores/nuevo`: alta.
- `/lectores/[id]`: ficha con préstamos, multas y sanciones.

Implementación:

- `ClienteRepository`.
- Validar `tipoDocumento` + `identificacion` únicos.
- Mostrar estado (`ACTIVO` / `SANCIONADO`) calculado con las sanciones vigentes.

**Criterio de aceptación:**

- No se puede registrar dos veces el mismo documento.
- La ficha muestra el estado actual del lector.

---

## Fase 4 — Préstamos, devoluciones, multas y sanciones

### 4.1 Registrar préstamo

Crear un servicio de aplicación (por ejemplo `src/services/prestamo.service.ts`) que dentro de una transacción:

1. Verifique que el cliente exista y no esté sancionado.
2. Verifique que no tenga multas pendientes.
3. Cuente sus préstamos activos y valide `maxPrestamosPorCliente`.
4. Verifique que el ejemplar esté `DISPONIBLE`.
5. Cree el `Prestamo`.
6. Marque el ejemplar como `PRESTADO`.
7. Registre auditoría.

El índice parcial `prestamo_un_abierto_por_ejemplar` es la última defensa contra dobles préstamos.

**Criterio de aceptación:**

- No se puede prestar un ejemplar no disponible.
- No se puede prestar a un lector sancionado o con multas pendientes.
- El ejemplar queda `PRESTADO` y el préstamo aparece activo.

### 4.2 Registrar devolución

Crear `src/services/devolucion.service.ts`:

1. Buscar el préstamo abierto.
2. Crear la `Devolucion` (el trigger de `extras.sql` cierra el préstamo y actualiza el ejemplar).
3. Calcular días de retraso.
4. Si hay retraso, generar `Multa` con la regla vigente.
5. Si corresponde, aplicar `Sancion`.
6. Registrar auditoría.

**Importante:** el trigger ya actualiza `prestamo.fecha_devolucion` y `ejemplar.estado`. No duplicar esas actualizaciones en el repositorio; sí persistir `estadoEjemplarResultante` si se quiere forzar un estado distinto.

**Criterio de aceptación:**

- El préstamo queda cerrado una sola vez.
- El ejemplar queda `DISPONIBLE` o `EN_REPARACION` según corresponda.
- La multa se genera solo si hay retraso.

### 4.3 Multas y sanciones

Pantallas:

- `/multas`: listado por cliente/estado.
- Acciones: marcar pagada, condonar.
- `/sanciones`: listado y levantamiento.

Reglas:

- Solo se paga/condona una multa `PENDIENTE`.
- Al pagar, guardar `fechaPago`.
- Una sanción se levanta solo si está vigente y no hay multas pendientes (según la regla de negocio acordada).
- Registrar auditoría de cada acción.

**Criterio de aceptación:**

- Los estados no permiten transiciones inválidas.
- El historial queda auditado.

---

## Fase 5 — Reportes, auditoría y correos

### 5.1 Reportes

- Persistir en `Reporte` con `ReporteRepository`.
- Generar reportes de operación y de sistema usando `ReporteOperacion` y `ReporteSistema`.
- La exportación CSV ya existe en `Reporte.exportar`.
- La exportación PDF lanza error a propósito: implementarla con `@react-pdf/renderer`, `pdfkit` o dejar solo CSV por ahora.

**Criterio de aceptación:**

- Se puede generar un reporte por periodo.
- El CSV descarga con los datos correctos.

### 5.2 Auditoría

Crear `src/lib/auditoria.ts`:

```ts
export async function registrarAuditoria(input: {
  idUsuario: number;
  accion: string;
  entidad: string;
  idRegistro?: number;
  detalle?: string;
}, db = prisma) {
  await db.auditoria.create({ data: input });
}
```

Llamarla en las acciones sensibles (crear/editar/eliminar, préstamos, devoluciones, multas, cambios de rol).

### 5.3 Correos con Resend

- Configurar `RESEND_API_KEY` y `EMAIL_FROM`.
- Verificar el dominio en Resend para producción.
- Usar `enviarCorreo` de `src/lib/email.ts`.
- Enviar como mínimo:
  - bienvenida / credenciales,
  - recordatorio de vencimiento,
  - confirmación de devolución,
  - aviso de multa.
- No bloquear la transacción principal si el correo falla: capturar el error y registrar el fallo.
- Configurar `sendResetPassword` en `src/lib/auth.ts` si se implementa “olvidé mi contraseña”.

**Criterio de aceptación:**

- Un correo de prueba llega a la bandeja.
- Un fallo de Resend no revierte un préstamo ni una devolución.

---

## Fase 6 — Calidad y despliegue

### 6.1 Pruebas

- Unitarias de dominio con Vitest: `Prestamo`, `Devolucion`, `Multa`, `Sancion`, `Cliente`.
- Integración de repositorios contra una base de prueba.
- E2E con Playwright para login, préstamo y devolución.

### 6.2 Calidad

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Agregar CI (GitHub Actions) con esos tres comandos.

### 6.3 Despliegue

En Vercel/Neon:

1. Configurar `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`, `EMAIL_FROM`.
2. Ejecutar `pnpm db:generate`.
3. Ejecutar `pnpm db:deploy`.
4. Ejecutar `pnpm db:extras` una vez contra la base.
5. Ejecutar `pnpm build`.

Notas:

- `extras.sql` es idempotente en su mayoría; el trigger se recrea y los seeds usan `ON CONFLICT`.
- Mantener `pnpm-lock.yaml`; el `package-lock.json` está desactualizado y no debería usarse.
- No registrar usuarios públicos: el alta de personal debe pasar por un administrador.

---

## 4. Checklist resumido

- [x] Login real con `authClient`.
- [x] Guard `requireUsuario` / `requirePermiso`.
- [x] Dashboard y cierre de sesión.
- [x] Script `seed:admin`.
- [ ] Cambio de contraseña obligatorio.
- [ ] Completar `Usuario`, `Devolucion` y `ReglaPrestamo`.
- [ ] Repositorios faltantes.
- [ ] Catálogo (listado, alta, detalle).
- [ ] Lectores (listado, alta, ficha).
- [ ] Préstamos (servicio transaccional + pantalla).
- [ ] Devoluciones (servicio + pantalla).
- [ ] Multas y sanciones.
- [ ] Reportes y exportación CSV.
- [ ] Auditoría.
- [ ] Correos con Resend.
- [ ] Tests y CI.
- [ ] Despliegue con migraciones + `extras.sql`.

---

## 5. Decisiones y notas del proyecto

- **Sin registro público:** solo el personal autorizado tiene cuenta. El primer administrador se crea con un script.
- **Credenciales:** Better Auth guarda el hash en `Account.password`; `Usuario` guarda el perfil y el rol.
- **Roles:** `ADMINISTRADOR`, `MOSTRADOR`, `INVENTARIO`.
- **Permisos:** la fuente de verdad para la app es `Permiso` + `RolPermiso` + `UsuarioPermiso`. La configuración `ac` de Better Auth debe mantenerse sincronizada con esos códigos.
- **Multas:** se ligan a `idDevolucion` y `idCliente`, no directamente a `idPrestamo`.
- **Trigger de devolución:** cierra el préstamo y actualiza el ejemplar; el servicio no debe repetir esa lógica.
- **Resend:** los correos son notificaciones; un fallo de correo no debe revertir la operación de biblioteca.
- **Paquetes:** usar `pnpm`; `package-lock.json` quedó viejo.
