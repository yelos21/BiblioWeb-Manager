-- CreateEnum
CREATE TYPE "estado_ejemplar" AS ENUM ('DISPONIBLE', 'PRESTADO', 'EN_REPARACION', 'PERDIDO', 'BAJA');

-- CreateEnum
CREATE TYPE "estado_multa" AS ENUM ('PENDIENTE', 'PAGADA', 'CONDONADA');

-- CreateTable
CREATE TABLE "usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "id_rol" INTEGER,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuenta" (
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

    CONSTRAINT "cuenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificacion" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol" (
    "id_rol" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "permiso" (
    "id_permiso" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "es_global" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "permiso_pkey" PRIMARY KEY ("id_permiso")
);

-- CreateTable
CREATE TABLE "rol_permiso" (
    "id_rol" INTEGER NOT NULL,
    "id_permiso" INTEGER NOT NULL,

    CONSTRAINT "rol_permiso_pkey" PRIMARY KEY ("id_rol","id_permiso")
);

-- CreateTable
CREATE TABLE "usuario_permiso" (
    "id_usuario" TEXT NOT NULL,
    "id_permiso" INTEGER NOT NULL,

    CONSTRAINT "usuario_permiso_pkey" PRIMARY KEY ("id_usuario","id_permiso")
);

-- CreateTable
CREATE TABLE "autor" (
    "id_autor" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "nacionalidad" TEXT,

    CONSTRAINT "autor_pkey" PRIMARY KEY ("id_autor")
);

-- CreateTable
CREATE TABLE "editorial" (
    "id_editorial" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "pais" TEXT,

    CONSTRAINT "editorial_pkey" PRIMARY KEY ("id_editorial")
);

-- CreateTable
CREATE TABLE "categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "libro" (
    "id_libro" SERIAL NOT NULL,
    "isbn" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "anio_publicacion" INTEGER,
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
    "codigo_inventario" TEXT NOT NULL,
    "estado" "estado_ejemplar" NOT NULL DEFAULT 'DISPONIBLE',
    "estado_fisico" TEXT,
    "ubicacion" TEXT,
    "fecha_adquisicion" DATE NOT NULL,
    "motivo_baja" TEXT,
    "id_libro" INTEGER NOT NULL,

    CONSTRAINT "ejemplar_pkey" PRIMARY KEY ("id_ejemplar")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id_cliente" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "identificacion" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "credencial" TEXT NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_usuario_registra" TEXT NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "prestamo" (
    "id_prestamo" SERIAL NOT NULL,
    "fecha_prestamo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "fecha_devolucion" TIMESTAMP(3),
    "id_cliente" INTEGER NOT NULL,
    "id_ejemplar" INTEGER NOT NULL,
    "id_usuario_registra" TEXT NOT NULL,
    "id_usuario_recibe_devolucion" TEXT,

    CONSTRAINT "prestamo_pkey" PRIMARY KEY ("id_prestamo")
);

-- CreateTable
CREATE TABLE "multa" (
    "id_multa" SERIAL NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "dias_retraso" INTEGER NOT NULL,
    "estado" "estado_multa" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_generacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_pago" TIMESTAMP(3),
    "id_prestamo" INTEGER NOT NULL,

    CONSTRAINT "multa_pkey" PRIMARY KEY ("id_multa")
);

-- CreateTable
CREATE TABLE "sancion" (
    "id_sancion" SERIAL NOT NULL,
    "motivo" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "fecha_levantada" TIMESTAMP(3),
    "id_cliente" INTEGER NOT NULL,
    "id_usuario_aplica" TEXT NOT NULL,
    "id_multa" INTEGER,

    CONSTRAINT "sancion_pkey" PRIMARY KEY ("id_sancion")
);

-- CreateTable
CREATE TABLE "regla_prestamo" (
    "id_regla" SERIAL NOT NULL,
    "dias_prestamo" INTEGER NOT NULL,
    "max_prestamos_por_cliente" INTEGER NOT NULL,
    "multa_por_dia" DECIMAL(10,2) NOT NULL,
    "dias_sancion_base" INTEGER NOT NULL,
    "vigente_desde" DATE NOT NULL,

    CONSTRAINT "regla_prestamo_pkey" PRIMARY KEY ("id_regla")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id_auditoria" SERIAL NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entidad" TEXT NOT NULL,
    "id_registro" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "detalle" JSONB,
    "id_usuario" TEXT NOT NULL,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateTable
CREATE TABLE "reporte" (
    "id_reporte" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "periodo_inicio" DATE NOT NULL,
    "periodo_fin" DATE NOT NULL,
    "fecha_generacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_usuario" TEXT NOT NULL,

    CONSTRAINT "reporte_pkey" PRIMARY KEY ("id_reporte")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "usuario_id_rol_idx" ON "usuario"("id_rol");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "cuenta_userId_idx" ON "cuenta"("userId");

-- CreateIndex
CREATE INDEX "verificacion_identifier_idx" ON "verificacion"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_key" ON "rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permiso_codigo_key" ON "permiso"("codigo");

-- CreateIndex
CREATE INDEX "rol_permiso_id_permiso_idx" ON "rol_permiso"("id_permiso");

-- CreateIndex
CREATE INDEX "usuario_permiso_id_permiso_idx" ON "usuario_permiso"("id_permiso");

-- CreateIndex
CREATE UNIQUE INDEX "categoria_nombre_key" ON "categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "libro_isbn_key" ON "libro"("isbn");

-- CreateIndex
CREATE INDEX "libro_id_editorial_idx" ON "libro"("id_editorial");

-- CreateIndex
CREATE INDEX "libro_id_categoria_idx" ON "libro"("id_categoria");

-- CreateIndex
CREATE INDEX "libro_titulo_idx" ON "libro"("titulo");

-- CreateIndex
CREATE INDEX "libro_autor_id_autor_idx" ON "libro_autor"("id_autor");

-- CreateIndex
CREATE UNIQUE INDEX "ejemplar_codigo_inventario_key" ON "ejemplar"("codigo_inventario");

-- CreateIndex
CREATE INDEX "ejemplar_id_libro_idx" ON "ejemplar"("id_libro");

-- CreateIndex
CREATE INDEX "ejemplar_estado_idx" ON "ejemplar"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_identificacion_key" ON "cliente"("identificacion");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_email_key" ON "cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_credencial_key" ON "cliente"("credencial");

-- CreateIndex
CREATE INDEX "cliente_id_usuario_registra_idx" ON "cliente"("id_usuario_registra");

-- CreateIndex
CREATE INDEX "prestamo_id_cliente_idx" ON "prestamo"("id_cliente");

-- CreateIndex
CREATE INDEX "prestamo_id_ejemplar_idx" ON "prestamo"("id_ejemplar");

-- CreateIndex
CREATE INDEX "prestamo_id_usuario_registra_idx" ON "prestamo"("id_usuario_registra");

-- CreateIndex
CREATE INDEX "prestamo_id_usuario_recibe_devolucion_idx" ON "prestamo"("id_usuario_recibe_devolucion");

-- CreateIndex
CREATE INDEX "prestamo_fecha_vencimiento_idx" ON "prestamo"("fecha_vencimiento");

-- CreateIndex
CREATE UNIQUE INDEX "multa_id_prestamo_key" ON "multa"("id_prestamo");

-- CreateIndex
CREATE UNIQUE INDEX "sancion_id_multa_key" ON "sancion"("id_multa");

-- CreateIndex
CREATE INDEX "sancion_id_cliente_idx" ON "sancion"("id_cliente");

-- CreateIndex
CREATE INDEX "sancion_id_usuario_aplica_idx" ON "sancion"("id_usuario_aplica");

-- CreateIndex
CREATE INDEX "auditoria_id_usuario_fecha_hora_idx" ON "auditoria"("id_usuario", "fecha_hora");

-- CreateIndex
CREATE INDEX "auditoria_entidad_id_registro_idx" ON "auditoria"("entidad", "id_registro");

-- CreateIndex
CREATE INDEX "reporte_id_usuario_idx" ON "reporte"("id_usuario");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta" ADD CONSTRAINT "cuenta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_id_permiso_fkey" FOREIGN KEY ("id_permiso") REFERENCES "permiso"("id_permiso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_permiso" ADD CONSTRAINT "usuario_permiso_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_permiso" ADD CONSTRAINT "usuario_permiso_id_permiso_fkey" FOREIGN KEY ("id_permiso") REFERENCES "permiso"("id_permiso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "libro" ADD CONSTRAINT "libro_id_editorial_fkey" FOREIGN KEY ("id_editorial") REFERENCES "editorial"("id_editorial") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "libro" ADD CONSTRAINT "libro_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "libro_autor" ADD CONSTRAINT "libro_autor_id_libro_fkey" FOREIGN KEY ("id_libro") REFERENCES "libro"("id_libro") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "libro_autor" ADD CONSTRAINT "libro_autor_id_autor_fkey" FOREIGN KEY ("id_autor") REFERENCES "autor"("id_autor") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejemplar" ADD CONSTRAINT "ejemplar_id_libro_fkey" FOREIGN KEY ("id_libro") REFERENCES "libro"("id_libro") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_id_usuario_registra_fkey" FOREIGN KEY ("id_usuario_registra") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestamo" ADD CONSTRAINT "prestamo_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestamo" ADD CONSTRAINT "prestamo_id_ejemplar_fkey" FOREIGN KEY ("id_ejemplar") REFERENCES "ejemplar"("id_ejemplar") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestamo" ADD CONSTRAINT "prestamo_id_usuario_registra_fkey" FOREIGN KEY ("id_usuario_registra") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestamo" ADD CONSTRAINT "prestamo_id_usuario_recibe_devolucion_fkey" FOREIGN KEY ("id_usuario_recibe_devolucion") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multa" ADD CONSTRAINT "multa_id_prestamo_fkey" FOREIGN KEY ("id_prestamo") REFERENCES "prestamo"("id_prestamo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sancion" ADD CONSTRAINT "sancion_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sancion" ADD CONSTRAINT "sancion_id_usuario_aplica_fkey" FOREIGN KEY ("id_usuario_aplica") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sancion" ADD CONSTRAINT "sancion_id_multa_fkey" FOREIGN KEY ("id_multa") REFERENCES "multa"("id_multa") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporte" ADD CONSTRAINT "reporte_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
