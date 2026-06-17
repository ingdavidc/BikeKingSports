'use client';

import { useState, useEffect, useCallback } from 'react';

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

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/* ─── Componente principal ────────────────────────────────── */
export default function MecanicoPanel() {
  const [orders, setOrders]         = useState([]);
  const [services, setServices]     = useState([]);
  const [inventory, setInventory]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('taller');   // taller | nueva | servicios | inventario
  const [selectedOrder, setSelectedOrder] = useState(null);  // para el drawer de detalle
  const [statusNote, setStatusNote] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Formulario nueva orden
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', bike_brand: '',
    bike_model: '', problem_description: '', priority: 'normal', estimated_price: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

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

  /* ─── Actualizar estado ───────────────────────────────── */
  const handleStatusChange = async (order, newStatus) => {
    setSavingStatus(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          payload: { id: order.id, status: newStatus, service_notes: statusNote || order.service_notes },
        }),
      });
      if (res.ok) {
        setSuccessMsg(`Orden de ${order.customer_name} → ${STATUS_MAP[newStatus]?.label}`);
        setTimeout(() => setSuccessMsg(''), 3000);
        setSelectedOrder(null);
        setStatusNote('');
        loadOrders();
      }
    } catch {}
    setSavingStatus(false);
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
        setForm({ customer_name: '', customer_phone: '', bike_brand: '', bike_model: '', problem_description: '', priority: 'normal', estimated_price: '' });
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
      <nav style={{ display: 'flex', backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
        {[
          { key: 'taller',      label: '🗂️ Taller',     count: orders.filter(o => o.status !== 'entregada').length },
          { key: 'nueva',       label: '➕ Nueva Orden', count: null },
          { key: 'servicios',   label: '🔩 Servicios',  count: null },
          { key: 'inventario',  label: '📦 Inventario', count: null },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            flex: 1, padding: '16px 8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
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
            <>
              {/* Resumen rápido */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {STATUSES.slice(0, 3).map(s => (
                  <div key={s.key} style={{ backgroundColor: '#1e293b', borderRadius: '10px', padding: '14px', textAlign: 'center', border: `1px solid ${s.color}33` }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{byStatus[s.key]?.length || 0}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Columnas kanban horizontales (scroll) en tablets */}
              <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '10px' }}>
                {STATUSES.filter(s => s.key !== 'entregada').map(statusDef => (
                  <div key={statusDef.key} style={{ minWidth: '300px', flex: '0 0 300px', backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${statusDef.color}44` }}>
                    {/* Cabecera columna */}
                    <div style={{ backgroundColor: statusDef.bg, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `2px solid ${statusDef.color}` }}>
                      <span style={{ fontSize: '1.2rem' }}>{statusDef.emoji}</span>
                      <span style={{ fontWeight: 700, color: statusDef.color, fontSize: '0.95rem' }}>{statusDef.label}</span>
                      <span style={{ marginLeft: 'auto', backgroundColor: statusDef.color + '33', color: statusDef.color, borderRadius: '10px', padding: '2px 8px', fontSize: '0.8rem', fontWeight: 700 }}>
                        {byStatus[statusDef.key]?.length || 0}
                      </span>
                    </div>

                    {/* Tarjetas */}
                    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                      {byStatus[statusDef.key]?.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#334155', fontSize: '0.85rem' }}>Sin órdenes</div>
                      )}
                      {byStatus[statusDef.key]?.map(order => {
                        const pri = PRIORITY_MAP[order.priority] || PRIORITY_MAP.normal;
                        return (
                          <button key={order.id} onClick={() => { setSelectedOrder(order); setStatusNote(order.service_notes || ''); }}
                            style={{ textAlign: 'left', width: '100%', backgroundColor: '#0f172a', border: `1px solid ${pri.color}44`, borderLeft: `4px solid ${pri.color}`, borderRadius: '8px', padding: '14px', cursor: 'pointer', transition: 'transform 0.1s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>{order.customer_name}</div>
                              <span style={{ fontSize: '0.75rem', color: pri.color, fontWeight: 700 }}>{pri.label}</span>
                            </div>
                            {order.customer_phone && (
                              <div style={{ fontSize: '0.82rem', color: '#38bdf8', marginBottom: '4px' }}>📞 {order.customer_phone}</div>
                            )}
                            {(order.bike_brand || order.bike_model) && (
                              <div style={{ fontSize: '0.82rem', color: '#7dd3fc', marginBottom: '6px' }}>🚲 {[order.bike_brand, order.bike_model].filter(Boolean).join(' ')}</div>
                            )}
                            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px', lineHeight: 1.4 }}>
                              {order.problem_description.length > 80
                                ? order.problem_description.slice(0, 80) + '...'
                                : order.problem_description}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#475569' }}>{formatDate(order.created_at)}</div>
                            {order.estimated_price > 0 && (
                              <div style={{ fontSize: '0.82rem', color: '#22c55e', fontWeight: 600, marginTop: '4px' }}>
                                💰 ${order.estimated_price.toLocaleString('es-CO')}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Columna Entregadas (compacta) */}
                <div style={{ minWidth: '220px', flex: '0 0 220px', backgroundColor: '#0f172a', borderRadius: '12px', overflow: 'hidden', border: '1px solid #33415588', opacity: 0.7 }}>
                  <div style={{ backgroundColor: '#1e293b', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #475569' }}>
                    <span>🏁</span>
                    <span style={{ fontWeight: 700, color: '#64748b', fontSize: '0.9rem' }}>Entregadas</span>
                    <span style={{ marginLeft: 'auto', color: '#475569', fontSize: '0.85rem' }}>{byStatus['entregada']?.length || 0}</span>
                  </div>
                  <div style={{ padding: '10px', color: '#475569', fontSize: '0.82rem' }}>
                    {byStatus['entregada']?.slice(0, 5).map(o => (
                      <div key={o.id} style={{ padding: '8px', borderBottom: '1px solid #1e293b' }}>
                        {o.customer_name} · {formatDate(o.updated_at)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─────────────── TAB: NUEVA ORDEN ─────────────────── */}
      {activeTab === 'nueva' && (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>➕ Registrar Orden de Trabajo</h2>
          <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9rem' }}>Ingresa los datos del cliente y la bicicleta a reparar.</p>

          {formError && (
            <div style={{ backgroundColor: '#450a0a', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Prioridad — táctil grande */}
            <div>
              <label style={lbl}>Prioridad</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {PRIORITIES.map(p => (
                  <button key={p.key} type="button" onClick={() => setForm(f => ({ ...f, priority: p.key }))}
                    style={{ flex: 1, padding: '16px 8px', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', border: `2px solid ${form.priority === p.key ? p.color : '#334155'}`, backgroundColor: form.priority === p.key ? p.color + '22' : '#1e293b', color: form.priority === p.key ? p.color : '#64748b', cursor: 'pointer' }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={lbl}>Nombre del Cliente *</label>
              <input required value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} style={inp} placeholder="Ej: Carlos Rodríguez" />
            </div>

            <div>
              <label style={lbl}>Teléfono del Cliente 📞</label>
              <input type="tel" value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} style={inp} placeholder="300 123 4567" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={lbl}>Marca de la Bici</label>
                <input value={form.bike_brand} onChange={e => setForm(f => ({ ...f, bike_brand: e.target.value }))} style={inp} placeholder="Trek, Ghost, GW..." />
              </div>
              <div>
                <label style={lbl}>Modelo</label>
                <input value={form.bike_model} onChange={e => setForm(f => ({ ...f, bike_model: e.target.value }))} style={inp} placeholder="Marlin 5, Riot..." />
              </div>
            </div>

            <div>
              <label style={lbl}>Problema / Trabajo a Realizar *</label>
              <textarea required rows={4} value={form.problem_description} onChange={e => setForm(f => ({ ...f, problem_description: e.target.value }))} style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} placeholder="Describe el problema. Ej: Frenos no responden, cadena suelta, cambios dañados..." />
            </div>

            <div>
              <label style={lbl}>Precio Estimado ($)</label>
              <input type="number" min="0" value={form.estimated_price} onChange={e => setForm(f => ({ ...f, estimated_price: e.target.value }))} style={inp} placeholder="0" />
            </div>

            <button type="submit" disabled={saving} style={{
              padding: '18px', backgroundColor: saving ? '#334155' : '#0284c7', color: 'white', border: 'none',
              borderRadius: '12px', fontWeight: 700, fontSize: '1.1rem', cursor: saving ? 'not-allowed' : 'pointer', marginTop: '8px',
            }}>
              {saving ? 'Guardando...' : '✅ Registrar Orden'}
            </button>
          </form>
        </div>
      )}

      {/* ─────────────── TAB: SERVICIOS ───────────────────── */}
      {activeTab === 'servicios' && (
        <div style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>🔩 Catálogo de Servicios</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {services.length === 0 && <p style={{ color: '#475569' }}>No hay servicios registrados aún.</p>}
            {services.map(s => (
              <div key={s.id} style={{ backgroundColor: '#1e293b', borderRadius: '10px', padding: '16px', border: '1px solid #334155' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>{s.name}</div>
                {s.description && <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '10px' }}>{s.description}</div>}
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22c55e' }}>${Number(s.price).toLocaleString('es-CO')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────── TAB: INVENTARIO ──────────────────── */}
      {activeTab === 'inventario' && (
        <div style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>📦 Inventario de Repuestos</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>Vista de consulta. Para modificar inventario, comunícate con el área de ventas.</p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {['bicicletas', 'repuestos', 'accesorios'].map(cat => (
              <span key={cat} style={{ backgroundColor: '#1e293b', color: '#94a3b8', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', textTransform: 'capitalize' }}>
                {cat}: {inventory.filter(p => p.category === cat).length}
              </span>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
            {inventory.length === 0 && <p style={{ color: '#475569' }}>Sin productos en inventario.</p>}
            {inventory.map(p => (
              <div key={p.id} style={{ backgroundColor: '#1e293b', borderRadius: '10px', overflow: 'hidden', border: '1px solid #334155' }}>
                {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />}
                <div style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{p.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '6px', textTransform: 'capitalize' }}>{p.category}</div>
                  <div style={{ fontWeight: 700, color: '#38bdf8' }}>${Number(p.price).toLocaleString('es-CO')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────── DRAWER: DETALLE DE ORDEN ─────────── */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedOrder(null); }}>
          <div style={{ backgroundColor: '#1e293b', width: '100%', maxHeight: '85vh', borderRadius: '20px 20px 0 0', padding: '24px', overflowY: 'auto' }}>
            {/* Handle */}
            <div style={{ width: '40px', height: '4px', backgroundColor: '#475569', borderRadius: '2px', margin: '0 auto 20px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>{selectedOrder.customer_name}</h3>
                {selectedOrder.customer_phone && (
                  <a href={`tel:${selectedOrder.customer_phone}`} style={{ color: '#38bdf8', fontSize: '0.95rem', textDecoration: 'none' }}>
                    📞 {selectedOrder.customer_phone}
                  </a>
                )}
              </div>
              <span style={{ backgroundColor: (PRIORITY_MAP[selectedOrder.priority]?.color || '#64748b') + '22', color: PRIORITY_MAP[selectedOrder.priority]?.color || '#64748b', padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem' }}>
                {PRIORITY_MAP[selectedOrder.priority]?.label}
              </span>
            </div>

            {(selectedOrder.bike_brand || selectedOrder.bike_model) && (
              <div style={{ backgroundColor: '#0f172a', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                <div style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '4px' }}>BICICLETA</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#7dd3fc' }}>
                  🚲 {[selectedOrder.bike_brand, selectedOrder.bike_model].filter(Boolean).join(' ')}
                </div>
              </div>
            )}

            <div style={{ backgroundColor: '#0f172a', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
              <div style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '4px' }}>PROBLEMA / TRABAJO</div>
              <div style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.5 }}>{selectedOrder.problem_description}</div>
            </div>

            {selectedOrder.estimated_price > 0 && (
              <div style={{ backgroundColor: '#052e16', borderRadius: '8px', padding: '12px', marginBottom: '16px', border: '1px solid #16a34a33' }}>
                <div style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '4px' }}>PRECIO ESTIMADO</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#22c55e' }}>${Number(selectedOrder.estimated_price).toLocaleString('es-CO')}</div>
              </div>
            )}

            {/* Nota del mecánico */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ ...lbl, color: '#94a3b8' }}>Nota de trabajo (opcional)</label>
              <textarea rows={2} value={statusNote} onChange={e => setStatusNote(e.target.value)}
                style={{ ...inp, minHeight: '70px', resize: 'none', fontSize: '0.9rem' }}
                placeholder="Ej: Requiere repuesto X, se revisó freno trasero..." />
            </div>

            {/* Botones de cambio de estado — táctiles grandes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {STATUSES.map(s => (
                <button key={s.key} onClick={() => handleStatusChange(selectedOrder, s.key)}
                  disabled={selectedOrder.status === s.key || savingStatus}
                  style={{
                    padding: '16px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: selectedOrder.status === s.key ? 'not-allowed' : 'pointer',
                    backgroundColor: selectedOrder.status === s.key ? s.color : '#0f172a',
                    color: selectedOrder.status === s.key ? 'white' : s.color,
                    border: `2px solid ${s.color}`,
                    opacity: selectedOrder.status === s.key ? 1 : 0.85,
                  }}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>

            <button onClick={() => setSelectedOrder(null)} style={{ width: '100%', marginTop: '16px', padding: '14px', backgroundColor: '#334155', color: '#94a3b8', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Estilos reutilizables ─────────────────────────────── */
const lbl = { display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' };
const inp = { width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: 'white', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' };
