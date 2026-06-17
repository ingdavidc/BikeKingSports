'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/* ─── Constantes ─────────────────────────────────────────── */
const STATUSES = [
  { key: 'recibida',   label: 'Recibida',      emoji: '📥', color: '#7c3aed', bg: '#1e1b4b' },
  { key: 'en_proceso', label: 'En Proceso',    emoji: '🔧', color: '#d97706', bg: '#1c1505' },
  { key: 'lista',      label: '¡Lista! ✅',    emoji: '✅', color: '#16a34a', bg: '#052e16' },
  { key: 'entregada',  label: 'Entregada',     emoji: '🏁', color: '#64748b', bg: '#0f172a' },
];

const PRIORITIES = [
  { key: 'urgente', label: '🔴 Urgente', color: '#ef4444' },
  { key: 'normal',  label: '🟡 Normal',  color: '#f59e0b' },
  { key: 'rutina',  label: '🟢 Rutina',  color: '#22c55e' },
];

const PRIORITY_MAP = Object.fromEntries(PRIORITIES.map(p => [p.key, p]));
const STATUS_MAP   = Object.fromEntries(STATUSES.map(s => [s.key, s]));

// Puntos del M-Check
const CHECKLIST_ITEMS = [
  { id: 'ruedas', label: 'Ruedas y Llantas (Presión, Desgaste)' },
  { id: 'frenos', label: 'Frenos (Pastillas, Tensión, Purgado)' },
  { id: 'transmision', label: 'Transmisión (Cadena, Lubricación)' },
  { id: 'direccion', label: 'Dirección y Rodamientos (Juego)' },
  { id: 'tornilleria', label: 'Tornillería general (Ajuste)' },
];

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Componente principal ────────────────────────────────── */
export default function MecanicoPanel() {
  const [orders, setOrders]         = useState([]);
  const [services, setServices]     = useState([]);
  const [inventory, setInventory]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('taller');   // taller | nueva | servicios | inventario | historial
  
  // Detalle de orden (Drawer)
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [checklist, setChecklist]   = useState({});
  const [photos, setPhotos]         = useState([]);
  const [savingStatus, setSavingStatus] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Formulario nueva orden
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', bike_brand: '',
    bike_model: '', bike_serial: '', problem_description: '', priority: 'normal', estimated_price: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Historial
  const [searchSerial, setSearchSerial] = useState('');
  const [historyData, setHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  /* ─── Fetch ───────────────────────────────────────────── */
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) setOrders(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  const loadServices = useCallback(async () => {
    const res = await fetch('/api/content?type=services');
    if (res.ok) setServices(await res.json());
  }, []);

  const loadInventory = useCallback(async () => {
    const res = await fetch('/api/content?type=products');
    if (res.ok) setInventory(await res.json());
  }, []);

  useEffect(() => {
    loadOrders();
    loadServices();
    loadInventory();
  }, [loadOrders, loadServices, loadInventory]);

  /* ─── Acciones Drawer ─────────────────────────────────── */
  const openDrawer = (order) => {
    setSelectedOrder(order);
    setStatusNote(order.service_notes || '');
    try {
      setChecklist(order.checklist ? JSON.parse(order.checklist) : {});
      setPhotos(order.photos ? JSON.parse(order.photos) : []);
    } catch {
      setChecklist({});
      setPhotos([]);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setSavingStatus(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          payload: { 
            id: selectedOrder.id, 
            status: newStatus, 
            service_notes: statusNote,
            checklist: checklist,
            photos: photos
          },
        }),
      });
      if (res.ok) {
        setSuccessMsg(`Orden actualizada → ${STATUS_MAP[newStatus]?.label}`);
        setTimeout(() => setSuccessMsg(''), 3000);
        setSelectedOrder(null);
        loadOrders();
      }
    } catch {}
    setSavingStatus(false);
  };

  // Subir foto al tocar recuadro (cámara)
  const handlePhotoUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        const newPhotos = [...photos];
        newPhotos[index] = data.url;
        setPhotos(newPhotos);
      } else {
        alert('Error al subir foto');
      }
    } catch {
      alert('Error de conexión');
    }
    setUploading(false);
  };

  /* ─── Crear orden ─────────────────────────────────────── */
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.customer_name.trim()) return setFormError('El nombre del cliente es obligatorio.');
    if (!form.problem_description.trim()) return setFormError('Describe el problema de la bici.');
    setSaving(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_order', payload: form }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('¡Orden creada correctamente!');
        setTimeout(() => setSuccessMsg(''), 3000);
        setForm({ customer_name: '', customer_phone: '', bike_brand: '', bike_model: '', bike_serial: '', problem_description: '', priority: 'normal', estimated_price: '' });
        setActiveTab('taller');
        loadOrders();
      } else {
        setFormError(data.error || 'Error al crear la orden.');
      }
    } catch {
      setFormError('Error de conexión.');
    }
    setSaving(false);
  };

  /* ─── Buscar Historial ────────────────────────────────── */
  const handleSearchHistory = async (e) => {
    e.preventDefault();
    if (!searchSerial.trim()) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/orders?serial=${encodeURIComponent(searchSerial.trim())}`);
      if (res.ok) setHistoryData(await res.json());
    } catch {}
    setLoadingHistory(false);
  };

  /* ─── Grupos por estado ───────────────────────────────── */
  const byStatus = {};
  STATUSES.forEach(s => { byStatus[s.key] = orders.filter(o => o.status === s.key); });

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ── Barra superior ── */}
      <header style={{ backgroundColor: '#1e293b', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>🔧</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#38bdf8' }}>Taller Bike King</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Panel del Mecánico</div>
          </div>
        </div>
        {successMsg && (
          <div style={{ backgroundColor: '#16a34a', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
            ✅ {successMsg}
          </div>
        )}
        <div style={{ fontSize: '0.82rem', color: '#475569' }}>
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </header>

      {/* ── Tabs de navegación (táctiles grandes) ── */}
      <nav style={{ display: 'flex', backgroundColor: '#1e293b', borderBottom: '1px solid #334155', overflowX: 'auto' }}>
        {[
          { key: 'taller',      label: '🗂️ Taller',     count: orders.filter(o => o.status !== 'entregada').length },
          { key: 'nueva',       label: '➕ Nueva',       count: null },
          { key: 'historial',   label: '📖 Historial',  count: null },
          { key: 'servicios',   label: '🔩 Servicios',  count: null },
          { key: 'inventario',  label: '📦 Inventario', count: null },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            flex: 1, padding: '16px 8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', minWidth: '100px',
            backgroundColor: activeTab === tab.key ? '#0f172a' : 'transparent',
            color: activeTab === tab.key ? '#38bdf8' : '#94a3b8',
            borderBottom: activeTab === tab.key ? '2px solid #38bdf8' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span style={{ marginLeft: '6px', backgroundColor: '#ef4444', color: 'white', borderRadius: '10px', padding: '2px 7px', fontSize: '0.72rem' }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* ─────────────── TAB: TALLER KANBAN ─────────────── */}
      {activeTab === 'taller' && (
        <div style={{ padding: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#475569', fontSize: '1.1rem' }}>
              Cargando órdenes...
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '10px' }}>
              {STATUSES.filter(s => s.key !== 'entregada').map(statusDef => (
                <div key={statusDef.key} style={{ minWidth: '300px', flex: '0 0 300px', backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${statusDef.color}44` }}>
                  <div style={{ backgroundColor: statusDef.bg, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `2px solid ${statusDef.color}` }}>
                    <span style={{ fontSize: '1.2rem' }}>{statusDef.emoji}</span>
                    <span style={{ fontWeight: 700, color: statusDef.color, fontSize: '0.95rem' }}>{statusDef.label}</span>
                    <span style={{ marginLeft: 'auto', backgroundColor: statusDef.color + '33', color: statusDef.color, borderRadius: '10px', padding: '2px 8px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {byStatus[statusDef.key]?.length || 0}
                    </span>
                  </div>

                  <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
                    {byStatus[statusDef.key]?.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#334155', fontSize: '0.85rem' }}>Sin órdenes</div>
                    )}
                    {byStatus[statusDef.key]?.map(order => {
                      const pri = PRIORITY_MAP[order.priority] || PRIORITY_MAP.normal;
                      return (
                        <button key={order.id} onClick={() => openDrawer(order)}
                          style={{ textAlign: 'left', width: '100%', backgroundColor: '#0f172a', border: `1px solid ${pri.color}44`, borderLeft: `4px solid ${pri.color}`, borderRadius: '8px', padding: '14px', cursor: 'pointer', transition: 'transform 0.1s' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>{order.customer_name}</div>
                            <span style={{ fontSize: '0.75rem', color: pri.color, fontWeight: 700 }}>{pri.label}</span>
                          </div>
                          {(order.bike_brand || order.bike_model) && (
                            <div style={{ fontSize: '0.82rem', color: '#7dd3fc', marginBottom: '6px' }}>🚲 {[order.bike_brand, order.bike_model].filter(Boolean).join(' ')} {order.bike_serial && `(#${order.bike_serial})`}</div>
                          )}
                          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px', lineHeight: 1.4 }}>
                            {order.problem_description.length > 80 ? order.problem_description.slice(0, 80) + '...' : order.problem_description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────── TAB: NUEVA ORDEN ─────────────────── */}
      {activeTab === 'nueva' && (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>➕ Registrar Orden</h2>
          
          {formError && <div style={{ backgroundColor: '#450a0a', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>{formError}</div>}

          <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={lbl}>Prioridad</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {PRIORITIES.map(p => (
                  <button key={p.key} type="button" onClick={() => setForm(f => ({ ...f, priority: p.key }))}
                    style={{ flex: 1, padding: '16px 8px', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', border: `2px solid ${form.priority === p.key ? p.color : '#334155'}`, backgroundColor: form.priority === p.key ? p.color + '22' : '#1e293b', color: form.priority === p.key ? p.color : '#64748b' }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div><label style={lbl}>Nombre del Cliente *</label><input required value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} style={inp} placeholder="Ej: Carlos Rodríguez" /></div>
            <div><label style={lbl}>Teléfono del Cliente 📞</label><input type="tel" value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} style={inp} placeholder="300 123 4567" /></div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={lbl}>Marca Bici</label><input value={form.bike_brand} onChange={e => setForm(f => ({ ...f, bike_brand: e.target.value }))} style={inp} placeholder="Trek, GW..." /></div>
              <div><label style={lbl}>Modelo</label><input value={form.bike_model} onChange={e => setForm(f => ({ ...f, bike_model: e.target.value }))} style={inp} placeholder="Marlin 5..." /></div>
            </div>
            
            <div><label style={lbl}>Serial Bici (Opcional - Hoja de vida)</label><input value={form.bike_serial} onChange={e => setForm(f => ({ ...f, bike_serial: e.target.value }))} style={inp} placeholder="Ej: WTU123456" /></div>
            
            <div><label style={lbl}>Problema / Trabajo *</label><textarea required rows={3} value={form.problem_description} onChange={e => setForm(f => ({ ...f, problem_description: e.target.value }))} style={{ ...inp, resize: 'vertical' }} /></div>
            <div><label style={lbl}>Precio Estimado ($)</label><input type="number" min="0" value={form.estimated_price} onChange={e => setForm(f => ({ ...f, estimated_price: e.target.value }))} style={inp} /></div>

            <button type="submit" disabled={saving} style={{ padding: '18px', backgroundColor: saving ? '#334155' : '#0284c7', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1.1rem', marginTop: '8px' }}>
              {saving ? 'Guardando...' : '✅ Registrar Orden'}
            </button>
          </form>
        </div>
      )}

      {/* ─────────────── TAB: HISTORIAL (HOJA DE VIDA) ────── */}
      {activeTab === 'historial' && (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>📖 Hoja de Vida de Bicicleta</h2>
          <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9rem' }}>Busca el historial de servicios por número de serial.</p>

          <form onSubmit={handleSearchHistory} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            <input value={searchSerial} onChange={e => setSearchSerial(e.target.value)} placeholder="Ej: WTU123456" style={{ ...inp, flex: 1 }} />
            <button type="submit" disabled={loadingHistory} style={{ padding: '0 20px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 700 }}>
              {loadingHistory ? '...' : '🔍 Buscar'}
            </button>
          </form>

          {historyData && (
            <div>
              {historyData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#1e293b', borderRadius: '12px', color: '#94a3b8' }}>
                  No se encontró historial para el serial <strong>{searchSerial}</strong>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ backgroundColor: '#0284c7', padding: '16px', borderRadius: '12px', color: 'white', marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Bicicleta encontrada</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{[historyData[0].bike_brand, historyData[0].bike_model].filter(Boolean).join(' ') || 'Bicicleta sin modelo'}</div>
                    <div style={{ fontSize: '0.9rem' }}>Serial: {historyData[0].bike_serial}</div>
                    <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>Último cliente: {historyData[0].customer_name}</div>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', color: '#cbd5e1' }}>Servicios Previos ({historyData.length})</h3>
                  {historyData.map((order, i) => (
                    <div key={order.id} style={{ backgroundColor: '#1e293b', borderRadius: '10px', padding: '16px', borderLeft: '4px solid #38bdf8', position: 'relative' }}>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>
                        📅 {formatDate(order.created_at)}
                      </div>
                      <div style={{ color: '#e2e8f0', marginBottom: '8px' }}>{order.problem_description}</div>
                      {order.service_notes && (
                        <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                          <strong>Mecánico:</strong> {order.service_notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────── TAB: SERVICIOS E INVENTARIO ──────── */}
      {activeTab === 'servicios' && (
        <div style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>🔩 Catálogo de Servicios</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {services.map(s => (
              <div key={s.id} style={{ backgroundColor: '#1e293b', borderRadius: '10px', padding: '16px', border: '1px solid #334155' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>{s.name}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22c55e' }}>${Number(s.price).toLocaleString('es-CO')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'inventario' && (
        <div style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>📦 Repuestos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
            {inventory.filter(p => p.category === 'repuestos').map(p => (
              <div key={p.id} style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontWeight: 700, color: '#38bdf8' }}>${Number(p.price).toLocaleString('es-CO')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────── DRAWER: DETALLE DE ORDEN ─────────── */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedOrder(null); }}>
          <div style={{ backgroundColor: '#1e293b', width: '100%', maxHeight: '90vh', borderRadius: '20px 20px 0 0', padding: '24px', overflowY: 'auto' }}>
            <div style={{ width: '40px', height: '4px', backgroundColor: '#475569', borderRadius: '2px', margin: '0 auto 20px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>{selectedOrder.customer_name}</h3>
                {selectedOrder.bike_brand && <div style={{ color: '#7dd3fc', fontSize: '0.9rem', marginTop: '4px' }}>🚲 {selectedOrder.bike_brand} {selectedOrder.bike_model}</div>}
                {selectedOrder.bike_serial && <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>SN: {selectedOrder.bike_serial}</div>}
              </div>
            </div>

            <div style={{ backgroundColor: '#0f172a', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.5 }}>{selectedOrder.problem_description}</div>
            </div>

            {/* ── CHECKLIST M-CHECK ── */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✅</span> Revisión Básica (M-Check)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {CHECKLIST_ITEMS.map(item => (
                  <button key={item.id} type="button" 
                    onClick={() => setChecklist(c => ({ ...c, [item.id]: !c[item.id] }))}
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', 
                      backgroundColor: checklist[item.id] ? '#052e16' : '#0f172a', 
                      border: `1px solid ${checklist[item.id] ? '#16a34a' : '#334155'}`, 
                      borderRadius: '8px', color: 'white', cursor: 'pointer', textAlign: 'left'
                    }}>
                    <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                    <span style={{ fontSize: '1.2rem', filter: checklist[item.id] ? 'none' : 'grayscale(1) opacity(0.3)' }}>✅</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── FOTOS ── */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📷</span> Fotos del Trabajo (Max 3)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[0, 1, 2].map(i => (
                  <label key={i} style={{ 
                    position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    height: '100px', backgroundColor: '#0f172a', border: '2px dashed #334155', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden'
                  }}>
                    {photos[i] ? (
                      <img src={photos[i]} alt="Evidencia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem', color: '#475569' }}>+</span>
                    )}
                    <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => handlePhotoUpload(e, i)} disabled={uploading} />
                  </label>
                ))}
              </div>
              {uploading && <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '6px', textAlign: 'center' }}>Subiendo foto...</div>}
            </div>

            {/* ── NOTA Y ESTADOS ── */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ ...lbl, color: '#94a3b8' }}>Nota de trabajo (Repuestos, observaciones)</label>
              <textarea rows={2} value={statusNote} onChange={e => setStatusNote(e.target.value)} style={{ ...inp, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {STATUSES.map(s => (
                <button key={s.key} onClick={() => handleStatusChange(s.key)} disabled={savingStatus}
                  style={{
                    padding: '16px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', border: `2px solid ${s.color}`,
                    backgroundColor: selectedOrder.status === s.key ? s.color : '#0f172a',
                    color: selectedOrder.status === s.key ? 'white' : s.color,
                  }}>
                  {s.emoji} {selectedOrder.status === s.key ? 'Actualizar ' + s.label : s.label}
                </button>
              ))}
            </div>

            <button onClick={() => setSelectedOrder(null)} style={{ width: '100%', marginTop: '16px', padding: '14px', backgroundColor: '#334155', color: '#94a3b8', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl = { display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase' };
const inp = { width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: 'white', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' };
