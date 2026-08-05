'use client';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import styles from './page.module.css';

export default function Tienda() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/store/products');
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['Todos', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = filter === 'Todos' 
    ? products 
    : products.filter(p => p.category === filter);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  };

  const handleWhatsAppRequest = (productName) => {
    const text = encodeURIComponent(`Hola BikeKing, quiero encargar el producto que está agotado: ${productName}`);
    // Temporary test number as per user instruction
    const whatsappNumber = '573000000000';
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className={`container ${styles.tiendaContainer}`}>
      <h1 className={styles.title}>Catálogo de Productos</h1>
      
      <div className={styles.filters}>
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`${styles.filterBtn} ${filter === cat ? styles.active : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Cargando catálogo...</div>
      ) : (
        <div className={styles.productGrid}>
          {filteredProducts.map(product => {
            const isOutOfStock = (product.stock || 0) <= (product.min_stock_limit || 0);

            return (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.imageContainer}>
                  <img src={product.image_url || 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'} alt={product.name} className={styles.productImage} />
                  {isOutOfStock && (
                    <span style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      zIndex: 10
                    }}>
                      Agotado
                    </span>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.category}>{product.category}</span>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.price}>{formatPrice(product.price)}</p>
                  
                  {isOutOfStock ? (
                    <button 
                      className="btn btn-secondary" 
                      style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#25D366', color: 'white', borderColor: '#25D366'}}
                      onClick={() => handleWhatsAppRequest(product.name)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
                      Solicitar Pedido
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      style={{width: '100%'}}
                      onClick={() => addToCart(product)}
                    >
                      Agregar al Carrito
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!loading && filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
          No hay productos disponibles en esta categoría.
        </div>
      )}
    </div>
  );
}
