'use client';

import React, { useState, useEffect } from 'react';
import { Printer, X, Plus, Minus, Check, Layers } from 'lucide-react';
import BarcodeLabelItem from './BarcodeLabelItem';
import BarcodePrintStyles from './BarcodePrintStyles';
import BarcodeSettingsPanel from './BarcodeSettingsPanel';
import { getLabelSettings, saveLabelSettings, buildPrintRows } from '@/utils/barcodeSettings';

export default function QuickBarcodeModal({ product, onClose }) {
  const [settings, setSettings] = useState(getLabelSettings());
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    saveLabelSettings(settings);
  }, [settings]);

  if (!product) return null;

  const sku = product.sku || '';
  const stock = Math.max(0, parseInt(product.stock, 10) || 0);

  const handleQtyChange = (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) {
      setQuantity(1);
    } else {
      setQuantity(num);
    }
  };

  const rowsToPrint = buildPrintRows([{ product, quantity }], settings.rollType);
  const totalRows = rowsToPrint.length;

  const handlePrint = () => {
    if (!sku) {
      alert('Este producto no tiene un código SKU asignado.');
      return;
    }
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <BarcodePrintStyles rollType={settings.rollType} />

      {/* ÁREA OCULTA EN PANTALLA, VISIBLE SOLO PARA IMPRESIÓN (@media print) */}
      <div id="barcode-print-root" className="print-only-container" style={{ display: 'none' }}>
        {rowsToPrint.map((row, rIdx) => (
          <div key={`print-row-${rIdx}`} className="barcode-print-row">
            <BarcodeLabelItem product={row[0]} settings={settings} />
            {settings.rollType === 'double' && (
              <>
                <div className="barcode-print-spacer" />
                <BarcodeLabelItem product={row[1]} settings={settings} />
              </>
            )}
          </div>
        ))}
      </div>

      {/* MODAL EN PANTALLA */}
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '680px',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '92vh',
        overflow: 'hidden'
      }}>
        {/* Cabecera */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              color: '#005BBE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Printer size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 'bold' }}>
                Impresión Rápida de Etiqueta
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                {product.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo con Scroll */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {!sku ? (
            <div style={{
              padding: '14px',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.9rem'
            }}>
              ⚠️ Este producto no tiene un código SKU asignado. Edita el producto primero para asignarle uno.
            </div>
          ) : null}

          {/* Selector de Copias / Cantidad */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '14px 18px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f172a', display: 'block' }}>
                  Cantidad de Etiquetas a Imprimir:
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Stock registrado en sistema: <strong>{stock} unid.</strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => handleQtyChange(quantity - 1)}
                    style={{
                      padding: '8px 12px',
                      background: '#f1f5f9',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#334155',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => handleQtyChange(e.target.value)}
                    style={{
                      width: '60px',
                      textAlign: 'center',
                      border: 'none',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: '#0f172a',
                      padding: '6px 0',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleQtyChange(quantity + 1)}
                    style={{
                      padding: '8px 12px',
                      background: '#f1f5f9',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#334155',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(1)}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: quantity === 1 ? '#005BBE' : '#f1f5f9',
                      color: quantity === 1 ? '#ffffff' : '#334155',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    1
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity(2)}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: quantity === 2 ? '#005BBE' : '#f1f5f9',
                      color: quantity === 2 ? '#ffffff' : '#334155',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    title="1 fila completa en rollo doble"
                  >
                    2 (Fila)
                  </button>
                  {stock > 0 && (
                    <button
                      type="button"
                      onClick={() => setQuantity(stock)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: quantity === stock ? '#10b981' : '#ecfdf5',
                        color: quantity === stock ? '#ffffff' : '#047857',
                        border: '1px solid #a7f3d0',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Stock ({stock})
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} color="#005BBE" />
              <span>
                {settings.rollType === 'double' ? (
                  <>Se imprimirán <strong>{quantity}</strong> etiqueta(s) en <strong>{totalRows}</strong> fila(s) de tu rollo doble de 108mm.</>
                ) : (
                  <>Se imprimirán <strong>{quantity}</strong> etiqueta(s) en <strong>{quantity}</strong> pase(s) de tu rollo individual.</>
                )}
              </span>
            </div>
          </div>

          {/* Panel de Opciones de Contenido y Calibración */}
          <BarcodeSettingsPanel settings={settings} onChange={setSettings} />

          {/* Previsualización en Tiempo Real */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '12px' }}>
              Previsualización en Pantalla (Medida Real: 50mm x 25mm cada etiqueta):
            </span>

            {settings.rollType === 'double' ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '2px dashed #94a3b8',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>Columna 1 (50mm)</div>
                  <BarcodeLabelItem product={product} settings={settings} isPreview={true} />
                </div>

                {/* Separación de 5mm */}
                <div style={{
                  width: '24px',
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  fontSize: '0.65rem'
                }}>
                  <div style={{ borderLeft: '1px dashed #cbd5e1', height: '100%', position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'white',
                      padding: '1px 3px',
                      whiteSpace: 'nowrap',
                      fontSize: '9px',
                      color: '#64748b'
                    }}>
                      5mm
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>Columna 2 (50mm)</div>
                  <BarcodeLabelItem 
                    product={quantity > 1 ? product : null} 
                    settings={settings} 
                    isPreview={true} 
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'inline-block' }}>
                <BarcodeLabelItem product={product} settings={settings} isPreview={true} />
              </div>
            )}
          </div>
        </div>

        {/* Pie de Acciones */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px',
              backgroundColor: 'white',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={!sku}
            style={{
              padding: '10px 22px',
              backgroundColor: sku ? '#005BBE' : '#94a3b8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: sku ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: sku ? '0 2px 4px rgba(0, 91, 190, 0.25)' : 'none'
            }}
          >
            <Printer size={18} />
            <span>Imprimir {quantity} {quantity === 1 ? 'Etiqueta' : 'Etiquetas'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
