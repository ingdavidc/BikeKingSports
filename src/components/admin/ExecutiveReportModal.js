'use client';

import { Printer, X, Download, Bike, Calendar, CheckCircle2, AlertCircle, DollarSign, TrendingUp, Layers } from 'lucide-react';

export default function ExecutiveReportModal({ isOpen, onClose, stats, timeframeLabel }) {
  if (!isOpen || !stats) return null;

  const formatCOP = (num) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const {
    kpis = {},
    inventoryValuation = {},
    periodFinancials = {},
    dailySales = [],
    charts = {},
    topProducts = []
  } = stats;

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
          maxWidth: '920px',
          maxHeight: '92vh',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Barra superior de controles */}
        <div
          className="no-print"
          style={{
            padding: '16px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bike size={22} color="#38bdf8" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                Balance Financiero y Reporte Ejecutivo
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                Periodo: {timeframeLabel}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#005BBE',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              <Printer size={16} /> Imprimir / Guardar PDF
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
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
        </div>

        {/* Cuerpo del Reporte Imprimible */}
        <div
          id="printable-report"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '40px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Encabezado Membretado */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid #005BBE',
              paddingBottom: '20px',
              marginBottom: '24px',
            }}
          >
            <div>
              <h1
                style={{
                  margin: '0 0 4px',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: '#005BBE',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                BIKE KING SPORTS
              </h1>
              <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                Taller Especializado y Tienda de Ciclismo
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Informe Ejecutivo de Valuación de Inventario y Ventas Diarias
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  backgroundColor: '#f1f5f9',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  display: 'inline-block',
                  marginBottom: '6px',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                  PERIODO: {timeframeLabel.toUpperCase()}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                Fecha de Emisión: {todayStr}
              </p>
            </div>
          </div>

          {/* 1. SECCIÓN EXCLUSIVA: VALUACIÓN Y UTILIDAD TOTAL DEL INVENTARIO */}
          <div style={{ marginBottom: '28px' }}>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#1e293b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px',
                borderLeft: '4px solid #005BBE',
                paddingLeft: '8px',
              }}
            >
              1. Valuación Financiera del Inventario en Stock
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '14px',
                marginBottom: '12px',
              }}
            >
              {/* Costo Real */}
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total a Costo Real (Inversión)
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', display: 'block', margin: '4px 0' }}>
                  {formatCOP(inventoryValuation.totalCostValue ?? kpis.inventoryCostValue)}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {inventoryValuation.totalUnits ?? kpis.totalStockUnits ?? 0} unidades físicas en almacén
                </span>
              </div>

              {/* Costo de Venta (PVP) */}
              <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: '0.78rem', color: '#1d4ed8', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total a Costo de Venta (PVP)
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#005BBE', display: 'block', margin: '4px 0' }}>
                  {formatCOP(inventoryValuation.totalRetailValue ?? kpis.inventoryRetailValue)}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#1e40af' }}>
                  Facturación potencial si se liquida todo
                </span>
              </div>

              {/* Utilidad Real si vendiera todo */}
              <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '0.78rem', color: '#15803d', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                  Utilidad Real si Vendiera Todo
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', display: 'block', margin: '4px 0' }}>
                  {formatCOP(inventoryValuation.totalPotentialProfit ?? kpis.potentialGrossProfit)}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>
                  Margen Bruto Real: {inventoryValuation.marginPct ?? kpis.inventoryMarginPct ?? 0}%
                </span>
              </div>
            </div>
          </div>

          {/* 2. VENTAS DIARIAS CON VENTA, COSTO REAL Y UTILIDAD REAL */}
          <div style={{ marginBottom: '28px' }}>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#1e293b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px',
                borderLeft: '4px solid #005BBE',
                paddingLeft: '8px',
              }}
            >
              2. Registro de Ventas Diarias (Venta vs Costo Real vs Utilidad Real)
            </h3>

            {dailySales && dailySales.length > 0 ? (
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.85rem',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '8px 10px' }}>Fecha</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Pedidos</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Artículos</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total Venta (PVP)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Costo Real</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Utilidad Real</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Margen %</th>
                  </tr>
                </thead>
                <tbody>
                  {dailySales.map((day, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{day.date}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>{day.transactionsCount}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>{day.itemsCount}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>
                        {formatCOP(day.totalSales)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#64748b' }}>
                        {formatCOP(day.totalCost)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>
                        {formatCOP(day.profit)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#005BBE' }}>
                        {day.marginPct}%
                      </td>
                    </tr>
                  ))}
                  {/* Fila de Totales del Periodo */}
                  <tr style={{ backgroundColor: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                    <td style={{ padding: '10px' }}>TOTALES DEL PERIODO</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {dailySales.reduce((a, b) => a + b.transactionsCount, 0)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {dailySales.reduce((a, b) => a + b.itemsCount, 0)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#005BBE' }}>
                      {formatCOP(periodFinancials.totalSales ?? kpis.totalRevenue)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#64748b' }}>
                      {formatCOP(periodFinancials.totalCost ?? kpis.totalCost)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#16a34a' }}>
                      {formatCOP(periodFinancials.totalProfit ?? kpis.totalProfit)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#005BBE' }}>
                      {periodFinancials.marginPct ?? kpis.profitMarginPct ?? 0}%
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Sin ventas registradas en el periodo seleccionado.
              </p>
            )}
          </div>

          {/* 3. RESUMEN OPERATIVO ADICIONAL (TALLER Y SEPARADOS) */}
          <div style={{ marginBottom: '28px' }}>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#1e293b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px',
                borderLeft: '4px solid #005BBE',
                paddingLeft: '8px',
              }}
            >
              3. Resumen Operativo Adicional
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>
                  Taller en Servicio
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>
                  {kpis.activeWorkshopCount || 0} bicicletas
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
                  Est: {formatCOP(kpis.pendingWorkshopRevenue)}
                </span>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>
                  Cartera (Separados Pendientes)
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#005BBE' }}>
                  {formatCOP(kpis.totalPendingLayaway)}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
                  {kpis.pendingLayawaysCount || 0} planes activos
                </span>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>
                  Ticket Promedio
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {formatCOP(kpis.avgTicket)}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
                  Por compra
                </span>
              </div>
            </div>
          </div>

          {/* Firmas de Control */}
          <div
            style={{
              marginTop: '45px',
              paddingTop: '25px',
              borderTop: '1px solid #cbd5e1',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ width: '40%', textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '8px', height: '40px' }} />
              <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700 }}>Gerencia / Administración</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>BIKE KING SPORTS</p>
            </div>

            <div style={{ width: '40%', textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '8px', height: '40px' }} />
              <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700 }}>Revisión y Control Contable</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Firma y Sello</p>
            </div>
          </div>
        </div>

        {/* Estilos específicos de impresión */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-report, #printable-report * {
              visibility: visible;
            }
            #printable-report {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20mm;
              margin: 0;
              box-shadow: none;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
