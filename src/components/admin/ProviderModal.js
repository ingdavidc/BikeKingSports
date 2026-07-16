import { useState, useEffect } from 'react';

export default function ProviderModal({ onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    document: '',
    email: '',
    phone: '',
    contact_person: '',
    brands: '',
    category: '',
    website: '',
    address: '',
    payment_terms: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        contact_person: initialData.contact_person || '',
        brands: initialData.brands || '',
        category: initialData.category || '',
        website: initialData.website || '',
        address: initialData.address || '',
        payment_terms: initialData.payment_terms || '',
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  const inputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.9rem' };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: 'white', color: '#0f172a', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.5rem', fontWeight: 'bold' }}>
          {initialData ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Nombre Comercial *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>NIT / Documento</label>
              <input type="text" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Persona de Contacto / Vendedor</label>
              <input type="text" value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} style={inputStyle} placeholder="Ej. Juan Pérez" />
            </div>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Correo Electrónico</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Página Web / Catálogo</label>
              <input type="text" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} style={inputStyle} placeholder="https://" />
            </div>
            <div>
              <label style={labelStyle}>Dirección y Ciudad</label>
              <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Categoría / Tipo</label>
              <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={inputStyle} placeholder="Ej. Repuestos, Bicicletas, Accesorios" />
            </div>
            <div>
              <label style={labelStyle}>Marcas que Distribuye</label>
              <input type="text" value={formData.brands} onChange={e => setFormData({...formData, brands: e.target.value})} style={inputStyle} placeholder="Ej. Shimano, Maxxis, Fox" />
            </div>
            <div>
              <label style={labelStyle}>Condiciones de Pago</label>
              <input type="text" value={formData.payment_terms} onChange={e => setFormData({...formData, payment_terms: e.target.value})} style={inputStyle} placeholder="Ej. Contado, 30 días, etc." />
            </div>
          </div>
          
          <div>
            <label style={labelStyle}>Observaciones</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }} placeholder="Cualquier otra información relevante..." />
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
