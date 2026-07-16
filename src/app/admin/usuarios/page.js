'use client';

import { useState, useEffect, useCallback } from 'react';

const ROLE_LABELS = {
  admin: 'Administrador',
  ventas: 'Ventas',
  mecanico: 'Mecánico',
};

const ROLE_COLORS = {
  admin:    { bg: '#e0e7ff', text: '#4338ca' },
  ventas:   { bg: '#dcfce7', text: '#15803d' },
  mecanico: { bg: '#fef3c7', text: '#b45309' },
};

const STATUS_COLORS = {
  activo:   { bg: '#dcfce7', text: '#15803d' },
  inactivo: { bg: '#fee2e2', text: '#991b1b' },
};

export default function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({ open: false, message: '', onConfirm: null });

  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'ventas', identification: '', phone: '' });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setPageError('');
      const res = await fetch('/api/users');
      if (res.ok) {
        setUsers(await res.json());
      } else {
        const d = await res.json().catch(() => ({}));
        setPageError(d.error || 'Error al obtener usuarios');
      }
    } catch {
      setPageError('Error de red. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const openModal = (user = null) => {
    setFormError('');
    if (user) {
      setIsEditing(true);
      setCurrentUser(user);
      setFormData({ 
        name: user.name || '', 
        email: user.email || '', 
        password: '', 
        role: user.role || 'ventas',
        identification: user.identification || '',
        phone: user.phone || ''
      });
    } else {
      setIsEditing(false);
      setCurrentUser(null);
      setFormData({ name: '', email: '', password: '', role: 'ventas', identification: '', phone: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setFormError(''); };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validación frontend
    if (!formData.name.trim()) return setFormError('El nombre es requerido');
    if (!isEditing && !formData.email.trim()) return setFormError('El correo es requerido');
    if (!isEditing && formData.password.length < 8) return setFormError('La contraseña debe tener al menos 8 caracteres');
    if (isEditing && formData.password && formData.password.length < 8) return setFormError('La contraseña debe tener al menos 8 caracteres');

    setSubmitting(true);
    try {
      const action = isEditing ? 'update_user' : 'add_user';
      const payload = isEditing
        ? { 
            id: currentUser.id, 
            name: formData.name.trim(), 
            role: formData.role, 
            identification: formData.identification.trim(),
            phone: formData.phone.trim(),
            ...(formData.password ? { password: formData.password } : {}) 
          }
        : {
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            role: formData.role,
            identification: formData.identification.trim(),
            phone: formData.phone.trim()
          };

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        closeModal();
        fetchUsers();
        showSuccess(isEditing ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
      } else {
        setFormError(data.error || 'Ocurrió un error. Intenta nuevamente.');
      }
    } catch {
      setFormError('Error de conexión con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = (user) => {
    if (user.email === 'admin@bikekingsports.com') {
      alert('No puedes cambiar el estado del superusuario principal.');
      return;
    }
    const newStatus = user.status === 'activo' ? 'inactivo' : 'activo';
    const action = newStatus === 'inactivo' ? 'desactivar' : 'activar';
    setConfirmDialog({
      open: true,
      message: `¿Seguro que quieres ${action} a ${user.name}?`,
      onConfirm: async () => {
        setConfirmDialog({ open: false });
        try {
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_status', payload: { id: user.id, status: newStatus } }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            fetchUsers();
            showSuccess(`Usuario ${action === 'desactivar' ? 'desactivado' : 'activado'}.`);
          } else {
            setPageError(data.error || 'Error al cambiar el estado');
          }
        } catch {
          setPageError('Error de conexión.');
        }
      }
    });
  };

  const handleDelete = (user) => {
    if (user.email === 'admin@bikekingsports.com') {
      alert('El superusuario principal es imborrable.');
      return;
    }
    setConfirmDialog({
      open: true,
      message: `¿Eliminar permanentemente a ${user.name}? Esta acción no se puede deshacer.`,
      destructive: true,
      onConfirm: async () => {
        setConfirmDialog({ open: false });
        try {
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete_user', payload: { id: user.id } }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            fetchUsers();
            showSuccess('Usuario eliminado.');
          } else {
            setPageError(data.error || 'Error al eliminar');
          }
        } catch {
          setPageError('Error de conexión.');
        }
      }
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Gestión de Usuarios</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '0.9rem' }}>
            Administra los empleados y sus accesos al sistema.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          style={{
            padding: '10px 20px', backgroundColor: '#1964a6', color: 'white',
            border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
            fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(25,100,166,0.2)'
          }}
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Mensajes de estado */}
      {pageError && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{pageError}</span>
          <button onClick={() => setPageError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 'bold' }}>✕</button>
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px', marginBottom: '16px' }}>
          ✅ {successMsg}
        </div>
      )}

      {/* Tabla de usuarios */}
      <div style={{ backgroundColor: 'white', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              {['Nombre', 'Correo', 'Documento', 'Rol', 'Estado', 'Acciones'].map((h, i) => (
                <th key={h} style={{ padding: '13px 16px', textAlign: i === 5 ? 'right' : 'left', color: '#0f172a', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Cargando usuarios...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No hay usuarios registrados.</td></tr>
            ) : users.map(user => {
              const roleMeta = ROLE_COLORS[user.role] || { bg: '#f1f5f9', text: '#475569' };
              const statusMeta = STATUS_COLORS[user.status] || STATUS_COLORS.inactivo;
              const isSuperAdmin = user.email === 'admin@bikekingsports.com';
              return (
                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 500 }}>
                    {user.name}
                    {isSuperAdmin && <span style={{ marginLeft: '8px', fontSize: '0.7rem', backgroundColor: '#fef08a', color: '#854d0e', padding: '2px 6px', borderRadius: '4px' }}>SUPERADMIN</span>}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.9rem' }}>{user.email}</td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.9rem' }}>{user.identification || '-'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: roleMeta.bg, color: roleMeta.text }}>
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => handleToggleStatus(user)}
                      disabled={isSuperAdmin}
                      title={isSuperAdmin ? 'El superadmin no se puede desactivar' : `Click para ${user.status === 'activo' ? 'desactivar' : 'activar'}`}
                      style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: isSuperAdmin ? 'not-allowed' : 'pointer', backgroundColor: statusMeta.bg, color: statusMeta.text, opacity: isSuperAdmin ? 0.6 : 1 }}
                    >
                      {user.status === 'activo' ? '● Activo' : '○ Inactivo'}
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button onClick={() => openModal(user)} style={{ marginRight: '12px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                      Editar
                    </button>
                    {!isSuperAdmin && (
                      <button onClick={() => handleDelete(user)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{ backgroundColor: 'white', color: '#0f172a', padding: '32px', borderRadius: '10px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>
              {isEditing ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
            </h2>

            {formError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Nombres y Apellidos</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} maxLength={100} style={inputStyle} placeholder="Juan Pérez" />
                </div>
                <div>
                  <label style={labelStyle}>Correo Electrónico</label>
                  <input required={!isEditing} disabled={isEditing} type="email" name="email" value={formData.email} onChange={handleChange} maxLength={254} style={{ ...inputStyle, backgroundColor: isEditing ? '#f8fafc' : 'white', color: isEditing ? '#94a3b8' : 'inherit' }} placeholder="usuario@empresa.com" />
                </div>
                <div>
                  <label style={labelStyle}>Documento de Identidad (Opcional)</label>
                  <input type="text" name="identification" value={formData.identification} onChange={handleChange} maxLength={50} style={inputStyle} placeholder="Ej. 123456789" />
                </div>
                <div>
                  <label style={labelStyle}>Teléfono (Opcional)</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} maxLength={50} style={inputStyle} placeholder="Ej. 3001234567" />
                </div>
                <div>
                  <label style={labelStyle}>Rol</label>
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange} 
                    style={{...inputStyle, backgroundColor: (isEditing && currentUser?.email === 'admin@bikekingsports.com') ? '#f8fafc' : 'white'}}
                    disabled={isEditing && currentUser?.email === 'admin@bikekingsports.com'}
                  >
                    <option value="ventas">Ventas</option>
                    <option value="mecanico">Mecánico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>
                    Contraseña{' '}
                    {isEditing && <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 400 }}>(Opcional)</span>}
                  </label>
                  <input
                    required={!isEditing}
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={8}
                    maxLength={128}
                    style={inputStyle}
                    placeholder={isEditing ? '••••••••' : 'Mínimo 8 caracteres'}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={closeModal} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#0f172a', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 20px', backgroundColor: submitting ? '#93c5fd' : '#1964a6', color: 'white', border: 'none', borderRadius: '6px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                  {submitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación personalizado (reemplaza confirm()) */}
      {confirmDialog.open && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', color: '#0f172a', padding: '28px', borderRadius: '10px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <p style={{ margin: '0 0 24px', fontSize: '1rem', lineHeight: 1.5, color: '#0f172a' }}>
              {confirmDialog.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirmDialog({ open: false })} style={{ padding: '9px 18px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#0f172a', borderRadius: '6px', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={confirmDialog.onConfirm} style={{ padding: '9px 18px', backgroundColor: confirmDialog.destructive ? '#ef4444' : '#1964a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: 'block', marginBottom: '6px', fontWeight: 600,
  fontSize: '0.88rem', color: '#374151',
};

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: '6px',
  border: '1px solid #d1d5db', fontSize: '0.95rem',
  boxSizing: 'border-box', outline: 'none',
};
