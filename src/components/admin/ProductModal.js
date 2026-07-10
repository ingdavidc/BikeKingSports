'use client';

import { useState } from 'react';

export default function ProductModal({ onClose, onSave }) {
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState({
    // Tab 1
    name: '',
    sku: '',
    category: '',
    brand: '',
    // Tab 2
    stock: 0,
    unit: 'Unidad (Und)',
    minLimit: 10,
    maxLimit: 100,
    location: '',
    // Tab 3
    cost: 0,
    utilityPercent: 30,
    tax_rate: 19,
    price: 0,
    // Tab 4
    provider: '',
    altProvider: '',
    image: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    { id: 4, name: '4. Proveedores' }
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
                    <input required name="sku" value={formData.sku} onChange={handleChange} style={inputStyle} placeholder="Ej: PRO-BRK-20A" />
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
                      <option value="Shimano Colombia">Shimano Colombia</option>
                      <option value="GW Bicycles">GW Bicycles</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Proveedor Alternativo</label>
                    <select name="altProvider" value={formData.altProvider} onChange={handleChange} style={inputStyle}>
                      <option value="">Ninguno / Opcional</option>
                      <option value="Local">Local</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>🖼️ Imagen del Producto</label>
                  <input type="file" style={{ ...inputStyle, padding: '6px' }} />
                  <input type="text" placeholder="O pega la URL de la imagen directamente..." style={{ ...inputStyle, marginTop: '10px' }} />
                  <small style={{ color: '#64748b', display: 'block', marginTop: '5px' }}>
                    * La imagen se comprimirá automáticamente a WebP (&lt;100KB) antes de subirse.
                  </small>
                </div>
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
            {activeTab < 4 ? (
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
