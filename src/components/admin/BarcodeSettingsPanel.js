'use client';

import React, { useState } from 'react';
import { Settings, Info, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';

export default function BarcodeSettingsPanel({ settings, onChange }) {
  const [showGuide, setShowGuide] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (key) => {
    onChange({
      ...settings,
      [key]: !settings[key]
    });
  };

  const handleRollTypeChange = (type) => {
    onChange({
      ...settings,
      rollType: type
    });
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '16px',
      textAlign: 'left'
    }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '600', fontSize: '0.95rem' }}>
          <Settings size={18} color="#005BBE" />
          <span>Personalización de Etiqueta y Calibración de Impresora</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.85rem' }}>
          <span>{isOpen ? 'Ocultar ajustes' : 'Ver ajustes y formato'}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {isOpen && (
        <div style={{ marginTop: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
          {/* Tipo de Rollo */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
              Formato de Rollo Instalado:
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleRollTypeChange('double')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: settings.rollType === 'double' ? '2px solid #005BBE' : '1px solid #cbd5e1',
                  backgroundColor: settings.rollType === 'double' ? '#eff6ff' : 'white',
                  color: settings.rollType === 'double' ? '#005BBE' : '#475569',
                  fontWeight: settings.rollType === 'double' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🏷️🏷️ Rollo Doble (108mm x 25mm - 2 Columnas)</span>
                {settings.rollType === 'double' && <span style={{ fontSize: '0.75rem', background: '#005BBE', color: 'white', padding: '1px 6px', borderRadius: '4px' }}>Activo</span>}
              </button>

              <button
                type="button"
                onClick={() => handleRollTypeChange('single')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: settings.rollType === 'single' ? '2px solid #005BBE' : '1px solid #cbd5e1',
                  backgroundColor: settings.rollType === 'single' ? '#eff6ff' : 'white',
                  color: settings.rollType === 'single' ? '#005BBE' : '#475569',
                  fontWeight: settings.rollType === 'single' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🏷️ Rollo Individual (50mm x 25mm - 1 Columna)</span>
                {settings.rollType === 'single' && <span style={{ fontSize: '0.75rem', background: '#005BBE', color: 'white', padding: '1px 6px', borderRadius: '4px' }}>Activo</span>}
              </button>
            </div>
          </div>

          {/* Opciones de contenido en la etiqueta */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>
              Campos Visibles en la Etiqueta (50 x 25 mm):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#1e293b' }}>
                <input
                  type="checkbox"
                  checked={!!settings.showBrandName}
                  onChange={() => toggleOption('showBrandName')}
                  style={{ width: '16px', height: '16px', accentColor: '#005BBE', cursor: 'pointer' }}
                />
                <span>Marca corporativa (<strong>BIKEKING</strong>)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#1e293b' }}>
                <input
                  type="checkbox"
                  checked={!!settings.showProductName}
                  onChange={() => toggleOption('showProductName')}
                  style={{ width: '16px', height: '16px', accentColor: '#005BBE', cursor: 'pointer' }}
                />
                <span>Nombre del Producto</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#1e293b' }}>
                <input
                  type="checkbox"
                  checked={!!settings.showBarcode}
                  onChange={() => toggleOption('showBarcode')}
                  style={{ width: '16px', height: '16px', accentColor: '#005BBE', cursor: 'pointer' }}
                />
                <span>Código de Barras + SKU</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#1e293b' }}>
                <input
                  type="checkbox"
                  checked={!!settings.showPrice}
                  onChange={() => toggleOption('showPrice')}
                  style={{ width: '16px', height: '16px', accentColor: '#005BBE', cursor: 'pointer' }}
                />
                <span>Precio de Venta (PVP $)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#1e293b' }}>
                <input
                  type="checkbox"
                  checked={!!settings.showProductBrand}
                  onChange={() => toggleOption('showProductBrand')}
                  style={{ width: '16px', height: '16px', accentColor: '#005BBE', cursor: 'pointer' }}
                />
                <span>Marca / Fabricante (ej. Shimano)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#1e293b' }}>
                <input
                  type="checkbox"
                  checked={!!settings.showLocation}
                  onChange={() => toggleOption('showLocation')}
                  style={{ width: '16px', height: '16px', accentColor: '#005BBE', cursor: 'pointer' }}
                />
                <span>Ubicación en Bodega / Tienda</span>
              </label>
            </div>
          </div>

          {/* Guía de calibración para Zebra */}
          <div>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0,
                fontWeight: '600'
              }}
            >
              <Info size={15} />
              <span>{showGuide ? 'Ocultar guía de calibración Zebra' : '¿Cómo configurar la impresora Zebra en Windows?'}</span>
            </button>

            {showGuide && (
              <div style={{
                marginTop: '8px',
                padding: '10px 14px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: '#0369a1',
                lineHeight: '1.4'
              }}>
                <p style={{ margin: '0 0 6px 0', fontWeight: 'bold' }}>📐 Medidas exactas configuradas para tu rollo doble:</p>
                <ul style={{ margin: '0 0 8px 18px', padding: 0 }}>
                  <li><strong>Ancho del soporte:</strong> 108 mm</li>
                  <li><strong>Etiquetas:</strong> 2 columnas de 50 mm x 25 mm</li>
                  <li><strong>Separación central:</strong> 5 mm | Márgenes laterales: 1.5 mm</li>
                  <li><strong>Gap vertical entre filas:</strong> 3 mm</li>
                </ul>
                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>🖨️ Recomendaciones en la ventana de impresión (Ctrl + P / Chrome):</p>
                <ul style={{ margin: '0 0 0 18px', padding: 0 }}>
                  <li><strong>Destino:</strong> Selecciona tu impresora Zebra (GC420t / ZD220 / GK420t).</li>
                  <li><strong>Márgenes:</strong> Selecciona <em>"Ninguno"</em> (None).</li>
                  <li><strong>Opciones:</strong> Desmarca <em>"Encabezados y pies de página"</em>.</li>
                  <li><strong>Escala:</strong> <em>Predeterminado (100%)</em>.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
