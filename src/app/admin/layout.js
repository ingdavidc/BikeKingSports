'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import LogoutButton from '@/components/admin/LogoutButton';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);

        // Redirigir basado en rol
        if (data.user.role === 'mecanico') {
          if (
            pathname.startsWith('/admin/usuarios') ||
            pathname.startsWith('/admin/sitio-web')
          ) {
            router.replace('/admin');
          }
        }
      } else {
        router.replace('/login');
      }
    } catch {
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', backgroundColor: '#0f172a', color: 'white',
        flexDirection: 'column', gap: '12px'
      }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #1e293b', borderTop: '3px solid #38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Verificando sesión...</span>
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const canEditContent = isAdmin || user.role === 'ventas';

  const navLinkStyle = (href) => ({
    color: pathname === href || (href !== '/admin' && pathname.startsWith(href)) ? '#38bdf8' : '#cbd5e1',
    textDecoration: 'none',
    padding: '10px 12px',
    borderRadius: '6px',
    transition: 'background 0.2s, color 0.2s',
    backgroundColor: pathname === href || (href !== '/admin' && pathname.startsWith(href))
      ? 'rgba(56, 189, 248, 0.1)'
      : 'transparent',
    display: 'block',
    fontSize: '0.9rem',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px', minWidth: '250px', backgroundColor: '#0f172a',
        color: 'white', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #1e293b' }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#38bdf8', fontWeight: 700 }}>
            🚲 Bike King Admin
          </h2>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            <span style={{ display: 'block', fontWeight: 'bold', color: 'white', marginBottom: '2px' }}>
              {user.name}
            </span>
            <span style={{
              backgroundColor: '#1e293b', padding: '2px 8px', borderRadius: '12px',
              fontSize: '0.75rem', textTransform: 'capitalize', color: '#7dd3fc'
            }}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Navegación */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Link href="/admin" style={navLinkStyle('/admin')}>
            📊 Dashboard
          </Link>

          {canEditContent && (
            <>
              <Link href="/admin/sitio-web" style={navLinkStyle('/admin/sitio-web')}>
                📝 Sitio Web
              </Link>
              <Link href="/admin/inventario" style={navLinkStyle('/admin/inventario')}>
                🚲 Inventario
              </Link>
            </>
          )}

          {isAdmin && (
            <Link href="/admin/usuarios" style={navLinkStyle('/admin/usuarios')}>
              👥 Usuarios
            </Link>
          )}

          <div style={{ marginTop: '8px', borderTop: '1px solid #1e293b', paddingTop: '8px' }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...navLinkStyle('/'), color: '#94a3b8' }}
            >
              🌍 Ver Tienda Pública
            </a>
          </div>
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid #1e293b' }}>
          <LogoutButton />
        </div>
      </aside>

      {/* Contenido principal */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
