import type { requiereUsuario } from "@/lib/session";
type UsuarioConPermisos = Awaited<ReturnType<typeof requiereUsuario>>["usuario"];
export function codigosDePermisos(usuario: UsuarioConPermisos): string[] {
    const codigos = new Set<string>();
    for (const rp of usuario.rol.permisos) codigos.add(rp.permiso.codigo);
    for (const up of usuario.permisos) codigos.add(up.permiso.codigo);
    return [...codigos];
}