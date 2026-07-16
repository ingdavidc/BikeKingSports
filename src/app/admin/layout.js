'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import LogoutButton from '@/components/admin/LogoutButton';
import { LayoutDashboard, TrendingUp, Package, Globe, Users, ExternalLink, Bike } from 'lucide-react';

export default function AdminLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res  = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        const u    = data.user;
        setUser(u);

        // Redireccionamiento automático por rol al entrar al admin raíz
        if (pathname === '/admin') {
          if (u.role === 'mecanico') router.replace('/admin/mecanico');
          else if (u.role === 'ventas') router.replace('/admin/ventas');
        }

        // Bloquear acceso a rutas no permitidas
        if (u.role === 'mecanico') {
          const blocked = ['/admin/usuarios', '/admin/sitio-web', '/admin/ventas',
                           '/admin/inventario', '/admin/contenido', '/admin/eventos', '/admin/servicios'];
          if (blocked.some(b => pathname.startsWith(b))) router.replace('/admin/mecanico');
        }
        if (u.role === 'ventas') {
          const blocked = ['/admin/usuarios', '/admin/mecanico'];
          if (blocked.some(b => pathname.startsWith(b))) router.replace('/admin/ventas');
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

  useEffect(() => { checkAuth(); }, [checkAuth]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: 'white', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #1e293b', borderTop: '3px solid #38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Verificando sesión...</span>
      </div>
    );
  }

  if (!user) return null;

  const isAdmin    = user.role === 'admin';
  const isMecanico = user.role === 'mecanico';
  const isVentas   = user.role === 'ventas';

  // El panel del mecánico tiene su propio layout (oscuro, sin sidebar)
  if (isMecanico) {
    return <>{children}</>;
  }

  // ── Sidebar para admin y ventas ──────────────────────────
  const activeStyle = (href) => {
    const isActive = href === '/admin'
      ? pathname === '/admin'
      : pathname.startsWith(href);
    return {
      color: isActive ? '#ffffff' : '#cbd5e1',
      textDecoration: 'none',
      padding: '10px 12px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '0.9rem',
      backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
      fontWeight: isActive ? 600 : 400,
      transition: 'all 0.15s',
    };
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside style={{ width: '240px', minWidth: '240px', backgroundColor: '#124b7d', color: 'white', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', boxShadow: '2px 0 8px rgba(0,0,0,0.1)' }}>
        {/* Logo + usuario */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: '#ffffff', fontWeight: 700, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bike size={20} /> BIKE KING
          </h2>
          <div style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
            <span style={{ display: 'block', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{user.name}</span>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', color: '#ffffff', textTransform: 'capitalize', fontWeight: 600 }}>{user.role}</span>
          </div>
        </div>

        {/* Navegación */}
        <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {/* Admin ve el dashboard general */}
          {isAdmin && <Link href="/admin" style={activeStyle('/admin')}><LayoutDashboard size={18} /> Dashboard</Link>}

          {/* Ventas va directo a su panel */}
          {isVentas && <Link href="/admin/ventas" style={activeStyle('/admin/ventas')}><TrendingUp size={18} /> Mi Panel</Link>}

          {/* Rutas del admin */}
          {isAdmin && (
            <>
              <Link href="/admin/ventas"    style={activeStyle('/admin/ventas')}><TrendingUp size={18} /> Panel de Ventas</Link>
              <Link href="/admin/inventario" style={activeStyle('/admin/inventario')}><Package size={18} /> Inventario</Link>
              <Link href="/admin/sitio-web"  style={activeStyle('/admin/sitio-web')}><Globe size={18} /> Sitio Web</Link>
              <Link href="/admin/usuarios"   style={activeStyle('/admin/usuarios')}><Users size={18} /> Usuarios</Link>
            </>
          )}

          {/* Ventas puede ver inventario */}
          {isVentas && (
            <Link href="/admin/inventario" style={activeStyle('/admin/inventario')}><Package size={18} /> Inventario</Link>
          )}

          <div style={{ marginTop: '8px', borderTop: '1px solid #1e293b', paddingTop: '8px' }}>
            <a href="/" target="_blank" rel="noopener noreferrer" style={{ ...activeStyle('/__external'), color: '#64748b' }}>
              <ExternalLink size={18} /> Ver Tienda Pública
            </a>
          </div>
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid #1e293b' }}>
          <LogoutButton />
        </div>
      </aside>

      {/* Contenido */}
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
