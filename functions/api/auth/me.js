export async function onRequestGet(context) {
  // El _middleware.js ya verificó el token y pobló context.data
  const user = context.data?.user;
  
  if (!user) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  return Response.json({
    authenticated: true,
    user: {
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}
