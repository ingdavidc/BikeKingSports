import { NextResponse } from 'next/server';

const SECRET = process.env.JWT_SECRET || 'bikeking-super-secret-key-2026';

// Edge-compatible JWT verifier using Web Crypto API
async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const [headerB64, payloadB64, signatureB64] = parts;

  const encoder = new TextEncoder();
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  
  // Base64Url decode signature
  const sigRaw = atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/'));
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

  const payloadStr = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
  const payload = JSON.parse(payloadStr);
  
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
}

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // Solo proteger las rutas que empiezan con /admin
  if (path.startsWith('/admin')) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // No hay token, redirigir al login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verificar el token nativamente
      const payload = await verifyJWT(token, SECRET);
      
      // Control de acceso por Roles
      const role = payload.role;

      // Un técnico NO puede acceder a gestión de personal ni administración web
      if (role === 'tecnico' && (path.startsWith('/admin/personal') || path.startsWith('/admin/sitio-web'))) {
        return NextResponse.redirect(new URL('/admin', request.url)); // Mandarlo al dashboard
      }

      // Añadir headers con la info del usuario
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-role', role);
      requestHeaders.set('x-user-name', payload.name);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

    } catch (error) {
      // Token inválido o expirado
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
