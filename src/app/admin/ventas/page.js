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

  // Customer state
  const [customerDoc, setCustomerDoc] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchActiveOrders();
  }, []);

  // Debounce customer search
  useEffect(() => {
    if (customerDoc.length >= 4) {
      const timer = setTimeout(() => {
        searchCustomer(customerDoc);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [customerDoc]);

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
      if (Array.isArray(data)) {
        setActiveOrders(data.filter(o => o.status !== 'entregada'));
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const searchCustomer = async (doc) => {
    setIsSearchingCustomer(true);
    try {
      const res = await fetch(`/api/customers?document=${doc}`);
      const data = await res.json();
      if (data.success && data.data) {
        setCustomerName(data.data.name || '');
        setCustomerEmail(data.data.email || '');
        setCustomerPhone(data.data.phone || '');
      }
    } catch (err) {
      console.error(err);
    }
    setIsSearchingCustomer(false);
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
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > item.stock) return item;
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
        work_order_id: selectedOrderId || null,
        customer: customerDoc ? {
          document: customerDoc,
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        } : null
      };

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        // Enviar WhatsApp si hay teléfono
        if (customerPhone) {
          const itemsText = cart.map(i => `${i.quantity}x ${i.name} ($${i.price})`).join('%0A');
          const msg = `Hola${customerName ? ' ' + customerName : ''}, gracias por tu compra en BIKE KING SPORTS.%0A%0A*Detalle de Venta:*%0A${itemsText}%0A%0A*Total:* $${cartTotal.toLocaleString()}%0AMétodo: ${paymentMethod}%0A%0A¡Te esperamos pronto!`;
          const phone = customerPhone.replace(/\D/g, ''); // Solo números
          window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
        }

        // Limpiar formulario
        setCart([]);
        setIsCheckoutModalOpen(false);
        setPaymentMethod('Efectivo');
        setSelectedOrderId('');
        setCustomerDoc('');
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        fetchProducts();
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
      
      {/* LEFT COLUMN: PRODUCT CATALOG */}
      <div style={{ flex: '6.5', display: 'flex', flexDirection: 'column', backgroundColor: 'white', color: '#0f172a', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: '700' }}>Punto de Venta</h2>
          <input 
            type="text"
            placeholder="🔍 Buscar por nombre o código de barras (SKU)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>

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
                      backgroundColor: 'white', color: '#0f172a', borderRadius: '8px', padding: '15px', border: '1px solid #e2e8f0',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer', opacity: isOutOfStock ? 0.6 : 1,
                      transition: 'transform 0.1s', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                    }}
                    onMouseDown={e => { if(!isOutOfStock) e.currentTarget.style.transform = 'scale(0.97)'; }}
                    onMouseUp={e => { if(!isOutOfStock) e.currentTarget.style.transform = 'scale(1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '5px' }}>{product.sku || 'N/A'}</div>
                      <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '10px', fontSize: '0.95rem', lineHeight: '1.3' }}>{product.name}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
                      <div style={{ fontWeight: 'bold', color: '#0ea5e9', fontSize: '1.2rem' }}>${product.price.toLocaleString()}</div>
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

      {/* RIGHT COLUMN: CART */}
      <div style={{ flex: '3.5', display: 'flex', flexDirection: 'column', backgroundColor: 'white', color: '#0f172a', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
            <span>🛒 Ticket</span>
            <span style={{ backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 10px', borderRadius: '20px', fontSize: '1rem' }}>{cart.length}</span>
          </h2>
        </div>

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
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '5px' }}>
                    <button onClick={() => updateQuantity(item.id, -1)} style={{ width: '35px', height: '35px', border: 'none', backgroundColor: 'white', borderRadius: '6px', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>-</button>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', minWidth: '20px', textAlign: 'center', color: '#334155' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} style={{ width: '35px', height: '35px', border: 'none', backgroundColor: 'white', borderRadius: '6px', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
              width: '100%', padding: '20px', backgroundColor: cart.length === 0 ? '#cbd5e1' : '#1964a6', 
              color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.5rem', fontWeight: 'bold', 
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}
          >
            💳 COBRAR
          </button>
        </div>
      </div>

      {/* MODAL DE PAGO */}
      {isCheckoutModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', color: '#0f172a', width: '95%', maxWidth: '900px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: '700' }}>Finalizar Venta</h2>
              <button onClick={() => setIsCheckoutModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            
            <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'row', flex: 1, overflow: 'hidden' }}>
              
              {/* Left Side: Customer & Order */}
              <div style={{ flex: 1, padding: '25px', borderRight: '1px solid #e2e8f0', overflowY: 'auto' }}>
                
                {/* Datos del Cliente */}
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>👤 Datos del Cliente (Opcional)</span>
                    {isSearchingCustomer && <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>Buscando...</span>}
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#64748b' }}>Documento (Cédula/NIT)</label>
                      <input 
                        type="text" 
                        value={customerDoc} 
                        onChange={e => setCustomerDoc(e.target.value)} 
                        placeholder="Ej. 1020304050"
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#64748b' }}>Nombre Completo</label>
                      <input 
                        type="text" 
                        value={customerName} 
                        onChange={e => setCustomerName(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#64748b' }}>Teléfono (Para WhatsApp)</label>
                      <input 
                        type="text" 
                        value={customerPhone} 
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="Ej. 3001234567"
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#64748b' }}>Correo Electrónico</label>
                      <input 
                        type="email" 
                        value={customerEmail} 
                        onChange={e => setCustomerEmail(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '25px 0' }} />

                {/* Vincular a Orden de Taller */}
                <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: '#334155' }}>
                    🔧 Vincular a Orden de Taller (Opcional)
                  </label>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 10px 0' }}>
                    Suma el costo de estos repuestos a la deuda del taller.
                  </p>
                  <select 
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  >
                    <option value="">-- No vincular a ninguna orden --</option>
                    {activeOrders.map(order => (
                      <option key={order.id} value={order.id}>
                        {order.bike_model} - {order.customer_name} ({order.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Side: Payment & Confirm */}
              <div style={{ flex: '0 0 350px', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#fafafa' }}>
                
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '5px' }}>Total a Pagar</div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#0ea5e9' }}>${cartTotal.toLocaleString()}</div>
                  </div>

                  {/* Métodos de Pago */}
                  <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', marginBottom: '15px', fontWeight: 600, color: '#334155' }}>Método de Pago</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {['Efectivo', 'Tarjeta', 'Transferencia'].map(method => (
                        <div 
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          style={{
                            padding: '15px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                            border: paymentMethod === method ? '2px solid #1964a6' : '2px solid #e2e8f0',
                            backgroundColor: paymentMethod === method ? '#f0f9ff' : 'white',
                            color: paymentMethod === method ? '#1964a6' : '#64748b',
                            transition: 'all 0.2s'
                          }}
                        >
                          {method}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botón Final */}
                <div>
                  {customerPhone && (
                    <div style={{ textAlign: 'center', marginBottom: '10px', fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>
                      <span style={{ fontSize: '1.2rem', verticalAlign: 'middle' }}>💬</span> Se abrirá WhatsApp al finalizar
                    </div>
                  )}
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    style={{
                      width: '100%', padding: '18px', backgroundColor: isProcessing ? '#94a3b8' : '#1964a6', 
                      color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: isProcessing ? 'wait' : 'pointer'
                    }}
                  >
                    {isProcessing ? 'PROCESANDO...' : 'CONFIRMAR VENTA'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
