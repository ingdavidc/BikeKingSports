'use client';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import ProductQuickView from '../../components/ProductQuickView';
import styles from './page.module.css';

export default function Tienda() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('ofertas') === 'true') {
        setFilter('Ofertas');
      } else if (params.get('categoria')) {
        const catParam = params.get('categoria');
        // Find matching category case-insensitively
        const MAIN_CATEGORIES = ['Bicicletas', 'Componentes', 'Accesorios', 'Ropa', 'Gym'];
        const matched = MAIN_CATEGORIES.find(c => c.toLowerCase() === catParam.toLowerCase());
        if (matched) {
          setFilter(matched);
        }
      }
    }

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

  const MAIN_CATEGORIES = ['Bicicletas', 'Componentes', 'Accesorios', 'Ropa', 'Gym'];

  // Helper to map DB subcategories to the 5 main UI categories
  const mapToMainCategory = (dbCategory) => {
    if (!dbCategory) return 'Otros';
    const cat = dbCategory.toLowerCase();
    
    if (cat.includes('bici')) return 'Bicicletas';
    if (['transmisión', 'transmision', 'eje', 'sillin', 'sillín', 'manubrio', 'dirección', 'direccion', 'general', 'componente', 'repuesto'].some(k => cat.includes(k))) return 'Componentes';
    if (['accesorio', 'luz', 'casco', 'botella'].some(k => cat.includes(k))) return 'Accesorios';
    if (['ropa', 'jersey', 'zapatilla', 'guante'].some(k => cat.includes(k))) return 'Ropa';
    if (['gym', 'pesa', 'banda'].some(k => cat.includes(k))) return 'Gym';
    
    return dbCategory; // fallback
  };

  const categories = ['Todos', 'Ofertas', ...MAIN_CATEGORIES];

  const filteredProducts = filter === 'Todos' 
    ? products 
    : filter === 'Ofertas'
      ? products.filter(p => p.is_on_sale === 1)
      : products.filter(p => {
          const mainCat = mapToMainCategory(p.category);
          return mainCat === filter || p.category === filter;
        });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  };

  const handleWhatsAppRequest = (productName) => {
    const text = encodeURIComponent(`Hola BikeKing, quiero encargar el producto que está agotado: ${productName}`);
    const whatsappNumber = '573103291475';
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className={`container ${styles.tiendaContainer}`}>
      <h1 className={styles.title}>CATÁLOGO DE PRODUCTOS</h1>
      
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
            const isOutOfStock = (product.stock || 0) <= 0;

            return (
              <div 
                key={product.id} 
                className={styles.productCard} 
                onClick={() => setSelectedProduct(product)} 
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.imageContainer} style={{ position: 'relative' }}>
                  <img src={product.image_url || '/no-photo.jpg'} alt={product.name} className={styles.productImage} />
                  {product.is_on_sale === 1 && (
                    <span style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: '#e60000',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      zIndex: 10,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      ¡OFERTA!
                    </span>
                  )}
                  {isOutOfStock && (
                    <span style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: '#e60000',
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
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '15px' }}>
                    <p className={styles.price} style={{ marginBottom: 0 }}>{formatPrice(product.price)}</p>
                    {product.is_on_sale === 1 && product.old_price > 0 && (
                      <p style={{ color: '#94a3b8', fontSize: '0.95rem', textDecoration: 'line-through', margin: 0 }}>
                        {formatPrice(product.old_price)}
                      </p>
                    )}
                  </div>
                  
                  {isOutOfStock ? (
                    <button 
                      className="btn btn-secondary" 
                      style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#25D366', color: 'white', borderColor: '#25D366'}}
                      onClick={(e) => { e.stopPropagation(); handleWhatsAppRequest(product.name); }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
                      Solicitar Pedido
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      style={{width: '100%'}}
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }}
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
      {/* Quick View Modal */}
      {selectedProduct && (
        <ProductQuickView 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
