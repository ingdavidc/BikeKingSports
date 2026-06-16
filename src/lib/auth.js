/**
 * Shared JWT verification utility for Edge API routes.
 * Uses the Web Crypto API — no external dependencies needed.
 */

const SECRET = process.env.JWT_SECRET || 'bikeking-super-secret-key-2026';

export async function verifyAuthHeader(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token) return null;

  try {
    return await verifyJWT(token, SECRET);
  } catch (_) {
    return null;
  }
}

async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const [headerB64, payloadB64, signatureB64] = parts;

  const encoder = new TextEncoder();
  const data = encoder.encode(`${headerB64}.${payloadB64}`);

  // Base64Url → Base64
  const sigRaw = atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(signatureB64.length / 4) * 4, '='));
  const signature = new Uint8Array(sigRaw.length);
  for (let i = 0; i < sigRaw.length; i++) {
    signature[i] = sigRaw.charCodeAt(i);
  }

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const isValid = await crypto.subtle.verify('HMAC', key, signature, data);
  if (!isValid) throw new Error('Invalid signature');

  const payloadStr = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payloadB64.length / 4) * 4, '='));
  const payload = JSON.parse(payloadStr);

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
}

export function unauthorized(message = 'No autorizado') {
  return Response.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'Acceso denegado') {
  return Response.json({ error: message }, { status: 403 });
}
