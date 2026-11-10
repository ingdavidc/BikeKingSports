'use client';

import { useState, useEffect } from 'react';

export default function ContenidoWeb() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [togglingChristmas, setTogglingChristmas] = useState(false);

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

  const handleSave = async (key, directValue = null) => {
    setSaving(prev => ({ ...prev, [key]: true }));
    const valueToSave = directValue !== null ? directValue : (settings[key] || '');
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_setting',
          payload: { key, value: valueToSave }
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || 'Error al guardar');
      }
    } catch (error) {
      alert('Error de conexión al guardar');
    }
    setSaving(prev => ({ ...prev, [key]: false }));
  };

  // Christmas Mode Toggle: Enabled by default unless explicitly set to '0' or 'false'
  const isChristmasActive = settings.christmas_mode !== '0' && settings.christmas_mode !== 'false';

  const handleToggleChristmas = async () => {
    setTogglingChristmas(true);
    const nextVal = isChristmasActive ? '0' : '1';
    setSettings(prev => ({ ...prev, christmas_mode: nextVal }));

    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_setting',
          payload: { key: 'christmas_mode', value: nextVal }
        })
      });
    } catch (err) {
      alert('Error al actualizar modo navideño');
    }
    setTogglingChristmas(false);
  };

  if (loading) return <div>Cargando configuración...</div>;

  const InputField = ({ label, id, isTextarea, placeholder = '' }) => (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>{label}</label>
      <div style={{ display: 'flex', gap: '10px' }}>
        {isTextarea ? (
          <textarea
            value={settings[id] || ''}
            placeholder={placeholder}
            onChange={(e) => handleChange(id, e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '80px' }}
          />
        ) : (
          <input
            type="text"
            value={settings[id] || ''}
            placeholder={placeholder}
            onChange={(e) => handleChange(id, e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        )}
        <button
          onClick={() => handleSave(id)}
          disabled={saving[id]}
          style={{ backgroundColor: '#005BBE', color: 'white', padding: '0 20px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
        >
          {saving[id] ? '...' : 'Guardar'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '25px', color: '#0f172a' }}>Gestor de Contenido</h2>

      {/* ─── CONTROL ESPECIAL: TEMPORADA NAVIDEÑA ─── */}
      <div style={{
        marginBottom: '35px',
        padding: '24px',
        borderRadius: '12px',
        background: isChristmasActive 
          ? 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 50%, #f0fdf4 100%)' 
          : '#f8fafc',
        border: isChristmasActive ? '2px solid #ef4444' : '2px solid #cbd5e1',
        boxShadow: isChristmasActive ? '0 4px 16px rgba(239, 68, 68, 0.15)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.8rem' }}>{isChristmasActive ? '🎄' : '⚪'}</span>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>
                Temporada Navideña (Tema de Navidad)
              </h3>
              <span style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                backgroundColor: isChristmasActive ? '#16a34a' : '#64748b',
                color: 'white',
              }}>
                {isChristmasActive ? '🎅 ACTIVADO' : 'DESACTIVADO (MODO NORMAL)'}
              </span>
            </div>
            <p style={{ margin: '8px 0 0 0', color: '#475569', fontSize: '0.95rem', maxWidth: '700px' }}>
              {isChristmasActive 
                ? 'El tema navideño está activo en la página principal (efecto suave de nieve, luces festivas, gorro de Santa sobre el logo, guía de regalos y mensajes especiales). Al terminar la temporada navideña, haz clic en el botón para volver al modo normal.'
                : 'La página principal se encuentra en su diseño estándar de todo el año, sin efectos navideños ni nieve. Puedes reactivarlo en cualquier momento con un solo clic.'}
            </p>
          </div>

          <button
            onClick={handleToggleChristmas}
            disabled={togglingChristmas}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: isChristmasActive ? '#dc2626' : '#16a34a',
              color: 'white',
              boxShadow: isChristmasActive 
                ? '0 4px 12px rgba(220, 38, 38, 0.3)' 
                : '0 4px 12px rgba(22, 163, 74, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {togglingChristmas 
              ? 'Actualizando...' 
              : isChristmasActive 
                ? '🛑 Desactivar Tema Navideño' 
                : '🎄 Activar Tema Navideño'}
          </button>
        </div>

        {/* Customization fields for the Christmas Banner */}
        {isChristmasActive && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#0f172a' }}>
              Personalizar Mensajes del Banner Navideño (Opcional):
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <InputField 
                label="Título del Banner Navideño" 
                id="christmas_banner_title" 
                placeholder="¡Llegó la Navidad a BikeKing! El Mejor Regalo Rueda Sobre 2 Ruedas"
              />
              <InputField 
                label="Descripción del Banner Navideño" 
                id="christmas_banner_desc" 
                placeholder="Aprovecha ofertas exclusivas de fin de año en bicicletas, componentes y accesorios."
              />
            </div>
          </div>
        )}
      </div>
      
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
