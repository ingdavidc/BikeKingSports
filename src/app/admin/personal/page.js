'use client';

import { useState, useEffect } from 'react';

export default function Personal() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '', email: '', password: '', role: 'tecnico'
  });

  const loadUsers = () => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_user',
          payload: newUser
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('¡Usuario agregado!');
        setNewUser({ name: '', email: '', password: '', role: 'tecnico' });
        loadUsers();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error al guardar el usuario');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario permanentemente?')) return;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_user', payload: { id } })
      });
      if (res.ok) {
        loadUsers();
      }
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') return <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Administrador</span>;
    if (role === 'ventas') return <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Ventas</span>;
    if (role === 'tecnico') return <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Técnico</span>;
    return <span>{role}</span>;
  };

  if (loading) return <div>Cargando personal...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Gestión de Personal y Roles</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Administra las cuentas de acceso para tu equipo de trabajo.</p>
      
      {/* Formulario para agregar usuario */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Añadir Nuevo Empleado</h2>
        <form onSubmit={handleAddUser} style={{ display: 'grid', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Nombre Completo</label>
              <input required type="text" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Rol / Cargo</label>
              <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                <option value="tecnico">Técnico (Taller)</option>
                <option value="ventas">Ventas (Mostrador)</option>
                <option value="admin">Administrador (Control Total)</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Correo de Acceso (Email)</label>
              <input required type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Contraseña Temporal</label>
              <input required type="text" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} placeholder="Ejem: bici1234" />
            </div>
          </div>
          
          <button type="submit" disabled={saving} style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
            Crear Cuenta de Acceso
          </button>
        </form>
      </div>

      {/* Lista de Personal */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Equipo Actual ({users.length})</h2>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '15px', color: '#475569' }}>Nombre</th>
              <th style={{ padding: '15px', color: '#475569' }}>Correo</th>
              <th style={{ padding: '15px', color: '#475569' }}>Rol</th>
              <th style={{ padding: '15px', color: '#475569' }}>Estado</th>
              <th style={{ padding: '15px', color: '#475569' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px', fontWeight: 'bold', color: '#1e293b' }}>{u.name}</td>
                <td style={{ padding: '15px', color: '#64748b' }}>{u.email}</td>
                <td style={{ padding: '15px' }}>{getRoleBadge(u.role)}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ color: u.status === 'activo' ? '#16a34a' : '#ef4444' }}>
                    {u.status === 'activo' ? '🟢 Activo' : '🔴 Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>
                  <button onClick={() => handleDelete(u.id)} style={{ backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No hay personal registrado aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
