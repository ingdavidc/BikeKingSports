'use client';

import { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  TrendingDown,
  Printer,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  User,
  PlusCircle,
  Trash2,
  Calendar,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Coins
} from 'lucide-react';
import { isPrinterConnected } from '@/utils/WebUSBPrinter';

const formatCOP = (num) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num || 0);
};

export default function CashRegisterModal({ onClose, activeUser, onWithdrawalAdded }) {
  const [activeTab, setActiveTab] = useState('withdraw'); // 'withdraw' | 'reconciliation' | 'history'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState({
    withdrawals: [],
    todayWithdrawals: [],
    registerSummary: {
      todayDate: '',
      todayTotalSalesRevenue: 0,
      todayCashSales: 0,
      todayTotalWithdrawals: 0,
      expectedCashInDrawer: 0,
      otherMethods: [],
      salesCountToday: 0,
      withdrawalsCountToday: 0,
    }
  });

  // Formulario de nuevo retiro
  const [amount, setAmount] = useState('');
  const [reasonCategory, setReasonCategory] = useState('Almuerzos / Refrigerios');
  const [customReason, setCustomReason] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState(activeUser?.name || 'Administrador');
  const [notes, setNotes] = useState('');
  const [printAfterSave, setPrintAfterSave] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchRegisterData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cash-withdrawals');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching cash withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegisterData();
  }, []);

  // Botones de incremento rápido de dinero
  const handleAddQuickAmount = (val) => {
    const current = Number(amount || 0);
    setAmount(String(current + val));
  };

  // Envío del nuevo retiro
  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      alert('Ingresa un monto válido para el retiro');
      return;
    }

    const finalReason = reasonCategory === 'Otro concepto...'
      ? customReason.trim() || 'Retiro de caja vario'
      : (customReason.trim() ? `${reasonCategory}: ${customReason.trim()}` : reasonCategory);

    if (!finalReason) {
      alert('Debes indicar el motivo del retiro de dinero');
      return;
    }

    setSubmitting(true);
    setSuccessMessage('');

    try {
      const payload = {
        amount: numAmount,
        reason: finalReason,
        category: reasonCategory,
        authorized_by: authorizedBy || activeUser?.name || 'Cajero',
        notes: notes.trim(),
      };

      const res = await fetch('/api/cash-withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resJson = await res.json();

      if (resJson.success) {
        setSuccessMessage(`Retiro por ${formatCOP(numAmount)} registrado correctamente.`);
        
        // Imprimir comprobante
        if (printAfterSave) {
          handlePrintWithdrawalVoucher(resJson.withdrawal);
        }

        // Limpiar formulario
        setAmount('');
        setCustomReason('');
        setNotes('');
        
        // Recargar datos
        await fetchRegisterData();
        if (onWithdrawalAdded) onWithdrawalAdded();
      } else {
        alert(resJson.error || 'Error al registrar el retiro');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al registrar retiro');
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminación de retiro (Admin)
  const handleDeleteWithdrawal = async (id) => {
    if (!confirm('¿Estás seguro de anular este retiro de dinero? La caja se recalculará automáticamente.')) {
      return;
    }
    try {
      const res = await fetch(`/api/cash-withdrawals?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        await fetchRegisterData();
        if (onWithdrawalAdded) onWithdrawalAdded();
      } else {
        alert(json.error || 'No se pudo anular el retiro');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al anular');
    }
  };

  // Imprimir comprobante de egreso individual (ticket térmico o estándar)
  const handlePrintWithdrawalVoucher = (withdrawal) => {
    const printWindow = window.open('', '_blank', 'width=380,height=520');
    if (!printWindow) return;

    const dateFormatted = new Date(withdrawal.created_at || Date.now()).toLocaleString('es-CO');
    const voucherId = withdrawal.id ? withdrawal.id.slice(0, 8).toUpperCase() : 'RET-001';

    printWindow.document.write(`
      <html>
        <head>
          <title>Comprobante de Egreso - ${voucherId}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 13px;
              width: 280px;
              margin: 0 auto;
              padding: 15px 5px;
              color: #000;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .title { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
            .subtitle { font-size: 11px; margin-bottom: 6px; }
            .amount { font-size: 18px; font-weight: bold; text-align: center; margin: 10px 0; padding: 4px; border: 1px solid #000; }
            .sign { margin-top: 35px; border-top: 1px solid #000; text-align: center; font-size: 11px; padding-top: 4px; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="title">BIKE KING SPORTS</div>
            <div class="subtitle">Taller y Tienda de Ciclismo<br>Saravena, Arauca - Cel: 310 329 1475</div>
            <div class="bold" style="font-size: 13px; margin: 6px 0;">COMPROBANTE DE EGRESO</div>
            <div style="font-size: 11px;"># ${voucherId}</div>
          </div>

          <div class="divider"></div>
          <div><strong>Fecha:</strong> ${dateFormatted}</div>
          <div><strong>Autorizado por:</strong> ${withdrawal.authorized_by || 'Administrador'}</div>
          <div><strong>Concepto:</strong> ${withdrawal.reason}</div>
          ${withdrawal.notes ? `<div><strong>Notas:</strong> ${withdrawal.notes}</div>` : ''}

          <div class="amount">
            ${formatCOP(withdrawal.amount)}
          </div>

          <div class="center" style="font-size: 11px; margin-top: 5px;">
            Salida de efectivo registrada en caja
          </div>

          <div class="sign">
            Firma de Quien Recibe Conforme
          </div>

          <div class="divider" style="margin-top: 20px;"></div>
          <div class="center" style="font-size: 10px;">Sistema POS Bike King</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Imprimir Ticket de Arqueo y Cierre de Caja del Día
  const handlePrintRegisterClose = () => {
    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (!printWindow) return;

    const summary = data.registerSummary;
    const dateFormatted = new Date().toLocaleString('es-CO');

    let withdrawalsHtml = '';
    data.todayWithdrawals.forEach(w => {
      withdrawalsHtml += `
        <tr>
          <td style="padding: 2px 0;">${w.reason?.substring(0, 22)}</td>
          <td style="padding: 2px 0; text-align: right;">-${formatCOP(w.amount)}</td>
        </tr>
      `;
    });

    let otherMethodsHtml = '';
    (summary.otherMethods || []).forEach(m => {
      otherMethodsHtml += `
        <tr>
          <td style="padding: 2px 0;">${m.method}</td>
          <td style="padding: 2px 0; text-align: right;">${formatCOP(m.total)}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Cuadre de Caja - ${summary.todayDate}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 13px;
              width: 280px;
              margin: 0 auto;
              padding: 15px 5px;
              color: #000;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .title { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
            table { width: 100%; font-size: 12px; border-collapse: collapse; }
            .net-box { border: 2px solid #000; padding: 6px; text-align: center; font-size: 16px; font-weight: bold; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="title">BIKE KING SPORTS</div>
            <div style="font-size: 11px;">ARQUEO Y CUADRE DE CAJA</div>
            <div style="font-size: 11px;">Fecha: ${dateFormatted}</div>
          </div>

          <div class="divider"></div>
          <div><strong>Total Ventas Realizadas:</strong> ${summary.salesCountToday}</div>
          <div><strong>Gran Total Facturado:</strong> ${formatCOP(summary.todayTotalSalesRevenue)}</div>

          <div class="divider"></div>
          <div class="bold" style="margin-bottom: 4px;">1. MOVIMIENTO DE EFECTIVO:</div>
          <table>
            <tr>
              <td>(+) Ventas en Efectivo:</td>
              <td class="right bold">${formatCOP(summary.todayCashSales)}</td>
            </tr>
            <tr>
              <td>(-) Total Retiros / Egresos:</td>
              <td class="right bold" style="color: #b91c1c;">-${formatCOP(summary.todayTotalWithdrawals)}</td>
            </tr>
          </table>

          <div class="net-box">
            EFECTIVO EN CAJA:<br>
            ${formatCOP(summary.expectedCashInDrawer)}
          </div>
          <div class="center" style="font-size: 11px;">(Monto exacto que debe haber en el cajón)</div>

          ${data.todayWithdrawals.length > 0 ? `
            <div class="divider"></div>
            <div class="bold" style="margin-bottom: 4px;">DETALLE DE RETIROS DE HOY:</div>
            <table>${withdrawalsHtml}</table>
          ` : ''}

          ${summary.otherMethods && summary.otherMethods.length > 0 ? `
            <div class="divider"></div>
            <div class="bold" style="margin-bottom: 4px;">2. OTROS CANALES (NO EFECTIVO):</div>
            <table>${otherMethodsHtml}</table>
          ` : ''}

          <div class="divider"></div>
          <div style="margin-top: 30px; border-top: 1px solid #000; text-align: center; font-size: 11px; padding-top: 4px;">
            Firma Responsable de Caja
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const summary = data.registerSummary || {};

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Encabezado del Modal */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#005BBE', padding: '8px', borderRadius: '10px' }}>
              <Wallet size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                Control de Caja y Retiro de Dinero
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                Registro de egresos, motivos y arqueo de efectivo en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#ffffff',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 24px',
          }}
        >
          <button
            onClick={() => setActiveTab('withdraw')}
            style={{
              padding: '14px 18px',
              border: 'none',
              borderBottom: activeTab === 'withdraw' ? '3px solid #005BBE' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'withdraw' ? '#005BBE' : '#64748b',
              fontWeight: activeTab === 'withdraw' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ArrowDownCircle size={17} /> Retirar Dinero (Egreso)
          </button>

          <button
            onClick={() => setActiveTab('reconciliation')}
            style={{
              padding: '14px 18px',
              border: 'none',
              borderBottom: activeTab === 'reconciliation' ? '3px solid #005BBE' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'reconciliation' ? '#005BBE' : '#64748b',
              fontWeight: activeTab === 'reconciliation' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Coins size={17} /> Arqueo y Cuadre de Caja
          </button>

          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '14px 18px',
              border: 'none',
              borderBottom: activeTab === 'history' ? '3px solid #005BBE' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'history' ? '#005BBE' : '#64748b',
              fontWeight: activeTab === 'history' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <History size={17} /> Historial de Retiros ({data.withdrawals?.length || 0})
          </button>
        </div>

        {/* Contenido Principal de las Pestañas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* ─────────────────────────────────────────────────────────────
              PESTAÑA 1: FORMULARIO DE RETIRO DE DINERO
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleSubmitWithdrawal} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Tarjeta de resumen de efectivo disponible */}
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>
                    Efectivo Actual en Caja Hoy:
                  </span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#005BBE' }}>
                    {formatCOP(summary.expectedCashInDrawer)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#475569' }}>
                  <span>Ventas en Efectivo: <strong>{formatCOP(summary.todayCashSales)}</strong></span><br />
                  <span>Retiros Previos: <strong style={{ color: '#dc2626' }}>-{formatCOP(summary.todayTotalWithdrawals)}</strong></span>
                </div>
              </div>

              {successMessage && (
                <div
                  style={{
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={18} /> {successMessage}
                </div>
              )}

              {/* Campo de Monto */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                  Monto a Retirar ($ COP) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#64748b', fontSize: '1.2rem' }}>$</span>
                  <input
                    type="number"
                    required
                    min="100"
                    step="100"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 34px',
                      borderRadius: '10px',
                      border: '2px solid #cbd5e1',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Botones de incremento rápido */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {[10000, 20000, 50000, 100000, 200000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAddQuickAmount(val)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      +{formatCOP(val)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmount('')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#b91c1c',
                      cursor: 'pointer',
                    }}
                  >
                    Borrar
                  </button>
                </div>
              </div>

              {/* Categoría / Motivo Predefinido */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    Motivo / Concepto <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={reasonCategory}
                    onChange={(e) => setReasonCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="Almuerzos / Refrigerios">🍽️ Almuerzos / Refrigerios</option>
                    <option value="Pago a Proveedor">📦 Pago a Proveedor / Repuestos</option>
                    <option value="Flete / Encomienda">🚚 Flete / Encomienda / Transporte</option>
                    <option value="Adelanto de Sueldo">👤 Adelanto de Sueldo / Personal</option>
                    <option value="Consignación Bancaria">🏦 Traslado / Consignación a Banco</option>
                    <option value="Servicios y Mantenimiento">💡 Servicios Públicos / Aseo</option>
                    <option value="Devolución a Cliente">↩️ Devolución / Garantía</option>
                    <option value="Otro concepto...">✍️ Otro concepto personalizado...</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    Autorizado / Retirado por <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorizedBy}
                    onChange={(e) => setAuthorizedBy(e.target.value)}
                    placeholder="Nombre del responsable"
                    style={{
                      width: '100%',
                      padding: '11px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Detalle o especificación adicional */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  Especificación o Descripción del Gasto:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Pago de flete Servientrega guía #9218 o Almuerzo mecánico Pedro"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Notas opcionales */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Observaciones adicionales (Opcional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles adicionales sobre el dinero retirado..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Opciones y Botón de Acción */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={printAfterSave}
                    onChange={(e) => setPrintAfterSave(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#005BBE' }}
                  />
                  Imprimir comprobante de egreso al guardar
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
                  }}
                >
                  <ArrowDownCircle size={18} />
                  {submitting ? 'Registrando...' : 'Confirmar y Registrar Retiro'}
                </button>
              </div>
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────────
              PESTAÑA 2: ARQUEO Y CUADRE DE CAJA EN VIVO
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'reconciliation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Balance y Cuadre de Caja de Hoy
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Fecha de corte: {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={fetchRegisterData}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <RefreshCw size={14} /> Recalcular
                  </button>
                  <button
                    onClick={handlePrintRegisterClose}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#005BBE',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Printer size={16} /> Imprimir Cierre / Cuadre
                  </button>
                </div>
              </div>

              {/* El Gran Arqueo de Efectivo */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <h5 style={{ margin: '0 0 14px', fontSize: '0.88rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Flujo de Efectivo en Caja Física (Cajón Monedero):
                </h5>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '18px' }}>
                  {/* Ingresos en Efectivo */}
                  <div style={{ padding: '14px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', marginBottom: '4px' }}>
                      <ArrowUpCircle size={16} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>(+) Ventas Efectivo</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>
                      {formatCOP(summary.todayCashSales)}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#15803d' }}>Recaudado en caja hoy</span>
                  </div>

                  {/* Retiros / Egresos */}
                  <div style={{ padding: '14px', backgroundColor: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c', marginBottom: '4px' }}>
                      <ArrowDownCircle size={16} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>(-) Retiros de Caja</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>
                      -{formatCOP(summary.todayTotalWithdrawals)}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#b91c1c' }}>{summary.withdrawalsCountToday} retiros registrados</span>
                  </div>

                  {/* Efectivo que debe haber */}
                  <div style={{ padding: '14px', backgroundColor: '#eff6ff', borderRadius: '10px', border: '2px solid #3b82f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1d4ed8', marginBottom: '4px' }}>
                      <Coins size={16} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>(=) EFECTIVO EN CAJA</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#005BBE' }}>
                      {formatCOP(summary.expectedCashInDrawer)}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: 700 }}>Total a entregar en cajón</span>
                  </div>
                </div>

                {/* Explicación de Cuadre */}
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', fontSize: '0.82rem', color: '#334155' }}>
                  💡 <strong>Fórmula de Cuadre:</strong> El cajero debe contar físicamente los billetes y monedas en el cajón. La suma física debe ser exactamente igual a <strong>{formatCOP(summary.expectedCashInDrawer)}</strong>. Si hay diferencia, se debe registrar el sobrante o faltante.
                </div>
              </div>

              {/* Otros Medios de Pago (No Efectivo) */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h5 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Ventas por Canales Digitales y Bancarios (Hoy):
                  </h5>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                    Total Facturado Hoy: {formatCOP(summary.todayTotalSalesRevenue)}
                  </span>
                </div>

                {summary.otherMethods && summary.otherMethods.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    {summary.otherMethods.map((m, idx) => (
                      <div key={idx} style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>{m.method}</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{formatCOP(m.total)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    Todas las ventas registradas el día de hoy han sido en Efectivo.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              PESTAÑA 3: HISTORIAL DE RETIROS DE DINERO
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'history' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Histórico de Egresos y Salidas de Efectivo
                </h4>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Mostrando los últimos {data.withdrawals?.length || 0} movimientos
                </span>
              </div>

              {data.withdrawals && data.withdrawals.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', borderBottom: '2px solid #cbd5e1' }}>
                        <th style={{ padding: '10px 12px' }}>Fecha y Hora</th>
                        <th style={{ padding: '10px 12px' }}>Monto Retirado</th>
                        <th style={{ padding: '10px 12px' }}>Motivo / Concepto</th>
                        <th style={{ padding: '10px 12px' }}>Autorizado Por</th>
                        <th style={{ padding: '10px 12px' }}>Notas</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.withdrawals.map((w, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: 600, color: '#0f172a', display: 'block' }}>
                              {new Date(w.created_at).toLocaleDateString('es-CO')}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {new Date(w.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 800, color: '#dc2626', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                            -{formatCOP(w.amount)}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>
                            {w.reason}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>
                            {w.authorized_by || 'Cajero'}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '0.78rem', maxWidth: '200px' }}>
                            {w.notes || '-'}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button
                              onClick={() => handlePrintWithdrawalVoucher(w)}
                              title="Reimprimir comprobante de egreso"
                              style={{
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                marginRight: '6px',
                              }}
                            >
                              <Printer size={14} color="#005BBE" />
                            </button>
                            <button
                              onClick={() => handleDeleteWithdrawal(w.id)}
                              title="Anular retiro"
                              style={{
                                backgroundColor: '#fee2e2',
                                border: '1px solid #fecaca',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={14} color="#dc2626" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '35px', color: '#94a3b8' }}>
                  <Coins size={36} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>No se han registrado retiros de efectivo aún.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
