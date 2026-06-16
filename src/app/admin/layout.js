import Link from 'next/link';
import { headers } from 'next/headers';

export const runtime = 'edge';

export default async function AdminLayout({ children }) {
  const headersList = await headers();
  const userRole = headersList.get('x-user-role') || 'admin';
  const userName = headersList.get('x-user-name') || 'Usuario';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #1e293b' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#38bdf8' }}>Bike King Admin</h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px' }}>Hola, {userName}</p>
        </div>
        
        <nav style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <Link href="/admin" style={{ color: 'white', textDecoration: 'none', padding: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
            📊 Dashboard
          </Link>
          
          {userRole === 'admin' && (
            <>
              <Link href="/admin/personal" style={{ color: 'white', textDecoration: 'none', padding: '8px', borderRadius: '4px' }}>
                👥 Gestión de Personal
              </Link>
              <Link href="/admin/sitio-web" style={{ color: 'white', textDecoration: 'none', padding: '8px', borderRadius: '4px' }}>
                ⚙️ Administración Web
              </Link>
            </>
          )}

          <a href="/" target="_blank" style={{ color: '#94a3b8', textDecoration: 'none', padding: '8px', marginTop: '20px', borderTop: '1px solid #334155' }}>
            🌍 Ver Sitio Público
          </a>
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid #1e293b' }}>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

// Client component for logout action
function LogoutButton() {
  'use client';
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };
  return (
    <button onClick={handleLogout} style={{ width: '100%', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>
      Cerrar Sesión
    </button>
  );
}
