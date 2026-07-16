'use client';

import { useState, useEffect, useRef } from 'react';

export default function Inventario() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', category: 'bicicletas', image_url: ''
  });
  
  const fileInputRef = useRef(null);

  const loadProducts = () => {
    fetch('/api/content?type=products')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProducts();
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
        setNewProduct(prev => ({ ...prev, image_url: data.url }));
        alert('Imagen subida exitosamente');
      } else {
        alert('Error al subir imagen: ' + (data.error || 'Desconocido'));
      }
    } catch (error) {
      alert('Error en el servidor al subir imagen');
    }
    setUploading(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_product',
          payload: newProduct
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('¡Producto agregado!');
        setNewProduct({ name: '', description: '', price: '', category: 'bicicletas', image_url: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadProducts();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error al guardar el producto');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_product', payload: { id } })
      });
      if (res.ok) {
        loadProducts();
      }
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  if (loading) return <div>Cargando inventario...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Inventario de Tienda</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Agrega productos, sube fotos y gestiona la tienda.</p>
      
      {/* Formulario para agregar producto */}
      <div style={{ backgroundColor: 'white', color: '#0f172a', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#0f172a', fontWeight: '700' }}>Agregar Nuevo Producto</h2>
        <form onSubmit={handleAddProduct} style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Nombre</label>
            <input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Descripción</label>
            <textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '80px' }} />
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Precio ($)</label>
              <input required type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Categoría</label>
              <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                <option value="bicicletas">Bicicletas</option>
                <option value="repuestos">Repuestos</option>
                <option value="accesorios">Accesorios</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Foto del Producto (Se sube a la nube automáticamente)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} disabled={uploading} style={{ marginBottom: '10px' }} />
            {uploading && <span style={{ color: '#16a34a', marginLeft: '10px' }}>Subiendo imagen...</span>}
            {newProduct.image_url && (
              <div style={{ marginTop: '10px' }}>
                <img src={newProduct.image_url} alt="Vista previa" style={{ height: '100px', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
              </div>
            )}
          </div>
          <button type="submit" disabled={saving || uploading} style={{ backgroundColor: '#1964a6', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', boxShadow: '0 2px 4px rgba(25,100,166,0.2)', transition: 'background-color 0.2s' }}>
            Guardar Producto
          </button>
        </form>
      </div>

      {/* Lista de productos */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#0f172a', fontWeight: '700' }}>Productos Actuales ({products.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {products.map(p => (
          <div key={p.id} style={{ backgroundColor: 'white', color: '#0f172a', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} />}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '5px', color: '#0f172a', fontWeight: '600' }}>{p.name}</h3>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '10px' }}>{p.category} | ${p.price}</p>
            <button onClick={() => handleDelete(p.id)} style={{ backgroundColor: '#e5142b', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>Eliminar</button>
          </div>
        ))}
        {products.length === 0 && <p style={{ color: '#475569' }}>No hay productos registrados.</p>}
      </div>
    </div>
  );
}
