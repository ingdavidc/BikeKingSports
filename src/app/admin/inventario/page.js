'use client';

import { useState, useEffect, useMemo } from 'react';
import ProductModal from '@/components/admin/ProductModal';
import ProviderModal from '@/components/admin/ProviderModal';
import InvoiceUploadModal from '@/components/admin/InvoiceUploadModal';

export default function InventarioPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null); // null means adding, object means editing
  
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';
        
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleEditClick = (item) => {
    setModalData(item);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalData(null);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (formData) => {
    const isEditing = !!formData.id;
    try {
      await fetch('/api/inventory', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProvider = async (formData) => {
    try {
      await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: formData.id ? 'update' : 'add', payload: formData }),
      });
      setIsProviderModalOpen(false);
      alert('Proveedor guardado exitosamente.');
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

  const handleTogglePublish = async (item) => {
    try {
      // Optimistic update
      setItems(prev => prev.map(p => p.id === item.id ? { ...p, is_published: !p.is_published } : p));
      
      const res = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'toggle_publish', 
          id: item.id, 
          is_published: !item.is_published 
        })
      });
      
      if (!res.ok) {
        // Revert on error
        setItems(prev => prev.map(p => p.id === item.id ? { ...p, is_published: item.is_published } : p));
        alert('Error al actualizar el estado del producto');
      }
    } catch (err) {
      console.error(err);
      setItems(prev => prev.map(p => p.id === item.id ? { ...p, is_published: item.is_published } : p));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a', margin: 0 }}>Gestión de Inventario</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '250px' }}
          />
          <button 
            onClick={() => setIsProviderModalOpen(true)}
            style={{ padding: '10px 16px', backgroundColor: 'white', color: '#005BBE', border: '1px solid #005BBE', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}
          >
            + Añadir Proveedor
          </button>
          <button 
            onClick={() => setIsInvoiceModalOpen(true)}
            style={{ padding: '10px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(16,185,129,0.2)' }}
          >
            📄 Cargar Factura (IA)
          </button>
          <button 
            onClick={handleAddClick}
            style={{ padding: '10px 16px', backgroundColor: '#005BBE', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0, 91, 190,0.2)', transition: 'background-color 0.2s' }}
          >
            + Añadir Producto
          </button>
        </div>
      </div>

      {isModalOpen && (
        <ProductModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveModal}
          initialData={modalData}
        />
      )}

      {isProviderModalOpen && (
        <ProviderModal 
          onClose={() => setIsProviderModalOpen(false)}
          onSave={handleSaveProvider}
        />
      )}

      {isInvoiceModalOpen && (
        <InvoiceUploadModal 
          onClose={() => setIsInvoiceModalOpen(false)}
          onComplete={() => {
            setIsInvoiceModalOpen(false);
            alert('Inventario actualizado masivamente con éxito.');
            fetchInventory();
          }}
        />
      )}

      {loading ? (
        <p style={{ color: '#475569' }}>Cargando inventario...</p>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th onClick={() => requestSort('sku')} style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                  CÓDIGO {sortConfig.key === 'sku' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => requestSort('name')} style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                  DESCRIPCIÓN {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => requestSort('stock')} style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                  STOCK {sortConfig.key === 'stock' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => requestSort('cost')} style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                  COSTO {sortConfig.key === 'cost' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => requestSort('price')} style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                  PRECIO (PVP) {sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => requestSort('provider_name')} style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                  PROVEEDOR {sortConfig.key === 'provider_name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => requestSort('is_published')} style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 600, cursor: 'pointer', userSelect: 'none', textAlign: 'center' }}>
                  WEB {sortConfig.key === 'is_published' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 600 }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                    {item.sku || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#0f172a' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: 'bold', color: item.stock <= (item.min_stock_limit || 3) ? '#ef4444' : '#10b981' }}>
                      {item.stock}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    ${(item.cost || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 'bold' }}>
                    ${item.price?.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569', fontSize: '0.9rem' }}>
                    {item.provider_name || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={item.is_published !== 0 && item.is_published !== false} 
                      onChange={() => handleTogglePublish(item)} 
                      style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#10b981' }}
                      title={item.is_published !== 0 && item.is_published !== false ? "Ocultar en la página web" : "Publicar en la página web"}
                    />
                  </td>
                  <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditClick(item)} style={{ padding: '6px 12px', backgroundColor: '#005BBE', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Editar</button>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 12px', backgroundColor: '#e5142b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
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
