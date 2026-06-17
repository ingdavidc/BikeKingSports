// ============================================================
// functions/_middleware.js
// Middleware global de Cloudflare Pages Functions.
// Verifica autenticación JWT en rutas protegidas.
// ============================================================

const PROTECTED_PREFIXES = [
  '/api/content',
  '/api/upload',
  '/api/users',
  '/api/auth/me',
];

// Base64Url → ArrayBuffer para verificación HMAC
function base64urlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const raw = atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token structure');
  const [headerB64, payloadB64, signatureB64] = parts;

  const encoder = new TextEncoder();
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = base64urlDecode(signatureB64);

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const isValid = await crypto.subtle.verify('HMAC', key, signature, data);
  if (!isValid) throw new Error('Invalid signature');

  const payloadStr = new TextDecoder().decode(base64urlDecode(payloadB64));
  const payload = JSON.parse(payloadStr);

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < now) throw new Error('Token expired');
  if (!payload.iat || payload.iat > now + 60) throw new Error('Token from future');

  return payload;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  const isProtected = PROTECTED_PREFIXES.some(p => path.startsWith(p));
  if (!isProtected) return await context.next();

  const cookieHeader = context.request.headers.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1].trim() : null;

  if (!token) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  // JWT_SECRET debe configurarse en Cloudflare Pages → Settings → Variables
  const SECRET = context.env.JWT_SECRET || 'bikeking-super-secret-key-2026';

  try {
    const payload = await verifyJWT(token, SECRET);

    // Inyectar datos de usuario al contexto para los handlers
    context.data = { user: payload, role: payload.role };

    // Mecánicos no pueden gestionar usuarios
    if (payload.role === 'mecanico' && path.startsWith('/api/users')) {
      return Response.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Solo admins pueden hacer escritura de contenido (POST en /api/content)
    if (
      payload.role === 'mecanico' &&
      path.startsWith('/api/content') &&
      context.request.method === 'POST'
    ) {
      return Response.json({ error: 'Acceso denegado' }, { status: 403 });
    }

  } catch (e) {
    return Response.json({ error: 'Token inválido o expirado' }, { status: 401 });
  }

  return await context.next();
}
