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



  const initCost = initialData?.cost || 0;
  const initTax = initialData?.tax || 19;
  const initUtility = initialData?.profit_margin || 30;
  let initSuggested = 0;
  const initCostWithTax = initCost * (1 + initTax / 100);
  const initU = 1 - (initUtility / 100);
  if (initCostWithTax > 0 && initU > 0) {
    initSuggested = Math.ceil((initCostWithTax / initU) / 1000) * 1000;
  }
  
  const initPrice = initialData?.price || 0;
  const isOverridden = initPrice > 0 && initPrice !== initSuggested;

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
    cost: initCost,
    utilityPercent: initUtility,
    tax_rate: initTax,
    price: isOverridden ? initPrice : '',
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
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const searchImage = async () => {
    if (!formData.name) {
      alert("Por favor ingresa primero el Nombre del producto");
      return;
    }
    // Use name + brand only (no SKU) - the server will clean up technical specs
    const q = `${formData.name || ''} ${formData.brand || ''}`.trim();
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(`/api/image-search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
      const data = await res.json();
      if (data.success && data.images && data.images.length > 0) {
        setSearchResults(data.images);
      } else {
        alert(data.error || "No se encontraron imágenes para este producto");
      }
    } catch(err) {
      alert("Error al buscar imágenes: " + err.message);
    } finally {
      setSearching(false);
    }
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

  // Auto-calculate suggested price
  const cost = parseFloat(formData.cost || 0);
  const taxRate = parseFloat(formData.tax_rate || 0);
  const utilityPercent = parseFloat(formData.utilityPercent || 0);
  
  const costWithTax = cost * (1 + taxRate / 100);
  const u = 1 - (utilityPercent / 100);
  
  let suggestedPrice = 0;
  if (costWithTax > 0 && u > 0) {
    const basePrice = costWithTax / u;
    suggestedPrice = Math.ceil(basePrice / 1000) * 1000;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      alert("El Nombre y el SKU o Código de Barras son obligatorios. Por favor revisa la Pestaña 1.");
      setActiveTab(1);
      return;
    }
    const finalData = { ...formData };
    if (!finalData.price) {
      finalData.price = suggestedPrice;
    }
    onSave(finalData);
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
                    <input 
                      type="text" 
                      required 
                      name="category" 
                      value={formData.category} 
                      onChange={handleChange} 
                      style={inputStyle} 
                      placeholder="Ej. Accesorios, Repuestos..." 
                      list="categoryList"
                    />
                    <datalist id="categoryList">
                      <option value="General" />
                      <option value="Accesorios" />
                      <option value="Repuestos" />
                      <option value="Bicicletas" />
                      <option value="Vestuario" />
                      <option value="Herramientas" />
                    </datalist>
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
                
                <div style={{ backgroundColor: formData.price ? '#dcfce3' : '#f1f5f9', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', transition: 'all 0.3s' }}>
                  <div style={{ fontSize: '3rem', color: formData.price ? '#10b981' : '#f97316' }}>$</div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      {formData.price ? 'Precio de Venta (Ajuste Manual Aplicado)' : 'Precio de Venta al Público (PVP) Sugerido'}
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                      ${(parseFloat(formData.price) || suggestedPrice).toLocaleString()}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {formData.price ? `El PVP sugerido por fórmula era $${suggestedPrice.toLocaleString()}` : 'Calculado automáticamente según costo, utilidad e impuestos.'}
                    </div>
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
                  <label style={{...labelStyle, display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    Imágenes del Producto
                  </label>
                  
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                    <input type="text" name="image" value={formData.image || ''} onChange={handleChange} placeholder="URL directa de la imagen..." style={{...inputStyle, marginTop: 0}} />
                    <button type="button" onClick={searchImage} disabled={searching} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'transparent', color: '#1e293b', border: '1px solid #1e293b', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '500' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                      {searching ? 'Buscando...' : 'Asistente IA'}
                              {searchResults.length > 0 && (
                    <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                          Resultados Sugeridos
                        </h4>
                        <button type="button" onClick={() => setSearchResults([])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                        {searchResults.map((img, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, image: img.url }));
                              setSearchResults([]);
                            }}
                            style={{
                              position: 'relative',
                              aspectRatio: '1',
                              border: formData.image === img.url ? '3px solid #10b981' : '2px solid transparent',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              background: 'white',
                              transition: 'border 0.15s'
                            }}
                            onMouseOver={e => e.currentTarget.style.border = '2px solid #f97316'}
                            onMouseOut={e => e.currentTarget.style.border = formData.image === img.url ? '3px solid #10b981' : '2px solid transparent'}
                          >
                            <img src={img.preview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} referrerPolicy="no-referrer" loading="lazy" />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.75)', color: 'white', fontSize: '0.45rem', padding: '2px 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {img.preview ? img.preview.substring(0, 30) : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#64748b' }}>* Haz clic en una imagen para seleccionarla.</p>
                    </div>
                  )}
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
                     <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>Precio: ${(parseFloat(formData.price) || suggestedPrice).toLocaleString()}</div>
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
        <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
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
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button 
              type="button"
              onClick={onClose}
              style={{ padding: '10px 20px', backgroundColor: 'white', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              Cancelar
            </button>
            {activeTab < 6 && (
              <button 
                type="button"
                onClick={() => setActiveTab(prev => prev + 1)}
                style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Siguiente
              </button>
            )}
            <button 
              form="productForm"
              type="submit"
              style={{ padding: '10px 20px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              💾 Guardar Producto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
