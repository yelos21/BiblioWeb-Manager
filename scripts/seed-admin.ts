import "dotenv/config";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

type TipoDocumento = "DNI" | "PASAPORTE" | "CEDULA" | "OTRO";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const nombres = process.env.SEED_ADMIN_NOMBRES?.trim() || "Administrador";
  const apellidos = process.env.SEED_ADMIN_APELLIDOS?.trim() || "BiblioWeb";
  const tipoDocumento = (process.env.SEED_ADMIN_TIPO_DOCUMENTO?.trim() ||
    "DNI") as TipoDocumento;
  const numeroDocumento =
    process.env.SEED_ADMIN_DOCUMENTO?.trim() || "00000001";

  if (!email || !password) {
    throw new Error(
      "Definir SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD en el entorno.",
    );
  }
  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }

  const rol = await prisma.rol.findUnique({
    where: { nombre: "ADMINISTRADOR" },
  });
  if (!rol) {
    throw new Error(
      "No existe el rol ADMINISTRADOR. Ejecuta primero: pnpm db:extras",
    );
  }

  const usuarioAuthExistente = await prisma.user.findUnique({
    where: { email },
  });

  let idAuth: string;

  if (usuarioAuthExistente) {
    idAuth = usuarioAuthExistente.id;
    console.log("La cuenta de Better Auth ya existe:", email);
  } else {
    const { user } = await auth.api.createUser({
      body: {
        email,
        password,
        name: `${nombres} ${apellidos}`,
        role: "ADMINISTRADOR",
      },
    });
    idAuth = user.id;
    console.log("Cuenta de Better Auth creada:", email);
  }

  const perfilExistente = await prisma.usuario.findUnique({
    where: { idAuth },
  });

  if (perfilExistente) {
    console.log("El perfil de Usuario ya existe. Nada que hacer.");
    return;
  }

  await prisma.usuario.create({
    data: {
      idAuth,
      idRol: rol.id,
      nombres,
      apellidos,
      tipoDocumento,
      numeroDocumento,
      debeCambiarPassword: true,
    },
  });

  console.log("Perfil de administrador creado correctamente.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
