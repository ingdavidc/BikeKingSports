import Link from 'next/link';
import { headers } from 'next/headers';
import LogoutButton from '@/components/admin/LogoutButton';

export const runtime = 'edge';

export default async function AdminLayout({ children }) {
  const headersList = await headers();
  // El middleware garantiza que x-user-role siempre estará presente para usuarios autenticados.
  // Si por algún motivo no existe, lo tratamos como el rol más restrictivo (no admin).
  const userRole = headersList.get('x-user-role') || '';
  const userName = headersList.get('x-user-name') || 'Usuario';
  const isAdmin = userRole === 'admin';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', color: '#0f172a' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        minWidth: '260px',
        backgroundColor: '#0f172a',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 15px rgba(0,0,0,0.3)',
      }}>
        {/* Logo area */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#38bdf8', letterSpacing: '1px', textTransform: 'uppercase' }}>
            🚲 Bike King
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Panel Administrativo
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600' }}>
            {userName}
            <span style={{ marginLeft: '6px', fontSize: '0.7rem', color: '#38bdf8', backgroundColor: '#0f2d4a', padding: '1px 6px', borderRadius: '10px' }}>
              {userRole || 'sin rol'}
            </span>
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <NavLink href="/admin" icon="📊" label="Dashboard" />

          {/* Solo Admins ven estas secciones */}
          {isAdmin && (
            <>
              <div style={{ marginTop: '16px', marginBottom: '4px', padding: '0 8px', fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Gestión
              </div>
              <NavLink href="/admin/personal" icon="👥" label="Personal y Roles" />
              <NavLink href="/admin/sitio-web" icon="⚙️" label="Sitio Web" />
            </>
          )}

          {/* Secciones para todos los roles autenticados */}
          <div style={{ marginTop: '16px', marginBottom: '4px', padding: '0 8px', fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Accesos Rápidos
          </div>
          <a
            href="/"
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
