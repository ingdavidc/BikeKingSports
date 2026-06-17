'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import LogoutButton from '@/components/admin/LogoutButton';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          
          // Role-based redirect logic
          if (data.user.role === 'tecnico' && (pathname.startsWith('/admin/personal') || pathname.startsWith('/admin/sitio-web'))) {
            router.push('/admin');
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: 'white' }}>Cargando panel...</div>;
  }

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const userName = user.name;
  const userRole = user.role;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', color: '#0f172a' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #1e293b' }}>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#38bdf8' }}>Bike King Admin</h2>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            <span style={{ display: 'block', fontWeight: 'bold', color: 'white' }}>{userName}</span>
            <span style={{ textTransform: 'capitalize' }}>Rol: {userRole}</span>
          </div>
        </div>
        
        <nav style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href="/admin" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '10px', borderRadius: '6px', transition: 'background 0.2s', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            📊 Dashboard
          </Link>

          {(isAdmin || userRole === 'ventas') && (
            <>
              <Link href="/admin/sitio-web" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '10px', borderRadius: '6px', transition: 'background 0.2s' }}>
                📝 Sitio Web
              </Link>
              <Link href="/admin/inventario" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '10px', borderRadius: '6px', transition: 'background 0.2s' }}>
                🚲 Inventario
              </Link>
            </>
          )}

            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#94a3b8', textDecoration: 'none', padding: '8px 10px', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            🌍 Ver Sitio Público
          </a>
        </nav>

        {/* Logout area */}
        <div style={{ padding: '16px', borderTop: '1px solid #1e293b' }}>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}

// Pequeño helper para los links del menú lateral
function NavLink({ href, icon, label }) {
  return (
    <Link
      href={href}
      style={{
        color: 'white',
        textDecoration: 'none',
        padding: '8px 10px',
        borderRadius: '6px',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span>{icon}</span> {label}
    </Link>
  );
}

