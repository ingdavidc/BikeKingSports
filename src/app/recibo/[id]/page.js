'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export default function ReceiptPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const print = searchParams.get('print');
  
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/sales/${params.id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setSale(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [params.id]);

  useEffect(() => {
    if (sale && print === 'true') {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [sale, print]);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando recibo...</div>;
  if (!sale) return <div style={{ textAlign: 'center', padding: '50px' }}>Recibo no encontrado</div>;

  let items = [];
  try { items = JSON.parse(sale.items || '[]'); } catch(e){}

  return (
    <div style={{
      maxWidth: '300px',
      margin: '0 auto',
      padding: '20px 10px',
      fontFamily: 'monospace',
      color: '#000',
      backgroundColor: '#fff',
      fontSize: '12px',
      lineHeight: '1.4'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>BIKE KING SPORTS</h2>
        <div style={{ fontSize: '10px' }}>NIT: Pendiente</div>
        <div>Cl. 22 #13-27, Saravena, Arauca</div>
        <div>WhatsApp: +57 310 329 1475</div>
        <div style={{ marginTop: '10px', borderBottom: '1px dashed #000', paddingBottom: '5px' }}>
          <strong>RECIBO DE VENTA</strong>
        </div>
      </div>

      {/* Info Venta */}
      <div style={{ marginBottom: '15px' }}>
        <div><strong>Recibo N°:</strong> {sale.id.substring(0, 8).toUpperCase()}</div>
        <div><strong>Fecha:</strong> {new Date(sale.created_at).toLocaleString('es-CO')}</div>
        {sale.customer_document && (
          <>
            <div><strong>Cliente:</strong> {sale.customer?.name || 'Consumidor Final'}</div>
            <div><strong>Doc:</strong> {sale.customer_document}</div>
          </>
        )}
      </div>

      {/* Items */}
      <table style={{ width: '100%', marginBottom: '15px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px dashed #000' }}>
            <th style={{ textAlign: 'left', paddingBottom: '5px' }}>Cant</th>
            <th style={{ textAlign: 'left', paddingBottom: '5px' }}>Detalle</th>
            <th style={{ textAlign: 'right', paddingBottom: '5px' }}>SubT</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td style={{ verticalAlign: 'top', paddingTop: '5px' }}>{item.quantity}</td>
              <td style={{ verticalAlign: 'top', paddingTop: '5px', paddingRight: '5px' }}>
                {item.name} <br/>
                <small style={{ color: '#555' }}>${item.price.toLocaleString()}</small>
              </td>
              <td style={{ verticalAlign: 'top', textAlign: 'right', paddingTop: '5px' }}>
                ${(item.price * item.quantity).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ borderTop: '1px dashed #000', paddingTop: '10px', marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
          <span>TOTAL A PAGAR:</span>
          <span>${sale.total.toLocaleString()}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
          <span>Método de pago:</span>
          <span style={{ textTransform: 'capitalize' }}>{sale.payment_method}</span>
        </div>

        {sale.payment_method === 'Efectivo' && sale.cash_received && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Efectivo Recibido:</span>
              <span>${sale.cash_received.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Cambio:</span>
              <span>${sale.change_given.toLocaleString()}</span>
            </div>
          </>
        )}

        {sale.transaction_ref && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Ref. Transacción:</span>
            <span>{sale.transaction_ref}</span>
          </div>
        )}
        
        {sale.status === 'layaway' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontWeight: 'bold' }}>
              <span>Abono Inicial:</span>
              <span>${(sale.amount_paid || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#555' }}>
              <span>Saldo Pendiente:</span>
              <span>${(sale.total - (sale.amount_paid || 0)).toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px' }}>
        <p>¡Gracias por tu compra en Bike King Sports!</p>
        <p>Los artículos eléctricos tienen garantía de 30 días.</p>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 0; background: #fff; }
          @page { margin: 0; }
        }
      `}</style>
    </div>
  );
}
