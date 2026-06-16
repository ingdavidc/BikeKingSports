import { getRequestContext } from '@cloudflare/next-on-pages';
import { compare } from 'bcrypt-ts';

export const runtime = 'edge';

const SECRET = process.env.JWT_SECRET || 'bikeking-super-secret-key-2026';

// Edge-compatible JWT signer using Web Crypto API
async function signJWT(payload, secret) {
  const encoder = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const data = encoder.encode(`${headerB64}.${payloadB64}`);

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, data);
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

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

    // Crear el token JWT nativamente
    const payloadInfo = {
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    };

    const token = await signJWT(payloadInfo, SECRET);

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
