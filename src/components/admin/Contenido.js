'use client';

import { useState, useEffect } from 'react';

export default function ContenidoWeb() {
  const [settings, setSettings] = useState({
    home_hero_title: '',
    home_hero_subtitle: '',
    home_about_text: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/content?type=settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings(prev => ({ ...prev, ...data }));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key) => {
    setSaving(true);
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_setting',
          payload: { key, value: settings[key] }
        })
      });
      alert('¡Guardado exitosamente!');
    } catch (error) {
      alert('Error al guardar');
    }
    setSaving(false);
  };

  if (loading) return <div>Cargando datos del servidor...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Gestor de Contenido</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Modifica los textos principales de la página web en tiempo real.</p>
      
      <div style={{ backgroundColor: 'white', color: '#0f172a', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', color: '#0f172a', fontWeight: '700' }}>Página de Inicio (Home)</h2>
        
        {/* Título Principal */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Título Principal (Hero)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={settings.home_hero_title || ''}
              onChange={(e) => handleChange('home_hero_title', e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
            <button 
              onClick={() => handleSave('home_hero_title')}
              disabled={saving}
              style={{ backgroundColor: '#1964a6', color: 'white', padding: '0 20px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              Guardar
            </button>
          </div>
        </div>

        {/* Subtítulo */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Subtítulo</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={settings.home_hero_subtitle || ''}
              onChange={(e) => handleChange('home_hero_subtitle', e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
            <button 
              onClick={() => handleSave('home_hero_subtitle')}
              disabled={saving}
              style={{ backgroundColor: '#1964a6', color: 'white', padding: '0 20px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              Guardar
            </button>
          </div>
        </div>

        {/* Texto de Nosotros */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Texto "¿Quiénes Somos?"</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <textarea 
              value={settings.home_about_text || ''}
              onChange={(e) => handleChange('home_about_text', e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '100px', resize: 'vertical' }}
            />
            <button 
              onClick={() => handleSave('home_about_text')}
              disabled={saving}
              style={{ backgroundColor: '#1964a6', color: 'white', padding: '0 20px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
