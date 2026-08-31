'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, UserPlus, FileEdit, UserCircle } from 'lucide-react';

export default function ClientesPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!search) return customers;
    const s = search.toLowerCase();
    return customers.filter(c => 
      (c.name && c.name.toLowerCase().includes(s)) || 
      (c.document && c.document.toLowerCase().includes(s)) ||
      (c.phone && c.phone.toLowerCase().includes(s))
    );
  }, [customers, search]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a' }}>Clientes Registrados</h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Gestiona los clientes que han comprado en la tienda o taller.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div style={{ flex: '1', position: 'relative' }}>
          <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, documento o teléfono..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
          />
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Cargando clientes...</div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No se encontraron clientes.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '15px 20px', color: '#475569', fontWeight: '600' }}>Documento</th>
                <th style={{ padding: '15px 20px', color: '#475569', fontWeight: '600' }}>Nombre</th>
                <th style={{ padding: '15px 20px', color: '#475569', fontWeight: '600' }}>Teléfono</th>
                <th style={{ padding: '15px 20px', color: '#475569', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '15px 20px', color: '#475569', fontWeight: '600' }}>Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '15px 20px', fontWeight: '500', color: '#0f172a' }}>{c.document}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserCircle size={18} color="#94a3b8" />
                      {c.name || 'Sin nombre'}
                    </div>
                  </td>
                  <td style={{ padding: '15px 20px' }}>{c.phone || '-'}</td>
                  <td style={{ padding: '15px 20px', color: '#3b82f6' }}>{c.email || '-'}</td>
                  <td style={{ padding: '15px 20px', color: '#64748b', fontSize: '0.9rem' }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('es-CO') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
