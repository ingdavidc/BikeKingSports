'use client';

import { useState, useEffect, useRef } from 'react';

export default function Servicios() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [newService, setNewService] = useState({
    name: '', description: '', price: '', video_url: ''
  });
  
  const fileInputRef = useRef(null);

  const loadServices = () => {
    fetch('/api/content?type=services')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadServices();
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
        setNewService(prev => ({ ...prev, video_url: data.url }));
        alert('Archivo multimedia subido exitosamente');
      } else {
        alert('Error al subir archivo: ' + (data.error || 'Desconocido'));
      }
    } catch (error) {
      alert('Error en el servidor al subir archivo');
    }
    setUploading(false);
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_service',
          payload: newService
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('¡Servicio agregado!');
        setNewService({ name: '', description: '', price: '', video_url: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadServices();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error al guardar el servicio');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_service', payload: { id } })
      });
      if (res.ok) {
        loadServices();
      }
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  if (loading) return <div>Cargando servicios...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Taller y Servicios</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Agrega servicios, mantenimientos y sube videos/fotos de los trabajos realizados.</p>
      
      {/* Formulario para agregar servicio */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Agregar Nuevo Servicio</h2>
        <form onSubmit={handleAddService} style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Nombre del Servicio</label>
            <input required type="text" value={newService.name} onChange={(e) => setNewService({...newService, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Descripción</label>
            <textarea value={newService.description} onChange={(e) => setNewService({...newService, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '80px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Precio ($)</label>
            <input required type="number" value={newService.price} onChange={(e) => setNewService({...newService, price: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Video o Foto del Trabajo</label>
            <input type="file" accept="video/*,image/*" onChange={handleFileChange} ref={fileInputRef} disabled={uploading} style={{ marginBottom: '10px' }} />
            {uploading && <span style={{ color: '#16a34a', marginLeft: '10px' }}>Subiendo multimedia...</span>}
            {newService.video_url && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ color: '#0284c7', fontSize: '0.9rem' }}>Archivo cargado listo para guardar.</p>
              </div>
            )}
          </div>
          <button type="submit" disabled={saving || uploading} style={{ backgroundColor: '#16a34a', color: 'white', padding: '12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
            Guardar Servicio
          </button>
        </form>
      </div>

      {/* Lista de servicios */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Servicios Actuales ({services.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {services.map(s => (
          <div key={s.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '20px', alignItems: 'center' }}>
            {s.video_url && (
              <div style={{ width: '150px', flexShrink: 0 }}>
                {s.video_url.match(/\.(mp4|webm)$/i) ? (
                  <video src={s.video_url} style={{ width: '100%', borderRadius: '4px' }} controls />
                ) : (
                  <img src={s.video_url} alt={s.name} style={{ width: '100%', borderRadius: '4px' }} />
                )}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>{s.name}</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '10px' }}>{s.description}</p>
              <p style={{ fontWeight: 'bold', color: '#1e293b' }}>${s.price}</p>
            </div>
            <button onClick={() => handleDelete(s.id)} style={{ backgroundColor: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', height: 'fit-content' }}>Eliminar</button>
          </div>
        ))}
        {services.length === 0 && <p>No hay servicios registrados.</p>}
      </div>
    </div>
  );
}
