const SECRET = 'bikeking-super-secret-key-2026';

// Edge-compatible JWT verifier using Web Crypto API
async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const [headerB64, payloadB64, signatureB64] = parts;

  const encoder = new TextEncoder();
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  
  // Base64Url decode signature
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

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Solo interceptamos las llamadas a la API que requieren protección
  if (path.startsWith('/api/content') || path.startsWith('/api/upload') || path.startsWith('/api/users') || path.startsWith('/api/auth/me')) {
    const cookieHeader = context.request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
      const payload = await verifyJWT(token, SECRET);
      const role = payload.role;

      // Inyectar datos en el contexto de la función de Cloudflare para que los siguientes handlers puedan usarlo
      context.data = {
        user: payload,
        role: role
      };

      // Si es un mecanico y trata de acceder a usuarios, bloquear
      if (role === 'mecanico' && path.startsWith('/api/users')) {
        return Response.json({ error: 'Acceso denegado' }, { status: 403 });
      }

    } catch (e) {
      return Response.json({ error: 'Token inválido o expirado' }, { status: 401 });
    }
  }

  return await context.next();
}
