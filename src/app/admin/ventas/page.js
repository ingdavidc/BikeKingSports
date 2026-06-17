'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/* ─── Colores por estado de orden ───────────────────────── */
const ORDER_STATUS = {
  recibida:   { label: 'Recibida',    color: '#7c3aed', bg: '#ede9fe' },
  en_proceso: { label: 'En Proceso',  color: '#d97706', bg: '#fef3c7' },
  lista:      { label: 'Lista ✅',    color: '#16a34a', bg: '#dcfce7' },
  entregada:  { label: 'Entregada',   color: '#64748b', bg: '#f1f5f9' },
};

const PRIORITY_LABELS = { urgente: '🔴 Urgente', normal: '🟡 Normal', rutina: '🟢 Rutina' };

const CATEGORIES = ['bicicletas', 'repuestos', 'accesorios'];

function fmt(price) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price || 0);
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/* ══════════════════════════════════════════════════════════ */
export default function VentasPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts]   = useState([]);
  const [services, setServices]   = useState([]);
  const [orders, setOrders]       = useState([]);
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [globalError, setGlobalError] = useState('');

  /* ─── Quoter state ─── */
  const [quote, setQuote]         = useState([]);
  const [quoteNote, setQuoteNote] = useState('');

  /* ─── Inventory form ─── */
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: 'repuestos', image_url: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productError, setProductError]         = useState('');
  const [productSaving, setProductSaving]       = useState(false);
  const [catFilter, setCatFilter]               = useState('all');
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  /* ─── Service form ─── */
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', video_url: '' });
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceSaving, setServiceSaving]       = useState(false);
  const [serviceError, setServiceError]         = useState('');

  /* ─── Event form ─── */
  const [eventForm, setEventForm] = useState({ title: '', date: '', description: '', image_url: '' });
  const [eventModalOpen, setEventModalOpen]     = useState(false);
  const [eventSaving, setEventSaving]           = useState(false);
  const [eventError, setEventError]             = useState('');

  /* ─── Loaders ─────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s, o, e] = await Promise.all([
        fetch('/api/content?type=products').then(r => r.json()),
        fetch('/api/content?type=services').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/content?type=events').then(r => r.json()),
      ]);
      if (!p.error) setProducts(p);
      if (!s.error) setServices(s);
      if (!o.error) setOrders(o);
      if (!e.error) setEvents(e);
    } catch { setGlobalError('Error cargando datos. Verifica tu conexión.'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toast = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3500); };

  /* ─── Image upload ────────────────────────────────────── */
  const handleUpload = async (e, onSuccess) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) onSuccess(data.url);
      else setProductError(data.error || 'Error al subir imagen');
    } catch { setProductError('Error de conexión al subir imagen'); }
    setUploading(false);
  };

  /* ─── Product CRUD ────────────────────────────────────── */
  const openProductModal = (p = null) => {
    setProductError('');
    if (p) { setEditingProduct(p); setProductForm({ name: p.name, description: p.description || '', price: p.price, category: p.category || 'repuestos', image_url: p.image_url || '' }); }
    else { setEditingProduct(null); setProductForm({ name: '', description: '', price: '', category: 'repuestos', image_url: '' }); }
    setProductModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductError('');
    if (!productForm.name.trim()) return setProductError('El nombre es requerido');
    if (!productForm.price || productForm.price <= 0) return setProductError('El precio debe ser mayor a 0');
    setProductSaving(true);
    try {
      const action = editingProduct ? 'update_product' : 'add_product';
      const payload = editingProduct ? { ...productForm, id: editingProduct.id } : productForm;
      const res = await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, payload }) });
      const data = await res.json();
      if (res.ok) { toast(editingProduct ? 'Producto actualizado.' : '¡Producto agregado!'); setProductModalOpen(false); load(); }
      else setProductError(data.error || 'Error al guardar');
    } catch { setProductError('Error de conexión'); }
    setProductSaving(false);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Eliminar este producto del catálogo?')) return;
    const res = await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete_product', payload: { id } }) });
    if (res.ok) { toast('Producto eliminado.'); load(); }
  };

  /* ─── Service CRUD ────────────────────────────────────── */
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setServiceError('');
    if (!serviceForm.name.trim()) return setServiceError('El nombre del servicio es requerido');
    setServiceSaving(true);
    try {
      const res = await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add_service', payload: serviceForm }) });
      const data = await res.json();
      if (res.ok) { toast('Servicio agregado.'); setServiceModalOpen(false); setServiceForm({ name: '', description: '', price: '', video_url: '' }); load(); }
      else setServiceError(data.error || 'Error');
    } catch { setServiceError('Error de conexión'); }
    setServiceSaving(false);
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('¿Eliminar este servicio?')) return;
    const res = await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete_service', payload: { id } }) });
    if (res.ok) { toast('Servicio eliminado.'); load(); }
  };

  /* ─── Event CRUD ──────────────────────────────────────── */
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setEventError('');
    if (!eventForm.title.trim() || !eventForm.date) return setEventError('Título y fecha son requeridos');
    setEventSaving(true);
    try {
      const res = await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add_event', payload: eventForm }) });
      const data = await res.json();
      if (res.ok) { toast('Evento creado.'); setEventModalOpen(false); setEventForm({ title: '', date: '', description: '', image_url: '' }); load(); }
      else setEventError(data.error || 'Error');
    } catch { setEventError('Error de conexión'); }
    setEventSaving(false);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('¿Eliminar este evento?')) return;
    const res = await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete_event', payload: { id } }) });
    if (res.ok) { toast('Evento eliminado.'); load(); }
  };

  /* ─── Quoter ──────────────────────────────────────────── */
  const addToQuote = (item, type) => {
    setQuote(q => [...q, { ...item, _type: type, _qty: 1 }]);
    toast(`${item.name} agregado a la cotización`);
  };

  const quoteTotal = quote.reduce((acc, i) => acc + (Number(i.price) * i._qty), 0);

  const printQuote = () => {
    const lines = quote.map(i => `  • ${i.name} x${i._qty}: ${fmt(i.price * i._qty)}`).join('\n');
    const text = `COTIZACIÓN - BIKE KING SPORTS\nFecha: ${new Date().toLocaleDateString('es-CO')}\n\n${lines}\n${quoteNote ? '\nNota: ' + quoteNote + '\n' : ''}\n─────────────────────\nTOTAL: ${fmt(quoteTotal)}`;
    const w = window.open('', '_blank');
    w.document.write(`<pre style="font-family:monospace;font-size:14px;padding:30px;">${text}</pre>`);
    w.print();
  };

  /* ─── Layout ──────────────────────────────────────────── */
  const TABS = [
    { key: 'dashboard',  label: '📊 Dashboard' },
    { key: 'inventario', label: '🚲 Inventario' },
    { key: 'servicios',  label: '🔧 Servicios' },
    { key: 'ordenes',    label: '📋 Órdenes Taller', badge: orders.filter(o => o.status === 'lista').length },
    { key: 'eventos',    label: '📅 Eventos' },
    { key: 'cotizador',  label: '🧾 Cotizador', badge: quote.length },
  ];

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color: '#64748b' }}>Cargando panel de ventas...</p>
    </div>
  );

  return (
    <div>
      {/* ── Notificaciones globales ── */}
      {successMsg && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#16a34a', color: 'white', padding: '12px 20px', borderRadius: '8px', fontWeight: 600, zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          ✅ {successMsg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Panel de Ventas</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '0.9rem' }}>
          Bike King Sports — {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #e2e8f0', marginBottom: '28px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: '10px 18px', border: 'none', backgroundColor: 'transparent', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', color: activeTab === t.key ? '#2563eb' : '#64748b', borderBottom: activeTab === t.key ? '2px solid #2563eb' : '2px solid transparent', marginBottom: '-2px', whiteSpace: 'nowrap', position: 'relative' }}>
            {t.label}
            {t.badge > 0 && <span style={{ marginLeft: '6px', backgroundColor: '#ef4444', color: 'white', borderRadius: '10px', padding: '1px 6px', fontSize: '0.72rem' }}>{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* ════════════ DASHBOARD ════════════ */}
      {activeTab === 'dashboard' && (
        <div>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {[
              { label: 'Productos en Catálogo', value: products.length, icon: '🚲', color: '#3b82f6' },
              { label: 'Servicios Disponibles', value: services.length, icon: '🔧', color: '#8b5cf6' },
              { label: 'Órdenes Activas', value: orders.filter(o => o.status !== 'entregada').length, icon: '📋', color: '#f59e0b' },
              { label: 'Listas para Entregar', value: orders.filter(o => o.status === 'lista').length, icon: '✅', color: '#16a34a' },
              { label: 'Próximos Eventos', value: events.filter(e => new Date(e.date) >= new Date()).length, icon: '📅', color: '#ec4899' },
            ].map(k => (
              <div key={k.label} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderLeft: `4px solid ${k.color}` }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{k.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Órdenes listas para entrega */}
          {orders.filter(o => o.status === 'lista').length > 0 && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 14px', color: '#15803d', fontSize: '1rem', fontWeight: 700 }}>✅ Bicicletas listas para entregar al cliente</h3>
              {orders.filter(o => o.status === 'lista').map(o => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #dcfce7' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{o.bike_brand} {o.bike_model} · {formatDate(o.updated_at)}</div>
                  </div>
                  {o.customer_phone && <a href={`tel:${o.customer_phone}`} style={{ backgroundColor: '#16a34a', color: 'white', padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>📞 Llamar</a>}
                </div>
              ))}
            </div>
          )}

          {/* Resumen de órdenes por estado */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>Estado del Taller</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
              {Object.entries(ORDER_STATUS).map(([key, s]) => (
                <div key={key} style={{ textAlign: 'center', padding: '14px', backgroundColor: s.bg, borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{orders.filter(o => o.status === key).length}</div>
                  <div style={{ fontSize: '0.78rem', color: s.color, fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════ INVENTARIO ════════════ */}
      {activeTab === 'inventario' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Catálogo de Productos</h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>{products.length} productos registrados</p>
            </div>
            <button onClick={() => openProductModal()} style={btnPrimary}>+ Agregar Producto</button>
          </div>

          {/* Filtros por categoría */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {['all', ...CATEGORIES].map(c => (
              <button key={c} onClick={() => setCatFilter(c)} style={{ padding: '7px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', backgroundColor: catFilter === c ? '#2563eb' : '#f1f5f9', color: catFilter === c ? 'white' : '#475569' }}>
                {c === 'all' ? `Todos (${products.length})` : `${c} (${products.filter(p => p.category === c).length})`}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {products.filter(p => catFilter === 'all' || p.category === catFilter).map(p => (
              <div key={p.id} style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '80px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🚲</div>
                )}
                <div style={{ padding: '14px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>{p.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px', textTransform: 'capitalize' }}>{p.category}</div>
                  {p.description && <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '8px' }}>{p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}</div>}
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a', marginBottom: '12px' }}>{fmt(p.price)}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openProductModal(p)} style={{ flex: 1, padding: '8px', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>Editar</button>
                    <button onClick={() => { addToQuote(p, 'product'); }} style={{ flex: 1, padding: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>+ Cotizar</button>
                    <button onClick={() => handleDeleteProduct(p.id)} style={{ padding: '8px 10px', backgroundColor: '#fff1f2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════ SERVICIOS ════════════ */}
      {activeTab === 'servicios' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Servicios del Taller</h2>
            <button onClick={() => setServiceModalOpen(true)} style={btnPrimary}>+ Agregar Servicio</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {services.length === 0 && <p style={{ color: '#94a3b8' }}>No hay servicios registrados.</p>}
            {services.map(s => (
              <div key={s.id} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{s.name}</div>
                  {s.description && <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>{s.description}</div>}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a', whiteSpace: 'nowrap' }}>{fmt(s.price)}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => addToQuote(s, 'service')} style={{ padding: '8px 14px', backgroundColor: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>+ Cotizar</button>
                  <button onClick={() => handleDeleteService(s.id)} style={{ padding: '8px 10px', backgroundColor: '#fff1f2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════ ÓRDENES TALLER ════════════ */}
      {activeTab === 'ordenes' && (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>📋 Órdenes de Trabajo del Taller</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  {['Cliente', 'Bicicleta', 'Prioridad', 'Estado', 'Recibida', 'Teléfono'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No hay órdenes registradas.</td></tr>
                )}
                {orders.map(o => {
                  const st = ORDER_STATUS[o.status] || ORDER_STATUS.recibida;
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        <div>{o.customer_name}</div>
                        {o.problem_description && <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{o.problem_description.slice(0, 50)}...</div>}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569' }}>{[o.bike_brand, o.bike_model].filter(Boolean).join(' ') || '—'}</td>
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem' }}>{PRIORITY_LABELS[o.priority] || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ backgroundColor: st.bg, color: st.color, padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: '#64748b' }}>{formatDate(o.created_at)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {o.customer_phone ? (
                          <a href={`tel:${o.customer_phone}`} style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>
                            📞 {o.customer_phone}
                          </a>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════ EVENTOS ════════════ */}
      {activeTab === 'eventos' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Eventos de la Comunidad</h2>
            <button onClick={() => setEventModalOpen(true)} style={btnPrimary}>+ Crear Evento</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '16px' }}>
            {events.length === 0 && <p style={{ color: '#94a3b8' }}>No hay eventos registrados.</p>}
            {events.map(ev => {
              const isPast = new Date(ev.date) < new Date();
              return (
                <div key={ev.id} style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', opacity: isPast ? 0.65 : 1 }}>
                  {ev.image_url && <img src={ev.image_url} alt={ev.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />}
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>{isPast ? '🏁 Pasado' : '📅 Próximo'} · {new Date(ev.date).toLocaleDateString('es-CO')}</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>{ev.title}</div>
                    {ev.description && <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>{ev.description}</div>}
                    <button onClick={() => handleDeleteEvent(ev.id)} style={{ fontSize: '0.8rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>🗑 Eliminar</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════ COTIZADOR ════════════ */}
      {activeTab === 'cotizador' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
          {/* Selección */}
          <div>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.3rem', fontWeight: 700 }}>🧾 Cotizador Rápido</h2>
            <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.9rem' }}>Selecciona productos y servicios para armar una cotización.</p>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', color: '#475569' }}>Productos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
              {products.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '12px 16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: '8px', textTransform: 'capitalize' }}>{p.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 700, color: '#16a34a' }}>{fmt(p.price)}</span>
                    <button onClick={() => addToQuote(p, 'product')} style={{ padding: '6px 14px', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>+ Agregar</button>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', color: '#475569' }}>Servicios</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {services.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '12px 16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 700, color: '#16a34a' }}>{fmt(s.price)}</span>
                    <button onClick={() => addToQuote(s, 'service')} style={{ padding: '6px 14px', backgroundColor: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>+ Agregar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', position: 'sticky', top: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700 }}>Resumen de Cotización</h3>
            {quote.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px 0', fontSize: '0.9rem' }}>Agrega productos o servicios para comenzar.</p>
            ) : (
              <>
                {quote.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item._type === 'product' ? '🚲 Producto' : '🔧 Servicio'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="number" min={1} value={item._qty}
                        onChange={e => setQuote(q => q.map((x, j) => j === i ? { ...x, _qty: parseInt(e.target.value) || 1 } : x))}
                        style={{ width: '50px', padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: '4px', textAlign: 'center' }} />
                      <span style={{ fontWeight: 700, minWidth: '80px', textAlign: 'right' }}>{fmt(item.price * item._qty)}</span>
                      <button onClick={() => setQuote(q => q.filter((_, j) => j !== i))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: '12px' }}>
                  <textarea rows={2} value={quoteNote} onChange={e => setQuoteNote(e.target.value)} placeholder="Nota para el cliente (opcional)..." style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 12px', borderTop: '2px solid #e2e8f0', marginTop: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>TOTAL</span>
                  <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#16a34a' }}>{fmt(quoteTotal)}</span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={printQuote} style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }}>🖨️ Imprimir</button>
                  <button onClick={() => setQuote([])} style={{ flex: 1, padding: '10px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Limpiar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════ MODAL PRODUCTO ════════════ */}
      {productModalOpen && (
        <div style={overlay} onClick={e => { if (e.target === e.currentTarget) setProductModalOpen(false); }}>
          <div style={modal}>
            <h2 style={{ margin: '0 0 20px', fontSize: '1.2rem', fontWeight: 700 }}>{editingProduct ? '✏️ Editar Producto' : '➕ Agregar Producto'}</h2>
            {productError && <div style={errBox}>{productError}</div>}
            <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={flbl}>Nombre *</label><input required value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} style={finp} /></div>
              <div><label style={flbl}>Descripción</label><textarea rows={2} value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} style={{ ...finp, resize: 'vertical' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={flbl}>Precio (COP) *</label><input required type="number" min={1} value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} style={finp} /></div>
                <div><label style={flbl}>Categoría</label>
                  <select value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} style={finp}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={flbl}>Imagen del Producto</label>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={e => handleUpload(e, url => setProductForm(f => ({ ...f, image_url: url })))} disabled={uploading} />
                {uploading && <span style={{ color: '#16a34a', fontSize: '0.82rem' }}> Subiendo...</span>}
                {productForm.image_url && <img src={productForm.image_url} alt="preview" style={{ height: '80px', borderRadius: '6px', marginTop: '8px', objectFit: 'cover' }} />}
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <button type="button" onClick={() => setProductModalOpen(false)} style={btnSecondary}>Cancelar</button>
                <button type="submit" disabled={productSaving} style={btnPrimary}>{productSaving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════ MODAL SERVICIO ════════════ */}
      {serviceModalOpen && (
        <div style={overlay} onClick={e => { if (e.target === e.currentTarget) setServiceModalOpen(false); }}>
          <div style={modal}>
            <h2 style={{ margin: '0 0 20px', fontSize: '1.2rem', fontWeight: 700 }}>➕ Agregar Servicio</h2>
            {serviceError && <div style={errBox}>{serviceError}</div>}
            <form onSubmit={handleServiceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={flbl}>Nombre del Servicio *</label><input required value={serviceForm.name} onChange={e => setServiceForm(f => ({ ...f, name: e.target.value }))} style={finp} /></div>
              <div><label style={flbl}>Descripción</label><textarea rows={2} value={serviceForm.description} onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))} style={{ ...finp, resize: 'vertical' }} /></div>
              <div><label style={flbl}>Precio (COP)</label><input type="number" min={0} value={serviceForm.price} onChange={e => setServiceForm(f => ({ ...f, price: e.target.value }))} style={finp} /></div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setServiceModalOpen(false)} style={btnSecondary}>Cancelar</button>
                <button type="submit" disabled={serviceSaving} style={btnPrimary}>{serviceSaving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════ MODAL EVENTO ════════════ */}
      {eventModalOpen && (
        <div style={overlay} onClick={e => { if (e.target === e.currentTarget) setEventModalOpen(false); }}>
          <div style={modal}>
            <h2 style={{ margin: '0 0 20px', fontSize: '1.2rem', fontWeight: 700 }}>📅 Crear Evento</h2>
            {eventError && <div style={errBox}>{eventError}</div>}
            <form onSubmit={handleEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={flbl}>Título del Evento *</label><input required value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} style={finp} /></div>
              <div><label style={flbl}>Fecha *</label><input required type="date" value={eventForm.date} onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))} style={finp} /></div>
              <div><label style={flbl}>Descripción</label><textarea rows={3} value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} style={{ ...finp, resize: 'vertical' }} /></div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEventModalOpen(false)} style={btnSecondary}>Cancelar</button>
                <button type="submit" disabled={eventSaving} style={btnPrimary}>{eventSaving ? 'Guardando...' : 'Crear Evento'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Estilos compartidos ─────────────────────────────────── */
const btnPrimary  = { padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' };
const btnSecondary = { padding: '10px 20px', backgroundColor: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' };
const overlay = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: '20px' };
const modal   = { backgroundColor: 'white', padding: '28px', borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const errBox  = { backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.9rem' };
const flbl    = { display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem', color: '#374151' };
const finp    = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box' };
