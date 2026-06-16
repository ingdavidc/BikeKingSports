import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'bikeking-super-secret-key-2026');

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
      // Verificar el token
      const { payload } = await jwtVerify(token, getSecret());
      
      // Control de acceso por Roles
      const role = payload.role;

      // Un técnico NO puede acceder a gestión de personal ni administración web (a menos que ajustemos la lógica)
      if (role === 'tecnico' && (path.startsWith('/admin/personal') || path.startsWith('/admin/sitio-web'))) {
        return NextResponse.redirect(new URL('/admin', request.url)); // Mandarlo al dashboard
      }

      // Si todo está bien, añadir headers con la info del usuario para que las páginas puedan leerlo si lo necesitan
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
