// ============================================================
// functions/api/auth/logout.js
// Cierra la sesión eliminando la cookie de autenticación.
// ============================================================

export async function onRequestPost(context) {
  const isProduction = context.request.url.startsWith('https://');
  const headers = new Headers({ 'Content-Type': 'application/json' });

  // Borrar cookie con todos los mismos atributos que se usaron al crearla
  headers.append(
    'Set-Cookie',
    `auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${isProduction ? '; Secure' : ''}`
  );

  return new Response(JSON.stringify({ success: true }), { status: 200, headers });
}
