'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Printer, X, Plus, Minus, Trash2, CheckCircle, Layers, RefreshCw, Eye } from 'lucide-react';
import BarcodeLabelItem from './BarcodeLabelItem';
import BarcodePrintStyles from './BarcodePrintStyles';
import BarcodePrintPortal from './BarcodePrintPortal';
import BarcodeSettingsPanel from './BarcodeSettingsPanel';
import { getLabelSettings, saveLabelSettings, buildPrintRows } from '@/utils/barcodeSettings';

export default function BatchBarcodeModal({ selectedProducts = [], onClose }) {
  const [settings, setSettings] = useState(getLabelSettings());
  const [itemsWithQty, setItemsWithQty] = useState([]);
  const [showBatchPreview, setShowBatchPreview] = useState(false);

  useEffect(() => {
    saveLabelSettings(settings);
  }, [settings]);

  // Inicializar productos seleccionados con cantidad por defecto = 1
  useEffect(() => {
    if (selectedProducts && selectedProducts.length > 0) {
      setItemsWithQty(
        selectedProducts.map(p => ({
          product: p,
          quantity: 1
        }))
      );
    }
  }, [selectedProducts]);

  const handleQtyChange = (index, newQty) => {
    const num = parseInt(newQty, 10);
    const validNum = isNaN(num) || num < 0 ? 0 : num;
    setItemsWithQty(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: validNum };
      return updated;
    });
  };

  const handleRemoveItem = (index) => {
    setItemsWithQty(prev => prev.filter((_, i) => i !== index));
  };

  // Botones de acción masiva
  const handleSetAllToOne = () => {
    setItemsWithQty(prev => prev.map(item => ({ ...item, quantity: 1 })));
  };

  const handleSetAllToStock = () => {
    setItemsWithQty(prev => prev.map(item => {
      const stock = Math.max(0, parseInt(item.product.stock, 10) || 0);
      return { ...item, quantity: stock > 0 ? stock : 1 };
    }));
  };

  const handleRemoveZeroStock = () => {
    setItemsWithQty(prev => prev.filter(item => {
      const stock = parseInt(item.product.stock, 10) || 0;
      return stock > 0;
    }));
  };

  // Cálculo de totales
  const totalLabels = useMemo(() => {
    return itemsWithQty.reduce((acc, curr) => acc + (parseInt(curr.quantity, 10) || 0), 0);
  }, [itemsWithQty]);

  const rowsToPrint = useMemo(() => {
    return buildPrintRows(itemsWithQty, settings.rollType);
  }, [itemsWithQty, settings.rollType]);

  const totalRows = rowsToPrint.length;

  const handlePrint = () => {
    if (totalLabels === 0) {
      alert('Debes indicar al menos 1 etiqueta para imprimir.');
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
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <BarcodePrintStyles rollType={settings.rollType} />

      {/* PORTAL DE IMPRESIÓN AISLADO DIRECTAMENTE EN document.body */}
      <BarcodePrintPortal>
        {rowsToPrint.map((row, rIdx) => (
          <div key={`batch-print-row-${rIdx}`} className="barcode-print-row">
            <BarcodeLabelItem product={row[0]} settings={settings} />
            {settings.rollType === 'double' && (
              <>
                <div className="barcode-print-spacer" />
                <BarcodeLabelItem product={row[1]} settings={settings} />
              </>
            )}
          </div>
        ))}
      </BarcodePrintPortal>

      {/* MODAL EN PANTALLA */}
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '920px',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '94vh',
        overflow: 'hidden'
      }}>
        {/* Cabecera */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              color: '#005BBE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Printer size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 'bold' }}>
                Impresión Masiva de Etiquetas por Lote (Batch)
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Configura cantidades individuales e imprime en una sola tirada continua en tu impresora Zebra.
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

        {/* Resumen Superior y Herramientas Rápidas */}
        <div style={{
          padding: '12px 24px',
          backgroundColor: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '0.9rem', color: '#334155' }}>
              Productos: <strong>{itemsWithQty.length}</strong>
            </div>
            <div style={{ height: '16px', width: '1px', backgroundColor: '#cbd5e1' }} />
            <div style={{ fontSize: '0.9rem', color: '#005BBE', fontWeight: 'bold' }}>
              Total Etiquetas: <strong>{totalLabels}</strong>
            </div>
            <div style={{ height: '16px', width: '1px', backgroundColor: '#cbd5e1' }} />
            <div style={{ fontSize: '0.9rem', color: '#475569' }}>
              Filas en Rollo: <strong>{totalRows}</strong> ({settings.rollType === 'double' ? '108mm Doble' : '50mm Simple'})
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleSetAllToOne}
              style={{
                padding: '6px 12px',
                backgroundColor: 'white',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              1 a Todos
            </button>
            <button
              type="button"
              onClick={handleSetAllToStock}
              style={{
                padding: '6px 12px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#047857',
                cursor: 'pointer'
              }}
            >
              Copiar Stock a Todos
            </button>
            <button
              type="button"
              onClick={() => setShowBatchPreview(!showBatchPreview)}
              style={{
                padding: '6px 12px',
                backgroundColor: showBatchPreview ? '#005BBE' : 'white',
                border: '1px solid #005BBE',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: showBatchPreview ? 'white' : '#005BBE',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Eye size={14} />
              <span>{showBatchPreview ? 'Ver Tabla' : 'Ver Previsualización del Lote'}</span>
            </button>
          </div>
        </div>

        {/* Contenido con Scroll */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Panel de Opciones de Contenido y Calibración */}
          <BarcodeSettingsPanel settings={settings} onChange={setSettings} />

          {showBatchPreview ? (
            /* VISTA DE PREVISUALIZACIÓN DEL LOTE COMPLETO */
            <div>
              <h3 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '10px', fontWeight: 'bold' }}>
                Previsualización de la tira de impresión continua ({totalRows} filas en rollo):
              </h3>
              {rowsToPrint.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  No hay etiquetas configuradas para imprimir.
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  backgroundColor: '#f1f5f9',
                  padding: '16px',
                  borderRadius: '8px',
                  alignItems: 'center'
                }}>
                  {rowsToPrint.map((row, rIdx) => (
                    <div
                      key={`preview-row-${rIdx}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginRight: '10px', width: '45px' }}>
                        Fila #{rIdx + 1}:
                      </span>
                      <BarcodeLabelItem product={row[0]} settings={settings} isPreview={true} />
                      {settings.rollType === 'double' && (
                        <>
                          <div style={{ width: '15px', textAlign: 'center', fontSize: '9px', color: '#94a3b8' }}>|</div>
                          <BarcodeLabelItem product={row[1]} settings={settings} isPreview={true} />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* TABLA DE PRODUCTOS Y CANTIDADES */
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>CÓDIGO (SKU)</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>DESCRIPCIÓN</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>PRECIO PVP</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>STOCK</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'center' }}>CANTIDAD ETIQUETAS</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'center' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsWithQty.map((item, idx) => {
                    const prodStock = Math.max(0, parseInt(item.product.stock, 10) || 0);
                    return (
                      <tr key={`batch-item-${item.product.id || idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#005BBE' }}>
                          {item.product.sku || 'SIN-SKU'}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#0f172a', maxWidth: '280px' }}>
                          <div style={{ fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.product.name}
                          </div>
                          {item.product.brand && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Marca: {item.product.brand}</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#0f172a', fontWeight: 'bold' }}>
                          ${(item.product.price || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 14px', color: prodStock > 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                          {prodStock}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(idx, item.quantity - 1)}
                              style={{ padding: '6px 10px', background: '#f8fafc', border: 'none', cursor: 'pointer', color: '#334155' }}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={(e) => handleQtyChange(idx, e.target.value)}
                              style={{ width: '45px', textAlign: 'center', border: 'none', fontWeight: 'bold', fontSize: '0.9rem', outline: 'none' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleQtyChange(idx, item.quantity + 1)}
                              style={{ padding: '6px 10px', background: '#f8fafc', border: 'none', cursor: 'pointer', color: '#334155' }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            style={{
                              padding: '6px 8px',
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            title="Quitar este producto del lote"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {itemsWithQty.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                        No hay productos en la lista. Cierra esta ventana y selecciona productos con las casillas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pie de Acciones */}
        <div style={{
          padding: '16px 24px',
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
              padding: '10px 20px',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '0.9rem', color: '#475569' }}>
              Listo para enviar <strong>{totalLabels}</strong> {totalLabels === 1 ? 'etiqueta' : 'etiquetas'} a la Zebra
            </span>
            <button
              type="button"
              onClick={handlePrint}
              disabled={totalLabels === 0}
              style={{
                padding: '10px 24px',
                backgroundColor: totalLabels > 0 ? '#005BBE' : '#94a3b8',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: totalLabels > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: totalLabels > 0 ? '0 2px 4px rgba(0, 91, 190, 0.25)' : 'none'
              }}
            >
              <Printer size={18} />
              <span>Imprimir Lote ({totalLabels} Etiquetas)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
