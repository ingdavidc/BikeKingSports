// ============================================================
// functions/api/auth/me.js
// Devuelve el perfil del usuario autenticado.
// El middleware ya verificó el token antes de llegar aquí.
// ============================================================

export async function onRequestGet(context) {
  const user = context.data?.user;

  if (!user) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  // Solo devolver campos seguros del payload — nunca exponer id interno completo
  return Response.json({
    authenticated: true,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
