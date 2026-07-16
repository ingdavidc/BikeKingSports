'use client';

import { useState, useEffect, useRef } from 'react';

export default function Eventos() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '', date: '', description: '', image_url: ''
  });
  
  const fileInputRef = useRef(null);

  const loadEvents = () => {
    fetch('/api/content?type=events')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setNewEvent(prev => ({ ...prev, image_url: data.url }));
        alert('Imagen subida exitosamente');
      } else {
        alert('Error al subir imagen: ' + (data.error || 'Desconocido'));
      }
    } catch (error) {
      alert('Error en el servidor al subir imagen');
    }
    setUploading(false);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_event',
          payload: newEvent
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('¡Evento agregado!');
        setNewEvent({ title: '', date: '', description: '', image_url: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadEvents();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error al guardar el evento');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_event', payload: { id } })
      });
      if (res.ok) {
        loadEvents();
      }
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  if (loading) return <div>Cargando eventos...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Eventos y Rodadas</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Agrega nuevos eventos, paseos, y rodadas para que tus clientes participen.</p>
      
      {/* Formulario para agregar evento */}
      <div style={{ backgroundColor: 'white', color: '#0f172a', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#0f172a', fontWeight: '700' }}>Agregar Nuevo Evento</h2>
        <form onSubmit={handleAddEvent} style={{ display: 'grid', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Título del Evento</label>
              <input required type="text" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Fecha</label>
              <input required type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Descripción / Detalles</label>
            <textarea value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '80px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Póster del Evento (Foto)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} disabled={uploading} style={{ marginBottom: '10px' }} />
            {uploading && <span style={{ color: '#16a34a', marginLeft: '10px' }}>Subiendo imagen...</span>}
            {newEvent.image_url && (
              <div style={{ marginTop: '10px' }}>
                <img src={newEvent.image_url} alt="Vista previa" style={{ height: '100px', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
              </div>
            )}
          </div>
          <button type="submit" disabled={saving || uploading} style={{ backgroundColor: '#1964a6', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', boxShadow: '0 2px 4px rgba(25,100,166,0.2)', transition: 'background-color 0.2s' }}>
            Guardar Evento
          </button>
        </form>
      </div>

      {/* Lista de eventos */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#0f172a', fontWeight: '700' }}>Próximos Eventos ({events.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {events.map(e => (
          <div key={e.id} style={{ backgroundColor: 'white', color: '#0f172a', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            {e.image_url && <img src={e.image_url} alt={e.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} />}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '5px', color: '#0f172a', fontWeight: '600' }}>{e.title}</h3>
            <p style={{ color: '#0284c7', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '10px' }}>📅 {e.date}</p>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '15px' }}>{e.description}</p>
            <button onClick={() => handleDelete(e.id)} style={{ backgroundColor: '#e5142b', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>Eliminar</button>
          </div>
        ))}
        {events.length === 0 && <p style={{ color: '#475569' }}>No hay eventos registrados.</p>}
      </div>
    </div>
  );
}
