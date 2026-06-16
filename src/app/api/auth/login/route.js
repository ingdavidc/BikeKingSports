import { getRequestContext } from '@cloudflare/next-on-pages';
import { compare } from 'bcrypt-ts';
import { SignJWT } from 'jose';

export const runtime = 'edge';

// We need a secret key for signing JWTs. We'll use an environment variable or a fallback.
const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'bikeking-super-secret-key-2026');

export async function POST(request) {
  try {
    const DB = getRequestContext().env.DB;
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: 'Faltan credenciales' }, { status: 400 });
    }

    // Buscar al usuario por email
    const user = await DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();

    if (!user) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    if (user.status !== 'activo') {
      return Response.json({ error: 'Cuenta inactiva' }, { status: 403 });
    }

    // Verificar la contraseña
    const isValid = await compare(password, user.password_hash);

    if (!isValid) {
      return Response.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Crear el token JWT
    const token = await new SignJWT({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(getSecret());

    // Crear la respuesta y configurar la cookie de sesión
    const response = Response.json({ 
      success: true, 
      user: { id: user.id, name: user.name, role: user.role } 
    });

    response.headers.append(
      'Set-Cookie', 
      `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24}`
    );

    return response;

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
