'use client';

import { useState } from 'react';
import Contenido from '@/components/admin/Contenido';
import Inventario from '@/components/admin/Inventario';
import Servicios from '@/components/admin/Servicios';
import Eventos from '@/components/admin/Eventos';

export default function AdministracionWeb() {
  const [activeTab, setActiveTab] = useState('contenido');

  const tabs = [
    { id: 'contenido', label: '📝 Gestor de Contenido' },
    { id: 'inventario', label: '🚲 Inventario & Tienda' },
    { id: 'servicios', label: '🔧 Taller & Servicios' },
    { id: 'eventos', label: '📅 Eventos & Galería' }
  ];

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Administración Web</h1>
      
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === tab.id ? '#1e293b' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#475569',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '500px' }}>
        {activeTab === 'contenido' && <Contenido />}
        {activeTab === 'inventario' && <Inventario />}
        {activeTab === 'servicios' && <Servicios />}
        {activeTab === 'eventos' && <Eventos />}
      </div>
    </div>
  );
}
