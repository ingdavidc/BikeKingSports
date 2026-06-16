import Link from 'next/link';

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#1e293b', color: 'white', padding: '20px' }}>
        <h2 style={{ marginBottom: '30px', fontSize: '1.2rem', color: '#38bdf8' }}>Bike King Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Link href="/admin" style={{ color: 'white', textDecoration: 'none', padding: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
            📊 Dashboard
          </Link>
          <Link href="/admin/contenido" style={{ color: 'white', textDecoration: 'none', padding: '8px', borderRadius: '4px' }}>
            📝 Gestor de Contenido
          </Link>
          <Link href="/admin/inventario" style={{ color: 'white', textDecoration: 'none', padding: '8px', borderRadius: '4px' }}>
            🚲 Inventario
          </Link>
          <a href="/" target="_blank" style={{ color: '#94a3b8', textDecoration: 'none', padding: '8px', marginTop: '20px', borderTop: '1px solid #334155' }}>
            🌍 Ver Sitio Público
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
