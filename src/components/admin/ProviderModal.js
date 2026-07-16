import { useState, useEffect } from 'react';

export default function ProviderModal({ onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    document: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', color: '#0f172a', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.5rem', fontWeight: 'bold' }}>
          {initialData ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre Comercial *</label>
            <input 
              required
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>NIT / Documento</label>
            <input 
              type="text" 
              value={formData.document} 
              onChange={e => setFormData({...formData, document: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Correo Electrónico</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Teléfono</label>
            <input 
              type="text" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 15px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#1964a6', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
