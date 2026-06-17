export const runtime = 'edge';
import { getRequestContext } from '@cloudflare/next-on-pages';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "bikeking_salt_123");
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
  const SECRET = 'bikeking-super-secret-key-2026';
  try {
    const DB = getRequestContext().env.DB;
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: 'Faltan credenciales' }, { status: 400 });
    }

    // SECURITY: Mensaje genérico para evitar enumeración de usuarios
    const GENERIC_ERROR = 'Credenciales inválidas';

    const user = await DB.prepare("SELECT * FROM users WHERE email = ?").bind(email.toLowerCase().trim()).first();

    if (!user) {
      return Response.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    if (user.status !== 'activo') {
      return Response.json({ error: 'Cuenta inactiva. Contacta al administrador.' }, { status: 403 });
    }

    const inputHash = await hashPassword(password);
    const isValid = (inputHash === user.password_hash);

    if (!isValid) {
      return Response.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    const payloadInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
    };

    const token = await signJWT(payloadInfo, SECRET);

    const isProduction = request.url.startsWith('https://');
    const secureCookie = isProduction ? '; Secure' : '';

    const response = Response.json({
      success: true,
      user: { id: user.id, name: user.name, role: user.role },
    });

    response.headers.append(
      'Set-Cookie',
      `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24}${secureCookie}`
    );

    return response;

  } catch (error) {
    // No exponer detalles internos al cliente
    console.error('Login error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

