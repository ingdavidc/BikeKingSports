import { useState, useEffect } from 'react';

export default function SalesHistoryModal({ onClose }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/sales');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSales(data);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handlePrint = (sale) => {
    let itemsHtml = '';
    let parsedItems = [];
    try {
      parsedItems = JSON.parse(sale.items || '[]');
    } catch (e) {}

    parsedItems.forEach(item => {
      itemsHtml += `
        <tr>
          <td style="padding: 4px 0; border-bottom: 1px dashed #ccc;">${item.quantity}x ${item.name}</td>
          <td style="padding: 4px 0; border-bottom: 1px dashed #ccc; text-align: right;">$${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `;
    });

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Recibo de Venta - ${sale.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; font-size: 14px; padding: 20px; width: 300px; margin: 0 auto; color: #000; }
            h1 { text-align: center; font-size: 18px; margin-bottom: 5px; }
            h2 { text-align: center; font-size: 14px; margin-top: 0; font-weight: normal; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding-bottom: 5px; border-bottom: 1px dashed #000; }
            .total { font-weight: bold; font-size: 16px; margin-top: 10px; text-align: right; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>BIKE KING SPORTS</h1>
          <h2>Taller y Tienda Especializada</h2>
          <div class="divider"></div>
          <div><strong>Fecha:</strong> ${new Date(sale.created_at).toLocaleString()}</div>
          <div><strong>Recibo:</strong> ${sale.id.substring(0, 8).toUpperCase()}</div>
          ${sale.customer_document ? `<div><strong>Cliente Doc:</strong> ${sale.customer_document}</div>` : ''}
          ${sale.work_order_id ? `<div><strong>Orden de Taller:</strong> ${sale.work_order_id.substring(0,8).toUpperCase()}</div>` : ''}
          <div class="divider"></div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="divider"></div>
          <div class="total">TOTAL: $${sale.total.toLocaleString()}</div>
          <div>Método de pago: ${sale.payment_method}</div>
          <div class="divider"></div>
          <div class="footer">
            ¡Gracias por su compra!<br>
            www.bikekingsports.com
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintFull = () => {
    const printWindow = window.open('', '_blank');
    
    let tableRows = '';
    let grandTotal = 0;

    sales.forEach(sale => {
      grandTotal += sale.total;
      tableRows += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(sale.created_at).toLocaleString()}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${sale.id.substring(0, 8).toUpperCase()}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${sale.customer_document || 'N/A'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${sale.payment_method}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${sale.total.toLocaleString()}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Ventas - Bike King Sports</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 10px; background: #f4f4f4; border-bottom: 2px solid #ddd; }
            .header { display: flex; justify-content: space-between; align-items: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Reporte General de Ventas (Últimos Registros)</h2>
            <div style="font-size: 20px; font-weight: bold;">Total Acumulado: $${grandTotal.toLocaleString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>ID Venta</th>
                <th>Cliente (Doc)</th>
                <th>Método de Pago</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '12px', width: '800px', maxWidth: '95%',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem' }}>Historial de Ventas</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handlePrintFull}
              style={{ padding: '8px 12px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Imprimir Reporte
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.5rem' }}>&times;</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, backgroundColor: '#f8fafc' }}>
          {loading ? (
            <p>Cargando historial...</p>
          ) : sales.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>No hay ventas registradas.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sales.map((sale) => {
                let parsedItems = [];
                try { parsedItems = JSON.parse(sale.items || '[]'); } catch(e){}
                const isExpanded = selectedSale === sale.id;

                return (
                  <div key={sale.id} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div 
                      onClick={() => setSelectedSale(isExpanded ? null : sale.id)}
                      style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', ':hover': { backgroundColor: '#f8fafc' } }}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Recibo: {sale.id.substring(0, 8).toUpperCase()}</div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                          {new Date(sale.created_at).toLocaleString()} • {sale.payment_method}
                          {sale.customer_document ? ` • Cliente: ${sale.customer_document}` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.1rem' }}>
                          ${sale.total.toLocaleString()}
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePrint(sale); }}
                          style={{ padding: '6px', backgroundColor: 'transparent', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer' }}
                          title="Imprimir Recibo"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        </button>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#334155' }}>Artículos:</h4>
                        <table style={{ width: '100%', fontSize: '0.9rem', color: '#475569' }}>
                          <tbody>
                            {parsedItems.map((item, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: '4px 0' }}>{item.quantity}x</td>
                                <td>{item.name}</td>
                                <td style={{ textAlign: 'right', fontWeight: '500' }}>${(item.price * item.quantity).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
