'use client';

import { useState, useEffect } from 'react';

export default function ContenidoWeb() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    fetch('/api/content?type=settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings(data);
        }
        setLoading(false);
      });
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key) => {
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_setting',
          payload: { key, value: settings[key] }
        })
      });
    } catch (error) {
      alert('Error al guardar');
    }
    setSaving(prev => ({ ...prev, [key]: false }));
  };

  if (loading) return <div>Cargando...</div>;

  const InputField = ({ label, id, isTextarea }) => (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>{label}</label>
      <div style={{ display: 'flex', gap: '10px' }}>
        {isTextarea ? (
          <textarea
            value={settings[id] || ''}
            onChange={(e) => handleChange(id, e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '80px' }}
          />
        ) : (
          <input
            type="text"
            value={settings[id] || ''}
            onChange={(e) => handleChange(id, e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        )}
        <button
          onClick={() => handleSave(id)}
          disabled={saving[id]}
          style={{ backgroundColor: '#1964a6', color: 'white', padding: '0 20px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
        >
          {saving[id] ? '...' : 'Guardar'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '25px', color: '#0f172a' }}>Gestor de Contenido</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        <div>
          <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>Inicio</h3>
          <InputField label="Título Principal (Hero)" id="home_hero_title" />
          <InputField label="Subtítulo Principal" id="home_hero_subtitle" />
          <InputField label="Texto Nosotros (Inicio)" id="home_about_text" isTextarea={true} />
          <InputField label="Etiqueta Oferta (Ej: ¡OFERTA ESTELAR!)" id="popup_badge" />
          <InputField label="Título Oferta" id="popup_title" />
          <InputField label="Texto Oferta" id="popup_text" isTextarea={true} />
        </div>

        <div>
          <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>Nosotros</h3>
          <InputField label="Título Hero" id="about_hero_title" />
          <InputField label="Subtítulo Hero" id="about_hero_subtitle" />
          <InputField label="Título Sección" id="about_title" />
          <InputField label="Párrafo 1" id="about_p1" isTextarea={true} />
          <InputField label="Párrafo 2" id="about_p2" isTextarea={true} />
          <InputField label="URL de Imagen" id="about_image_url" />
          <InputField label="Misión" id="about_mission" isTextarea={true} />
          <InputField label="Visión" id="about_vision" isTextarea={true} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>Contacto & Footer</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <InputField label="Dirección Física" id="contact_address" />
            <InputField label="Teléfono / WhatsApp" id="contact_phone" />
            <InputField label="Correo Electrónico" id="contact_email" />
            <InputField label="Horario Lunes-Viernes" id="contact_hours_week" />
            <InputField label="Horario Sábados" id="contact_hours_sat" />
            <InputField label="Horario Domingos/Festivos" id="contact_hours_sun" />
          </div>
        </div>

      </div>
    </div>
  );
}
