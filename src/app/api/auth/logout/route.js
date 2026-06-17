export async function POST(request) {
  const response = Response.json({ success: true });
  
  // Limpiar la cookie de sesión
  response.headers.append(
    'Set-Cookie', 
    `auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
  );

  return response;
}
