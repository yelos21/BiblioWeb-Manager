-- ============================================================
-- BiblioWeb Manager - reglas que Prisma no puede expresar
-- Ejecutar despues de las migraciones:
--   npx prisma db execute --file prisma/sql/extras.sql
-- ============================================================

-- 1. Un solo prestamo abierto por ejemplar -------------------
CREATE UNIQUE INDEX IF NOT EXISTS prestamo_un_abierto_por_ejemplar
  ON prestamo (id_ejemplar)
  WHERE fecha_devolucion IS NULL;

-- 2. Restricciones de integridad ----------------------------
ALTER TABLE prestamo DROP CONSTRAINT IF EXISTS prestamo_fechas_check;
ALTER TABLE prestamo
  ADD CONSTRAINT prestamo_fechas_check
  CHECK (fecha_vencimiento >= (fecha_prestamo AT TIME ZONE 'America/Mexico_City')::date);

ALTER TABLE prestamo DROP CONSTRAINT IF EXISTS prestamo_dias_check;
ALTER TABLE prestamo
  ADD CONSTRAINT prestamo_dias_check
  CHECK (dias_prestamo > 0);

ALTER TABLE multa DROP CONSTRAINT IF EXISTS multa_monto_check;
ALTER TABLE multa
  ADD CONSTRAINT multa_monto_check
  CHECK (monto >= 0);

ALTER TABLE multa DROP CONSTRAINT IF EXISTS multa_dias_check;
ALTER TABLE multa
  ADD CONSTRAINT multa_dias_check
  CHECK (dias_retraso >= 0);

ALTER TABLE sancion DROP CONSTRAINT IF EXISTS sancion_fechas_check;
ALTER TABLE sancion
  ADD CONSTRAINT sancion_fechas_check
  CHECK (fecha_fin >= fecha_inicio);

ALTER TABLE regla_prestamo DROP CONSTRAINT IF EXISTS regla_prestamo_fechas_check;
ALTER TABLE regla_prestamo
  ADD CONSTRAINT regla_prestamo_fechas_check
  CHECK (vigente_hasta IS NULL OR vigente_hasta >= vigente_desde);

-- 3. Trigger de devolucion ----------------------------------
-- Cierra el prestamo y deja el ejemplar disponible o en reparacion.
CREATE OR REPLACE FUNCTION fn_registrar_devolucion()
RETURNS TRIGGER AS $$
DECLARE
  v_id_ejemplar INTEGER;
  v_estado "estado_ejemplar";
BEGIN
  UPDATE prestamo
     SET fecha_devolucion = NEW.fecha
   WHERE id_prestamo = NEW.id_prestamo
     AND fecha_devolucion IS NULL
  RETURNING id_ejemplar INTO v_id_ejemplar;

  IF v_id_ejemplar IS NULL THEN
    RAISE EXCEPTION 'El prestamo % no existe o ya fue devuelto', NEW.id_prestamo;
  END IF;

  v_estado := COALESCE(
    NEW.estado_ejemplar_resultante,
    CASE
      WHEN NEW.estado_fisico_al_recibir = 'DETERIORADO'
        THEN 'EN_REPARACION'::"estado_ejemplar"
      ELSE 'DISPONIBLE'::"estado_ejemplar"
    END
  );

  UPDATE ejemplar
     SET estado = v_estado
   WHERE id_ejemplar = v_id_ejemplar;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_registrar_devolucion ON devolucion;
CREATE TRIGGER trg_registrar_devolucion
AFTER INSERT ON devolucion
FOR EACH ROW
EXECUTE FUNCTION fn_registrar_devolucion();

-- 4. Datos iniciales ----------------------------------------

-- Roles
INSERT INTO rol (nombre)
VALUES
  ('ADMINISTRADOR'),
  ('MOSTRADOR'),
  ('INVENTARIO')
ON CONFLICT (nombre) DO NOTHING;

-- Permisos
INSERT INTO permiso (codigo, descripcion, es_global)
VALUES
  ('catalogo.ver',        'Consultar el catalogo y la disponibilidad', true),
  ('catalogo.gestionar',  'Registrar, editar y dar de baja ejemplares', true),
  ('prestamos.registrar', 'Registrar prestamos', true),
  ('devoluciones.registrar', 'Registrar devoluciones', true),
  ('multas.ver',          'Consultar multas y sanciones', true),
  ('multas.gestionar',    'Registrar pagos, condonar y aplicar sanciones', true),
  ('lectores.ver',        'Consultar lectores', true),
  ('lectores.gestionar',  'Registrar y editar lectores', true),
  ('personal.ver',        'Consultar personal de la biblioteca', true),
  ('personal.gestionar',  'Crear y editar personal, roles y permisos', true),
  ('reportes.ver',        'Generar reportes de operacion', true),
  ('auditoria.ver',       'Consultar la bitacora de auditoria', true)
ON CONFLICT (codigo) DO NOTHING;

-- Permisos por rol
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM (VALUES
  ('ADMINISTRADOR', 'catalogo.ver'),
  ('ADMINISTRADOR', 'catalogo.gestionar'),
  ('ADMINISTRADOR', 'prestamos.registrar'),
  ('ADMINISTRADOR', 'devoluciones.registrar'),
  ('ADMINISTRADOR', 'multas.ver'),
  ('ADMINISTRADOR', 'multas.gestionar'),
  ('ADMINISTRADOR', 'lectores.ver'),
  ('ADMINISTRADOR', 'lectores.gestionar'),
  ('ADMINISTRADOR', 'personal.ver'),
  ('ADMINISTRADOR', 'personal.gestionar'),
  ('ADMINISTRADOR', 'reportes.ver'),
  ('ADMINISTRADOR', 'auditoria.ver'),

  ('MOSTRADOR', 'catalogo.ver'),
  ('MOSTRADOR', 'prestamos.registrar'),
  ('MOSTRADOR', 'devoluciones.registrar'),
  ('MOSTRADOR', 'multas.ver'),
  ('MOSTRADOR', 'multas.gestionar'),
  ('MOSTRADOR', 'lectores.ver'),
  ('MOSTRADOR', 'lectores.gestionar'),

  ('INVENTARIO', 'catalogo.ver'),
  ('INVENTARIO', 'catalogo.gestionar')
) AS m(rol, permiso)
JOIN rol r ON r.nombre = m.rol::"nombre_rol"
JOIN permiso p ON p.codigo = m.permiso
ON CONFLICT DO NOTHING;

-- Reglas de prestamo iniciales (alimentan el select "Plazo")
INSERT INTO regla_prestamo
  (nombre, dias_prestamo, max_prestamos_por_cliente, multa_por_dia, dias_sancion_base, vigente_desde)
VALUES
  ('Estudiante 7 dias', 7, 3, 5.00, 3, CURRENT_DATE),
  ('General 10 dias',  10, 3, 5.00, 3, CURRENT_DATE),
  ('Docente 15 dias',  15, 5, 5.00, 3, CURRENT_DATE)
ON CONFLICT (nombre) DO NOTHING;
