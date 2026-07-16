import { useState } from 'react';
import { Bot } from 'lucide-react';

export default function InvoiceUploadModal({ onClose, onComplete }) {
  const [step, setStep] = useState(1); // 1: upload, 2: processing, 3: review
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  
  const [providerData, setProviderData] = useState({});
  const [productsData, setProductsData] = useState([]);
  
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const processInvoice = async () => {
    if (!file) {
      setError('Selecciona un archivo PDF.');
      return;
    }
    setStep(2); // Processing
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/invoice-upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setProviderData(data.data.provider || {});
        setProductsData(data.data.products || []);
        setStep(3); // Review
      } else {
        setError(data.error || 'Error desconocido al procesar la factura.');
        setStep(1);
      }
    } catch (err) {
      setError('Error de conexión al procesar con IA.');
      setStep(1);
    }
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...productsData];
    newProducts[index][field] = value;
    setProductsData(newProducts);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/inventory-mass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerData,
          products: productsData
        })
      });
      const data = await res.json();
      if (data.success) {
        onComplete();
      } else {
        setError(data.error);
        setSaving(false);
      }
    } catch (err) {
      setError('Error al guardar.');
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: 'white', color: '#0f172a', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
            {step === 1 && 'Cargar Factura (IA Gemini)'}
            {step === 2 && 'Procesando Documento...'}
            {step === 3 && 'Revisar y Confirmar Datos'}
          </h2>
          <button onClick={onClose} disabled={step === 2} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', padding: '40px 0' }}>
            <p style={{ textAlign: 'center', color: '#475569', fontSize: '1.1rem' }}>
              Sube la factura en formato PDF. La IA de Google Gemini extraerá automáticamente el proveedor y los repuestos.
            </p>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              style={{ padding: '10px', border: '2px dashed #cbd5e1', borderRadius: '8px', width: '100%', maxWidth: '400px', cursor: 'pointer' }}
            />
            <button 
              onClick={processInvoice}
              disabled={!file}
              style={{ padding: '12px 24px', backgroundColor: file ? '#1964a6' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: file ? 'pointer' : 'not-allowed', fontSize: '1.1rem' }}
            >
              Extraer Datos con IA ✨
            </button>
          </div>
        )}

        {/* STEP 2: PROCESSING */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: '20px' }}>
            <style>{`
              @keyframes bounceBot {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-12px); }
              }
              @keyframes scanLine {
                0% { top: 0%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
              }
            `}</style>
            <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
               <Bot size={64} color="#1964a6" style={{ animation: 'bounceBot 2s ease-in-out infinite' }} />
               <div style={{ position: 'absolute', left: '-10%', width: '120%', height: '3px', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981', animation: 'scanLine 1.5s linear infinite', borderRadius: '4px', zIndex: 2 }}></div>
            </div>
            <h3 style={{ margin: 0, color: '#0f172a' }}>La Inteligencia Artificial está leyendo la factura...</h3>
            <p style={{ color: '#64748b' }}>Esto puede tomar entre 5 y 15 segundos.</p>
          </div>
        )}

        {/* STEP 3: REVIEW */}
        {step === 3 && (
          <div>
            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>Datos del Proveedor</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={labelStyle}>Nombre Comercial</label>
                  <input type="text" value={providerData.name || ''} onChange={e => setProviderData({...providerData, name: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>NIT / Documento</label>
                  <input type="text" value={providerData.document || ''} onChange={e => setProviderData({...providerData, document: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Correo</label>
                  <input type="email" value={providerData.email || ''} onChange={e => setProviderData({...providerData, email: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Teléfono</label>
                  <input type="text" value={providerData.phone || ''} onChange={e => setProviderData({...providerData, phone: e.target.value})} style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>Productos a Ingresar ({productsData.length})</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>
                Si el nombre o SKU coincide con un producto existente, solo se sumará el stock. Si no, se creará uno nuevo.
              </p>
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={thStyle}>Nombre del Repuesto</th>
                      <th style={thStyle}>SKU</th>
                      <th style={thStyle}>Cantidad</th>
                      <th style={thStyle}>Precio Compra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsData.map((prod, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px' }}>
                          <input type="text" value={prod.name || ''} onChange={e => handleProductChange(idx, 'name', e.target.value)} style={inputStyle} />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input type="text" value={prod.sku || ''} onChange={e => handleProductChange(idx, 'sku', e.target.value)} style={inputStyle} />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input type="number" value={prod.quantity || 0} onChange={e => handleProductChange(idx, 'quantity', e.target.value)} style={inputStyle} />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input type="number" value={prod.price || 0} onChange={e => handleProductChange(idx, 'price', e.target.value)} style={inputStyle} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button onClick={() => setStep(1)} style={{ padding: '10px 20px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Volver atrás</button>
              <button 
                onClick={handleSave} 
                disabled={saving || !providerData.name || productsData.length === 0}
                style={{ padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: (saving || !providerData.name) ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
              >
                {saving ? 'Guardando en Base de Datos...' : 'Confirmar e Ingresar Inventario'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
const thStyle = { padding: '12px', textAlign: 'left', fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' };
