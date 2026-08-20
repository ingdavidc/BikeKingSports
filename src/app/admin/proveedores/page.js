'use client';

import { useState, useEffect } from 'react';

export default function ProveedoresPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '', name: '', document: '', email: '', phone: '',
    contact_person: '', brands: '', category: '', website: '',
    address: '', payment_terms: '', notes: ''
  });

  const [confirmDialog, setConfirmDialog] = useState({ open: false });

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/providers');
      const data = await res.json();
      if (data.success) {
        setProviders(data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      id: '', name: '', document: '', email: '', phone: '',
      contact_person: '', brands: '', category: '', website: '',
      address: '', payment_terms: '', notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (provider) => {
    setIsEditing(true);
    setFormData({
      id: provider.id,
      name: provider.name || '',
      document: provider.document || '',
      email: provider.email || '',
      phone: provider.phone || '',
      contact_person: provider.contact_person || '',
      brands: provider.brands || '',
      category: provider.category || '',
      website: provider.website || '',
      address: provider.address || '',
      payment_terms: provider.payment_terms || '',
      notes: provider.notes || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const action = isEditing ? 'update' : 'add';
      const res = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload: formData }),
      });
      const data = await res.json();
      if (data.success) {
        closeModal();
        fetchProviders();
      } else {
        alert(data.error || 'Error al guardar el proveedor');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (provider) => {
    setConfirmDialog({
      open: true,
      message: `¿Estás seguro que deseas eliminar al proveedor "${provider.name}"? Los productos vinculados a este proveedor perderán el enlace.`,
      destructive: true,
      onConfirm: async () => {
        setConfirmDialog({ open: false });
        try {
          const res = await fetch('/api/providers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', payload: { id: provider.id } }),
          });
          const data = await res.json();
          if (data.success) {
            fetchProviders();
          } else {
            alert(data.error || 'Error al eliminar');
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>Directorio de Proveedores</h1>
        <button 
          onClick={openAddModal}
          style={{ padding: '10px 18px', backgroundColor: '#005BBE', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0, 91, 190,0.2)' }}
        >
          + Añadir Proveedor
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>NOMBRE COMERCIAL</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>NIT / DOCUMENTO</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>CONTACTO</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>TELÉFONO</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Cargando proveedores...</td>
                </tr>
              ) : providers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No hay proveedores registrados.</td>
                </tr>
              ) : (
                providers.map(provider => (
                  <tr key={provider.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 500, color: '#0f172a' }}>{provider.name}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{provider.document || '-'}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>
                      {provider.contact_person || provider.email || '-'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{provider.phone || '-'}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button onClick={() => openEditModal(provider)} style={{ marginRight: '12px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(provider)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{ backgroundColor: 'white', color: '#0f172a', padding: '32px', borderRadius: '10px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>
              {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Nombre Comercial <span style={{color: 'red'}}>*</span></label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>NIT / Documento</label>
                  <input type="text" name="document" value={formData.document} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Persona de Contacto</label>
                  <input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Correo Electrónico</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Teléfono</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Página Web</label>
                  <input type="text" name="website" value={formData.website} onChange={handleChange} style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Dirección y Ciudad</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Marcas que Distribuye</label>
                  <input type="text" name="brands" value={formData.brands} onChange={handleChange} style={inputStyle} placeholder="Ej. Shimano, Maxxis, Fox..." />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Notas adicionales</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={closeModal} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#0f172a', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#005BBE', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                  {isEditing ? 'Guardar Cambios' : 'Crear Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmación de eliminación */}
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
              <button onClick={confirmDialog.onConfirm} style={{ padding: '9px 18px', backgroundColor: confirmDialog.destructive ? '#ef4444' : '#005BBE', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
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
