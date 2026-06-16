'use client';

// Este componente solo maneja el botón de logout, que necesita ser cliente
// porque tiene un onClick handler. Es importado por admin/layout.js (Server Component).

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {
      // Ignorar errores de red al cerrar sesión
    }
    window.location.href = '/login';
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        width: '100%',
        backgroundColor: 'transparent',
        color: '#ef4444',
        border: '1px solid #ef4444',
        padding: '8px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        transition: 'all 0.2s',
      }}
    >
      🚪 Cerrar Sesión
    </button>
  );
}
