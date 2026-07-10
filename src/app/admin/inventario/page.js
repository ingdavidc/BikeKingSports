'use client';

import { useState, useEffect } from 'react';

export default function InventarioPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory?q=${search}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, [search]);

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async (id) => {
    try {
      await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      setEditingId(null);
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este producto del inventario?')) return;
    try {
      await fetch(`/api/inventory?id=${id}`, { method: 'DELETE' });
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a', margin: 0 }}>Gestión de Inventario</h1>
        <div>
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '250px', marginRight: '10px' }}
          />
        </div>
      </div>

      {loading ? (
        <p>Cargando inventario...</p>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>CÓDIGO</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>DESCRIPCIÓN</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>STOCK</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>PRECIO (VR UNIT)</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                    {editingId === item.id ? (
                      <input 
                        value={editForm.sku} 
                        onChange={e => setEditForm({...editForm, sku: e.target.value})} 
                        style={{ width: '80px', padding: '4px' }}
                      />
                    ) : (item.sku || '-')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {editingId === item.id ? (
                      <input 
                        value={editForm.name} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        style={{ width: '100%', padding: '4px' }}
                      />
                    ) : item.name}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {editingId === item.id ? (
                      <input 
                        type="number" 
                        value={editForm.stock} 
                        onChange={e => setEditForm({...editForm, stock: parseInt(e.target.value)})}
                        style={{ width: '60px', padding: '4px' }}
                      />
                    ) : (
                      <span style={{ fontWeight: 'bold', color: item.stock <= 3 ? '#ef4444' : '#10b981' }}>
                        {item.stock}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {editingId === item.id ? (
                      <input 
                        type="number" 
                        value={editForm.price} 
                        onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                        style={{ width: '80px', padding: '4px' }}
                      />
                    ) : `$${item.price.toLocaleString()}`}
                  </td>
                  <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                    {editingId === item.id ? (
                      <>
                        <button onClick={() => handleSave(item.id)} style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Guardar</button>
                        <button onClick={() => setEditingId(null)} style={{ padding: '6px 12px', backgroundColor: '#cbd5e1', color: '#334155', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(item)} style={{ padding: '6px 12px', backgroundColor: '#38bdf8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                        <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                    No hay productos en el inventario.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
