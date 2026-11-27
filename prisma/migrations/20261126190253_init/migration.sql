-- CreateEnum
CREATE TYPE "nombre_rol" AS ENUM ('ADMINISTRADOR', 'MOSTRADOR', 'INVENTARIO');

-- CreateEnum
CREATE TYPE "estado_fisico" AS ENUM ('NUEVO', 'BUENO', 'REGULAR', 'DETERIORADO');

-- CreateEnum
CREATE TYPE "estado_ejemplar" AS ENUM ('DISPONIBLE', 'PRESTADO', 'EN_REPARACION', 'BAJA');

-- CreateEnum
CREATE TYPE "estado_multa" AS ENUM ('PENDIENTE', 'PAGADA', 'CONDONADA');

-- CreateEnum
CREATE TYPE "tipo_reporte" AS ENUM ('SISTEMA', 'OPERACION');

-- CreateEnum
CREATE TYPE "tipo_documento" AS ENUM ('DNI', 'PASAPORTE', 'CEDULA', 'OTRO');

-- CreateEnum
CREATE TYPE "concepto_multa" AS ENUM ('RETRASO', 'DANIO');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT,
    "banned" BOOLEAN DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol" (
    "id_rol" SMALLSERIAL NOT NULL,
    "nombre" "nombre_rol" NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "permiso" (
    "id_permiso" SMALLSERIAL NOT NULL,
    "codigo" VARCHAR(40) NOT NULL,
    "descripcion" VARCHAR(150) NOT NULL,
    "es_global" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "permiso_pkey" PRIMARY KEY ("id_permiso")
);

-- CreateTable
CREATE TABLE "rol_permiso" (
    "id_rol" SMALLINT NOT NULL,
    "id_permiso" SMALLINT NOT NULL,

    CONSTRAINT "rol_permiso_pkey" PRIMARY KEY ("id_rol","id_permiso")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "id_auth" TEXT NOT NULL,
    "id_rol" SMALLINT NOT NULL,
    "nombres" VARCHAR(80) NOT NULL,
    "apellidos" VARCHAR(80) NOT NULL,
    "tipo_documento" "tipo_documento" NOT NULL,
    "numeroDocumento" VARCHAR(30) NOT NULL,
    "debe_cambiar_password" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "usuario_permiso" (
    "id_usuario" INTEGER NOT NULL,
    "id_permiso" SMALLINT NOT NULL,

    CONSTRAINT "usuario_permiso_pkey" PRIMARY KEY ("id_usuario","id_permiso")
);

-- CreateTable
CREATE TABLE "editorial" (
    "id_editorial" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "pais" VARCHAR(60),

    CONSTRAINT "editorial_pkey" PRIMARY KEY ("id_editorial")
);

-- CreateTable
CREATE TABLE "categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "autor" (
    "id_autor" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "nacionalidad" VARCHAR(60),

    CONSTRAINT "autor_pkey" PRIMARY KEY ("id_autor")
);

-- CreateTable
CREATE TABLE "libro" (
    "id_libro" SERIAL NOT NULL,
    "isbn" VARCHAR(20) NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "anio_publicacion" SMALLINT,
    "descripcion" TEXT,
    "id_editorial" INTEGER NOT NULL,
    "id_categoria" INTEGER NOT NULL,

    CONSTRAINT "libro_pkey" PRIMARY KEY ("id_libro")
);

-- CreateTable
CREATE TABLE "libro_autor" (
    "id_libro" INTEGER NOT NULL,
    "id_autor" INTEGER NOT NULL,

    CONSTRAINT "libro_autor_pkey" PRIMARY KEY ("id_libro","id_autor")
);

-- CreateTable
CREATE TABLE "ejemplar" (
    "id_ejemplar" SERIAL NOT NULL,
    "id_libro" INTEGER NOT NULL,
    "numero_copia" SMALLINT NOT NULL,
    "codigo_inventario" VARCHAR(30) NOT NULL,
    "ubicacion" VARCHAR(60),
    "estado_fisico" "estado_fisico" NOT NULL DEFAULT 'BUENO',
    "estado" "estado_ejemplar" NOT NULL DEFAULT 'DISPONIBLE',
    "fecha_adquisicion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo_baja" TEXT,

    CONSTRAINT "ejemplar_pkey" PRIMARY KEY ("id_ejemplar")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id_cliente" SERIAL NOT NULL,
    "credencial" SERIAL NOT NULL,
    "nombres" VARCHAR(80) NOT NULL,
    "apellidos" VARCHAR(80) NOT NULL,
    "tipo_documento" "tipo_documento" NOT NULL,
    "identificacion" VARCHAR(30) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "telefono" VARCHAR(20),
    "direccion" VARCHAR(200),
    "fecha_registro" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_usuario_registro" INTEGER NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "prestamo" (
    "id_prestamo" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_ejemplar" INTEGER NOT NULL,
    "id_usuario_registra" INTEGER NOT NULL,
    "id_regla" SMALLINT NOT NULL,
    "dias_prestamo" SMALLINT NOT NULL,
    "observaciones" TEXT,
    "fecha_prestamo" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" DATE NOT NULL,
    "fecha_devolucion" TIMESTAMPTZ(6),

    CONSTRAINT "prestamo_pkey" PRIMARY KEY ("id_prestamo")
);

-- CreateTable
CREATE TABLE "devolucion" (
    "id_devolucion" SERIAL NOT NULL,
    "id_prestamo" INTEGER NOT NULL,
    "id_usuario_recibe" INTEGER NOT NULL,
    "fecha" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_fisico_al_recibir" "estado_fisico" NOT NULL,
    "estado_ejemplar_resultante" "estado_ejemplar",
    "observaciones" TEXT,

    CONSTRAINT "devolucion_pkey" PRIMARY KEY ("id_devolucion")
);

-- CreateTable
CREATE TABLE "multa" (
    "id_multa" SERIAL NOT NULL,
    "id_devolucion" INTEGER NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_usuario_calcula" INTEGER NOT NULL,
    "concepto" "concepto_multa" NOT NULL DEFAULT 'RETRASO',
    "dias_retraso" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "estado" "estado_multa" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_generacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_pago" TIMESTAMPTZ(6),

    CONSTRAINT "multa_pkey" PRIMARY KEY ("id_multa")
);

-- CreateTable
CREATE TABLE "sancion" (
    "id_sancion" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_multa" INTEGER,
    "id_usuario_aplica" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "fecha_inicio" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" DATE NOT NULL,
    "fecha_levantada" DATE,

    CONSTRAINT "sancion_pkey" PRIMARY KEY ("id_sancion")
);

-- CreateTable
CREATE TABLE "regla_prestamo" (
    "id_regla" SMALLSERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "dias_prestamo" SMALLINT NOT NULL,
    "max_prestamos_por_cliente" SMALLINT NOT NULL,
    "multa_por_dia" DECIMAL(10,2) NOT NULL,
    "dias_sancion_base" SMALLINT NOT NULL,
    "vigente_desde" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigente_hasta" DATE,

    CONSTRAINT "regla_prestamo_pkey" PRIMARY KEY ("id_regla")
);

-- CreateTable
CREATE TABLE "reporte" (
    "id_reporte" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "tipo" "tipo_reporte" NOT NULL,
    "periodo_inicio" DATE NOT NULL,
    "periodo_fin" DATE NOT NULL,
    "fecha_generacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reporte_pkey" PRIMARY KEY ("id_reporte")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id_auditoria" BIGSERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "accion" VARCHAR(50) NOT NULL,
    "entidad" VARCHAR(50) NOT NULL,
    "id_registro" INTEGER,
    "fecha_hora" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalle" TEXT,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_key" ON "rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permiso_codigo_key" ON "permiso"("codigo");

-- CreateIndex
CREATE INDEX "rol_permiso_id_permiso_idx" ON "rol_permiso"("id_permiso");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_id_auth_key" ON "usuario"("id_auth");

-- CreateIndex
CREATE INDEX "usuario_id_rol_idx" ON "usuario"("id_rol");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_tipo_documento_numeroDocumento_key" ON "usuario"("tipo_documento", "numeroDocumento");

-- CreateIndex
CREATE INDEX "usuario_permiso_id_permiso_idx" ON "usuario_permiso"("id_permiso");

-- CreateIndex
CREATE UNIQUE INDEX "editorial_nombre_key" ON "editorial"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "categoria_nombre_key" ON "categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "libro_isbn_key" ON "libro"("isbn");

-- CreateIndex
CREATE INDEX "libro_titulo_idx" ON "libro"("titulo");

-- CreateIndex
CREATE INDEX "libro_id_editorial_idx" ON "libro"("id_editorial");

-- CreateIndex
CREATE INDEX "libro_id_categoria_idx" ON "libro"("id_categoria");

-- CreateIndex
CREATE INDEX "libro_autor_id_autor_idx" ON "libro_autor"("id_autor");

-- CreateIndex
CREATE UNIQUE INDEX "ejemplar_codigo_inventario_key" ON "ejemplar"("codigo_inventario");

-- CreateIndex
CREATE INDEX "ejemplar_id_libro_estado_idx" ON "ejemplar"("id_libro", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "ejemplar_id_libro_numero_copia_key" ON "ejemplar"("id_libro", "numero_copia");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_credencial_key" ON "cliente"("credencial");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_email_key" ON "cliente"("email");

-- CreateIndex
CREATE INDEX "cliente_nombres_apellidos_idx" ON "cliente"("nombres", "apellidos");

-- CreateIndex
CREATE INDEX "cliente_id_usuario_registro_idx" ON "cliente"("id_usuario_registro");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_tipo_documento_identificacion_key" ON "cliente"("tipo_documento", "identificacion");

-- CreateIndex
CREATE INDEX "prestamo_id_cliente_fecha_devolucion_idx" ON "prestamo"("id_cliente", "fecha_devolucion");

-- CreateIndex
CREATE INDEX "prestamo_id_ejemplar_fecha_devolucion_idx" ON "prestamo"("id_ejemplar", "fecha_devolucion");

-- CreateIndex
CREATE INDEX "prestamo_id_usuario_registra_idx" ON "prestamo"("id_usuario_registra");

-- CreateIndex
CREATE INDEX "prestamo_id_regla_idx" ON "prestamo"("id_regla");

-- CreateIndex
CREATE INDEX "prestamo_fecha_vencimiento_fecha_devolucion_idx" ON "prestamo"("fecha_vencimiento", "fecha_devolucion");

-- CreateIndex
CREATE UNIQUE INDEX "devolucion_id_prestamo_key" ON "devolucion"("id_prestamo");

-- CreateIndex
CREATE INDEX "devolucion_id_usuario_recibe_idx" ON "devolucion"("id_usuario_recibe");

-- CreateIndex
CREATE UNIQUE INDEX "multa_id_devolucion_key" ON "multa"("id_devolucion");

-- CreateIndex
CREATE INDEX "multa_id_cliente_estado_idx" ON "multa"("id_cliente", "estado");

-- CreateIndex
CREATE INDEX "multa_id_usuario_calcula_idx" ON "multa"("id_usuario_calcula");

-- CreateIndex
CREATE UNIQUE INDEX "sancion_id_multa_key" ON "sancion"("id_multa");

-- CreateIndex
CREATE INDEX "sancion_id_cliente_fecha_inicio_fecha_fin_idx" ON "sancion"("id_cliente", "fecha_inicio", "fecha_fin");

-- CreateIndex
CREATE INDEX "sancion_id_usuario_aplica_idx" ON "sancion"("id_usuario_aplica");

-- CreateIndex
CREATE UNIQUE INDEX "regla_prestamo_nombre_key" ON "regla_prestamo"("nombre");

-- CreateIndex
CREATE INDEX "reporte_id_usuario_idx" ON "reporte"("id_usuario");

-- CreateIndex
CREATE INDEX "auditoria_id_usuario_fecha_hora_idx" ON "auditoria"("id_usuario", "fecha_hora");

-- CreateIndex
CREATE INDEX "auditoria_fecha_hora_idx" ON "auditoria"("fecha_hora");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_id_permiso_fkey" FOREIGN KEY ("id_permiso") REFERENCES "permiso"("id_permiso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_auth_fkey" FOREIGN KEY ("id_auth") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_permiso" ADD CONSTRAINT "usuario_permiso_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_permiso" ADD CONSTRAINT "usuario_permiso_id_permiso_fkey" FOREIGN KEY ("id_permiso") REFERENCES "permiso"("id_permiso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "libro" ADD CONSTRAINT "libro_id_editorial_fkey" FOREIGN KEY ("id_editorial") REFERENCES "editorial"("id_editorial") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "libro" ADD CONSTRAINT "libro_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "libro_autor" ADD CONSTRAINT "libro_autor_id_libro_fkey" FOREIGN KEY ("id_libro") REFERENCES "libro"("id_libro") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "libro_autor" ADD CONSTRAINT "libro_autor_id_autor_fkey" FOREIGN KEY ("id_autor") REFERENCES "autor"("id_autor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejemplar" ADD CONSTRAINT "ejemplar_id_libro_fkey" FOREIGN KEY ("id_libro") REFERENCES "libro"("id_libro") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_id_usuario_registro_fkey" FOREIGN KEY ("id_usuario_registro") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestamo" ADD CONSTRAINT "prestamo_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestamo" ADD CONSTRAINT "prestamo_id_ejemplar_fkey" FOREIGN KEY ("id_ejemplar") REFERENCES "ejemplar"("id_ejemplar") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestamo" ADD CONSTRAINT "prestamo_id_usuario_registra_fkey" FOREIGN KEY ("id_usuario_registra") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestamo" ADD CONSTRAINT "prestamo_id_regla_fkey" FOREIGN KEY ("id_regla") REFERENCES "regla_prestamo"("id_regla") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucion" ADD CONSTRAINT "devolucion_id_prestamo_fkey" FOREIGN KEY ("id_prestamo") REFERENCES "prestamo"("id_prestamo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucion" ADD CONSTRAINT "devolucion_id_usuario_recibe_fkey" FOREIGN KEY ("id_usuario_recibe") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multa" ADD CONSTRAINT "multa_id_devolucion_fkey" FOREIGN KEY ("id_devolucion") REFERENCES "devolucion"("id_devolucion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multa" ADD CONSTRAINT "multa_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multa" ADD CONSTRAINT "multa_id_usuario_calcula_fkey" FOREIGN KEY ("id_usuario_calcula") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sancion" ADD CONSTRAINT "sancion_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sancion" ADD CONSTRAINT "sancion_id_multa_fkey" FOREIGN KEY ("id_multa") REFERENCES "multa"("id_multa") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sancion" ADD CONSTRAINT "sancion_id_usuario_aplica_fkey" FOREIGN KEY ("id_usuario_aplica") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporte" ADD CONSTRAINT "reporte_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
