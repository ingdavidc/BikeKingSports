'use client';

import { useState, useEffect } from 'react';
import Barcode from 'react-barcode';
import { Bot } from 'lucide-react';

export default function ProductModal({ onClose, onSave, initialData }) {
  const [activeTab, setActiveTab] = useState(1);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    fetch('/api/providers')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProviders(data.data);
        }
      });
  }, []);

  // Auto-fill image query when reaching tab 4
  useEffect(() => {
    if (activeTab === 4 && formData.name && !imageQuery) {
      setImageQuery(formData.name);
    }
  }, [activeTab, formData.name, imageQuery]);

  const [formData, setFormData] = useState({
    // Tab 1
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    category: initialData?.category || '',
    brand: initialData?.brand || '',
    // Tab 2
    stock: initialData?.stock || 0,
    unit: initialData?.unit || 'Unidad (Und)',
    minLimit: initialData?.min_stock_limit || 10,
    maxLimit: initialData?.max_stock_limit || 100,
    location: initialData?.location || '',
    // Tab 3
    cost: initialData?.cost || 0,
    utilityPercent: initialData?.profit_margin || 30,
    tax_rate: initialData?.tax || 19,
    price: initialData?.price || 0,
    // Tab 4
    provider: initialData?.supplier_id || '',
    altProvider: initialData?.alt_supplier_id || '',
    image: initialData?.image || null,
    // Add id for editing
    id: initialData?.id || null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- IMAGES ---
  const [imageQuery, setImageQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const searchImage = async () => {
    if (!imageQuery) return;
    setSearching(true);
    try {
      // Se añade sufijo de contexto para que Bing devuelva partes de bicicleta en vez de imágenes aleatorias o literales
      const contextualQuery = `${imageQuery} bicicleta bike`;
      const res = await fetch(`/api/image-search?q=${encodeURIComponent(contextualQuery)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.images);
      } else {
        alert(data.error);
      }
    } catch(err) {
      alert("Error buscando imagenes");
    }
    setSearching(false);
  };

  // --- AI AUTOFILL ---
  const [aiFile, setAiFile] = useState(null);
  const [processingAi, setProcessingAi] = useState(false);

  const handleAiFill = async () => {
    if (!aiFile) return;
    setProcessingAi(true);
    const fd = new FormData();
    fd.append('file', aiFile);
    try {
      const res = await fetch('/api/invoice-upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success && data.data.products && data.data.products.length > 0) {
        const prod = data.data.products[0];
        setFormData(prev => ({
          ...prev,
          name: prod.name || prev.name,
          sku: prod.sku || prev.sku,
          category: prod.category || prev.category,
          cost: prod.price || prev.cost, 
          tax_rate: prod.tax || prev.tax_rate
        }));
        alert("¡Datos extraídos con éxito! Revisa las pestañas.");
        setActiveTab(1);
      } else {
        alert("No se pudieron extraer datos del archivo.");
      }
    } catch(err) {
      alert("Error con la IA.");
    }
    setProcessingAi(false);
  };

  // Auto-calculate suggested price (just visual for now)
  const suggestedPrice = Math.round(
    parseFloat(formData.cost || 0) * (1 + parseFloat(formData.utilityPercent || 0) / 100) * (1 + parseFloat(formData.tax_rate || 0) / 100)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const tabs = [
    { id: 1, name: '1. Identificación' },
    { id: 2, name: '2. Inventario' },
    { id: 3, name: '3. Costos y Precios' },
    { id: 4, name: '4. Proveedores' },
    { id: 5, name: '5. Auto-llenado IA ✨' },
    { id: 6, name: '6. Código Barras 🖨️' }
  ];

  const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', 
    marginTop: '6px', fontSize: '0.95rem', color: '#334155', boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a'
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', width: '90%', maxWidth: '800px', borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem' }}>📦</span> Ficha Técnica del Producto
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 20px' }}>
          {tabs.map(tab => (
            <div 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '15px 20px', cursor: 'pointer', fontWeight: 600,
                color: activeTab === tab.id ? '#1e293b' : '#64748b',
                borderBottom: activeTab === tab.id ? '3px solid #f97316' : '3px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {tab.name}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <form id="productForm" onSubmit={handleSubmit}>
            
            {/* TAB 1 */}
            {activeTab === 1 && (
              <div>
                <h3 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
                  INFORMACIÓN GENERAL Y DE IDENTIFICACIÓN
                </h3>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Nombre o Descripción del Producto *</label>
                  <input required name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="Ej: Breaker Termomagnético 1x20A" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>SKU o Código de Barras *</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                      <input required name="sku" value={formData.sku} onChange={handleChange} style={{ ...inputStyle, marginTop: 0 }} placeholder="Ej: PRO-BRK-20A" />
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({...prev, sku: `BK-${Math.floor(100000 + Math.random() * 900000)}`}))} 
                        style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }} 
                        title="Generar Código Automático"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Categoría / Familia *</label>
                    <select required name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                      <option value="">Seleccione Categoría...</option>
                      <option value="General">General</option>
                      <option value="Accesorios">Accesorios</option>
                      <option value="Repuestos">Repuestos</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Marca Comercial</label>
                  <input name="brand" value={formData.brand} onChange={handleChange} style={inputStyle} placeholder="Ej: Shimano, GW..." />
                </div>
              </div>
            )}

            {/* TAB 2 */}
            {activeTab === 2 && (
              <div>
                <h3 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
                  CONTROL DE INVENTARIO Y MEDIDAS
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Stock en Bodega *</label>
                    <input type="number" required name="stock" value={formData.stock} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Unidad de Medida / Presentación</label>
                    <select name="unit" value={formData.unit} onChange={handleChange} style={inputStyle}>
                      <option value="Unidad (Und)">Unidad (Und)</option>
                      <option value="Par">Par</option>
                      <option value="Caja">Caja</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Límite Mínimo (Alarma Compras)</label>
                    <input type="number" name="minLimit" value={formData.minLimit} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Límite Máximo (Tope Bodega)</label>
                    <input type="number" name="maxLimit" value={formData.maxLimit} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Ubicación Física en Bodega</label>
                  <input name="location" value={formData.location} onChange={handleChange} style={inputStyle} placeholder="Ej: Pasillo 4 - Estante B" />
                </div>
              </div>
            )}

            {/* TAB 3 */}
            {activeTab === 3 && (
              <div>
                <h3 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
                  COSTOS, IMPUESTOS Y PRECIO DE VENTA
                </h3>
                
                <div style={{ backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '3rem', color: '#f97316' }}>$</div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Precio de Venta al Público (PVP) Sugerido</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>${suggestedPrice.toLocaleString()}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Calculado automáticamente según costo, utilidad e impuestos.</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Costo de Adquisición (Sin IVA)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.1rem', color: '#64748b' }}>$</span>
                      <input type="number" name="cost" value={formData.cost} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Porcentaje de Utilidad Esperada</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="number" name="utilityPercent" value={formData.utilityPercent} onChange={handleChange} style={inputStyle} />
                      <span style={{ fontSize: '1.1rem', color: '#64748b' }}>%</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Impuestos (IVA)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="number" name="tax_rate" value={formData.tax_rate} onChange={handleChange} style={inputStyle} />
                      <span style={{ fontSize: '1.1rem', color: '#64748b' }}>%</span>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Ajuste Manual de PVP</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.1rem', color: '#64748b' }}>$</span>
                      <input type="number" name="price" value={formData.price} onChange={handleChange} style={inputStyle} />
                    </div>
                    <small style={{ color: '#94a3b8' }}>Puedes sobreescribir el precio sugerido aquí.</small>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4 */}
            {activeTab === 4 && (
              <div>
                <h3 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
                  PROVEEDORES Y LOGÍSTICA
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Proveedor Principal (Auto-Compra)</label>
                    <select name="provider" value={formData.provider} onChange={handleChange} style={inputStyle}>
                      <option value="">Seleccione Proveedor...</option>
                      {providers.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Proveedor Alternativo</label>
                    <select name="altProvider" value={formData.altProvider} onChange={handleChange} style={inputStyle}>
                      <option value="">Ninguno / Opcional</option>
                      {providers.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>🖼️ Buscar Imagen del Producto en la Web</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input type="text" value={imageQuery} onChange={e => setImageQuery(e.target.value)} placeholder="Ej: Shimano Tourney TX" style={inputStyle} />
                    <button type="button" onClick={searchImage} disabled={searching} style={{ padding: '10px 16px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {searching ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>
                  {searchResults.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                      {searchResults.map((img, i) => (
                        <div key={i} onClick={() => setFormData(prev => ({ ...prev, image: img.url }))} style={{ border: formData.image === img.url ? '3px solid #10b981' : '1px solid #cbd5e1', cursor: 'pointer', borderRadius: '4px', overflow: 'hidden', minWidth: '100px', height: '100px', flexShrink: 0 }}>
                          <img src={img.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                  )}
                  <input type="text" name="image" value={formData.image || ''} onChange={handleChange} placeholder="URL de la imagen seleccionada" style={{ ...inputStyle, marginTop: '10px' }} />
                </div>
              </div>
            )}

            {/* TAB 5 - AI */}
            {activeTab === 5 && (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <Bot size={48} color="#f97316" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#0f172a' }}>Auto-llenado Inteligente</h3>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Sube una foto o PDF de la factura/recibo del proveedor. La Inteligencia Artificial llenará los campos de Nombre, Código, Costo e Impuestos por ti.</p>
                <input type="file" accept=".pdf,image/*" onChange={e => setAiFile(e.target.files[0])} style={{ marginBottom: '20px', display: 'block', margin: '0 auto 20px' }} />
                <button type="button" onClick={handleAiFill} disabled={!aiFile || processingAi} style={{ padding: '12px 24px', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '6px', cursor: (!aiFile || processingAi) ? 'not-allowed' : 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {processingAi ? 'Extrayendo datos con Gemini...' : 'Procesar Documento con IA'}
                </button>
              </div>
            )}

            {/* TAB 6 - Barcode */}
            {activeTab === 6 && (
              <div style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#0f172a' }}>Generador de Código de Barras</h3>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Este código está basado en el SKU del producto: <strong>{formData.sku || 'N/A'}</strong></p>
                
                {formData.sku ? (
                  <div id="print-barcode-container" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                     <style>{`
                       @media print {
                         body * { visibility: hidden !important; }
                         #print-barcode-container, #print-barcode-container * { visibility: visible !important; }
                         #print-barcode-container {
                           position: absolute;
                           left: 50%;
                           top: 50px;
                           transform: translateX(-50%);
                           border: none !important;
                           padding: 0 !important;
                         }
                       }
                     `}</style>
                     <img src="/logo.png" alt="Logo" style={{ height: '35px', objectFit: 'contain', marginBottom: '8px' }} />
                     <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '2px' }}>{formData.name || 'Nuevo Producto'}</div>
                     <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>Precio: ${(formData.price || suggestedPrice).toLocaleString()}</div>
                     <Barcode value={formData.sku} height={50} fontSize={14} />
                  </div>
                ) : (
                  <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>
                    Debes asignar un SKU en la Pestaña 1 primero.
                  </div>
                )}
                
                <button type="button" onClick={() => window.print()} disabled={!formData.sku} style={{ padding: '12px 24px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', cursor: formData.sku ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>
                  🖨️ Imprimir Etiqueta
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {activeTab > 1 && (
              <button 
                type="button" 
                onClick={() => setActiveTab(prev => prev - 1)}
                style={{ padding: '10px 20px', backgroundColor: 'white', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Anterior
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              type="button"
              onClick={onClose}
              style={{ padding: '10px 20px', backgroundColor: 'white', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              Cancelar
            </button>
            {activeTab < 6 ? (
              <button 
                type="button"
                onClick={() => setActiveTab(prev => prev + 1)}
                style={{ padding: '10px 20px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Siguiente Pestaña
              </button>
            ) : (
              <button 
                form="productForm"
                type="submit"
                style={{ padding: '10px 20px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                💾 Guardar Producto Final
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
