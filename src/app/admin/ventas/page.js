'use client';

import { useState, useEffect, useMemo } from 'react';

export default function VentasPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [activeOrders, setActiveOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchActiveOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
    setLoading(false);
  };

  const fetchActiveOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      // Filtrar órdenes que no estén entregadas para poder asignarles repuestos
      if (Array.isArray(data)) {
        setActiveOrders(data.filter(o => o.status !== 'entregada'));
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    const s = search.toLowerCase();
    return products.filter(p => 
      (p.name && p.name.toLowerCase().includes(s)) || 
      (p.sku && p.sku.toLowerCase().includes(s))
    );
  }, [products, search]);

  const addToCart = (product) => {
    if (product.stock <= 0) return; // No stock
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Cannot exceed stock
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null; // Remove if 0
        if (newQty > item.stock) return item; // Cannot exceed stock
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      const payload = {
        items: cart.map(i => ({ id: i.id, sku: i.sku, name: i.name, quantity: i.quantity, price: i.price })),
        payment_method: paymentMethod,
        total: cartTotal,
        work_order_id: selectedOrderId || null
      };

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        // Venta completada
        setCart([]);
        setIsCheckoutModalOpen(false);
        setPaymentMethod('Efectivo');
        setSelectedOrderId('');
        fetchProducts(); // Refrescar inventario
        alert('✅ Venta registrada exitosamente.');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al procesar la venta.');
    }
    setIsProcessing(false);
  };

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', gap: '20px', flexDirection: 'row' }}>
      
      {/* LEFT COLUMN: PRODUCT CATALOG (65%) */}
      <div style={{ flex: '6.5', display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        {/* Header & Search */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '1.5rem' }}>Punto de Venta</h2>
          <input 
            type="text"
            placeholder="🔍 Buscar por nombre o código de barras (SKU)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>

        {/* Product Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#f1f5f9' }}>
          {loading ? (
            <p>Cargando inventario...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
              {filteredProducts.map(product => {
                const isOutOfStock = product.stock <= 0;
                return (
                  <div 
                    key={product.id}
                    onClick={() => addToCart(product)}
                    style={{ 
                      backgroundColor: 'white', 
                      borderRadius: '8px', 
                      padding: '15px', 
                      border: '1px solid #e2e8f0',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      opacity: isOutOfStock ? 0.6 : 1,
                      transition: 'transform 0.1s',
                      boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                    onMouseDown={e => { if(!isOutOfStock) e.currentTarget.style.transform = 'scale(0.97)'; }}
                    onMouseUp={e => { if(!isOutOfStock) e.currentTarget.style.transform = 'scale(1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '5px' }}>{product.sku || 'N/A'}</div>
                      <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '10px', fontSize: '0.95rem', lineHeight: '1.3' }}>
                        {product.name}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
                      <div style={{ fontWeight: 'bold', color: '#0ea5e9', fontSize: '1.2rem' }}>
                        ${product.price.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isOutOfStock ? '#ef4444' : '#10b981', backgroundColor: isOutOfStock ? '#fee2e2' : '#d1fae5', padding: '2px 6px', borderRadius: '4px' }}>
                        Stock: {product.stock}
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredProducts.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>No se encontraron productos.</p>}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: CART (35%) */}
      <div style={{ flex: '3.5', display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>🛒 Ticket</span>
            <span style={{ backgroundColor: '#e2e8f0', padding: '2px 10px', borderRadius: '20px', fontSize: '1rem' }}>{cart.length}</span>
          </h2>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {cart.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🚲</div>
              <p>Agrega productos para la venta</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ flex: 1, paddingRight: '10px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ color: '#0ea5e9', fontWeight: 'bold' }}>${(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                  
                  {/* Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '5px' }}>
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{ width: '35px', height: '35px', border: 'none', backgroundColor: 'white', borderRadius: '6px', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                    >-</button>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', minWidth: '20px', textAlign: 'center', color: '#334155' }}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{ width: '35px', height: '35px', border: 'none', backgroundColor: 'white', borderRadius: '6px', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer / Checkout Button */}
        <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.1rem', color: '#475569' }}>
            <span>Subtotal</span>
            <span>${cartTotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a' }}>
            <span>Total</span>
            <span>${cartTotal.toLocaleString()}</span>
          </div>
          
          <button 
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutModalOpen(true)}
            style={{ 
              width: '100%', padding: '20px', backgroundColor: cart.length === 0 ? '#cbd5e1' : '#10b981', 
              color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.5rem', fontWeight: 'bold', 
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}
          >
            💳 COBRAR
          </button>
        </div>
      </div>

      {/* MODAL DE PAGO */}
      {isCheckoutModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', width: '90%', maxWidth: '600px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <div style={{ padding: '25px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem' }}>Finalizar Venta</h2>
              <button onClick={() => setIsCheckoutModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            
            <form onSubmit={handleCheckout} style={{ padding: '25px' }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '5px' }}>Total a Pagar</div>
                <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#0ea5e9' }}>${cartTotal.toLocaleString()}</div>
              </div>

              {/* Métodos de Pago */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: '#334155' }}>Método de Pago</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  {['Efectivo', 'Tarjeta', 'Transferencia'].map(method => (
                    <div 
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        padding: '15px 10px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                        border: paymentMethod === method ? '2px solid #38bdf8' : '2px solid #e2e8f0',
                        backgroundColor: paymentMethod === method ? '#f0f9ff' : 'white',
                        color: paymentMethod === method ? '#0284c7' : '#64748b',
                        transition: 'all 0.2s'
                      }}
                    >
                      {method}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vincular a Orden de Taller */}
              <div style={{ marginBottom: '30px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: '#334155' }}>
                  🔧 Vincular a Orden de Taller (Opcional)
                </label>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 10px 0' }}>
                  Si seleccionas una orden, el total de esta venta se sumará automáticamente al precio final que debe pagar el cliente por el mantenimiento.
                </p>
                <select 
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', color: '#0f172a' }}
                >
                  <option value="">-- No vincular a ninguna orden --</option>
                  {activeOrders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.bike_model} - {order.customer_name} ({order.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón Final */}
              <button 
                type="submit"
                disabled={isProcessing}
                style={{
                  width: '100%', padding: '18px', backgroundColor: isProcessing ? '#94a3b8' : '#1e293b', 
                  color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: isProcessing ? 'wait' : 'pointer'
                }}
              >
                {isProcessing ? 'PROCESANDO...' : 'CONFIRMAR Y GUARDAR VENTA'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
