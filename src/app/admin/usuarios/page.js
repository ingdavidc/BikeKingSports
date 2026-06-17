'use client';

import { useState, useEffect } from 'react';

export default function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ventas'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setError('Error al obtener usuarios');
      }
    } catch (err) {
      setError('Error de red al obtener usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setCurrentUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Leave blank when editing
        role: user.role
      });
    } else {
      setIsEditing(false);
      setCurrentUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'ventas'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const payload = { id: currentUser.id, name: formData.name, role: formData.role };
        if (formData.password) payload.password = formData.password;
        
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_user', payload })
        });
        
        if (res.ok) {
          fetchUsers();
          handleCloseModal();
        } else {
          const data = await res.json();
          alert(data.error || 'Error al actualizar usuario');
        }
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_user', payload: formData })
        });
        
        if (res.ok) {
          fetchUsers();
          handleCloseModal();
        } else {
          const data = await res.json();
          alert(data.error || 'Error al crear usuario');
        }
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.role === 'admin' && user.status === 'activo') {
      const confirm = window.confirm('¿Seguro que quieres desactivar a este administrador?');
      if (!confirm) return;
    }
    try {
      const newStatus = user.status === 'activo' ? 'inactivo' : 'activo';
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', payload: { id: user.id, status: newStatus } })
      });
      if (res.ok) {
        fetchUsers();
      } else {
        alert('Error al cambiar el estado');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás totalmente seguro de eliminar a este usuario permanentemente?')) {
      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_user', payload: { id } })
        });
        if (res.ok) {
          fetchUsers();
        } else {
          alert('Error al eliminar');
        }
      } catch (err) {
        alert('Error de conexión');
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Gestión de Usuarios</h1>
        <button 
          onClick={() => handleOpenModal()} 
          style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Nuevo Usuario
        </button>
      </div>

      {error && <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px' }}>{error}</div>}

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', color: '#64748b' }}>Nombre</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#64748b' }}>Correo</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#64748b' }}>Rol</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#64748b' }}>Estado</th>
              <th style={{ padding: '15px', textAlign: 'right', color: '#64748b' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Cargando usuarios...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No hay usuarios registrados.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px' }}>{user.name}</td>
                  <td style={{ padding: '15px', color: '#64748b' }}>{user.email}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold',
                      backgroundColor: user.role === 'admin' ? '#e0e7ff' : user.role === 'ventas' ? '#dcfce7' : '#fef3c7',
                      color: user.role === 'admin' ? '#4338ca' : user.role === 'ventas' ? '#15803d' : '#b45309'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <button 
                      onClick={() => handleToggleStatus(user)}
                      style={{ 
                        border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem',
                        backgroundColor: user.status === 'activo' ? '#dcfce7' : '#fee2e2',
                        color: user.status === 'activo' ? '#15803d' : '#991b1b'
                      }}
                    >
                      {user.status === 'activo' ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <button onClick={() => handleOpenModal(user)} style={{ marginRight: '10px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>Editar</button>
                    <button onClick={() => handleDelete(user.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>{isEditing ? 'Editar Usuario' : 'Crear Usuario'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Correo Electrónico</label>
                <input required={!isEditing} disabled={isEditing} type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: isEditing ? '#f1f5f9' : 'white' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Contraseña {isEditing && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>(Dejar en blanco para no cambiar)</span>}</label>
                <input required={!isEditing} minLength={6} type="password" name="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Rol</label>
                <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                  <option value="ventas">Ventas (Acceso a Sitio Web e Inventario)</option>
                  <option value="mecanico">Mecánico (Limitado)</option>
                  <option value="admin">Administrador (Acceso Total)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={handleCloseModal} style={{ padding: '10px 20px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{isEditing ? 'Guardar Cambios' : 'Crear Usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
