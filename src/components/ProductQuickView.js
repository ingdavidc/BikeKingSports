import { useState } from 'react';
import { useCart } from '../context/CartContext';
import styles from './ProductQuickView.module.css';

export default function ProductQuickView({ product, onClose }) {
  const { addToCart, openCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const images = [];
  try {
    if (product.image_urls) {
      const parsed = JSON.parse(product.image_urls);
      if (Array.isArray(parsed) && parsed.length > 0) {
        images.push(...parsed);
      }
    }
  } catch(e) {}
  if (images.length === 0 && product.image_url) {
    images.push(product.image_url);
  }

  const isOutOfStock = (product.stock || 0) <= 0;

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product);
    setTimeout(() => {
      onClose();
      openCart();
    }, 300);
  };

  const handleWhatsAppRequest = () => {
    const text = encodeURIComponent(`Hola BikeKing, me interesa el producto que está agotado: ${product.name}`);
    const whatsappNumber = '573103291475';
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        
        <div className={styles.content}>
          <div className={styles.imageContainer}>
            {images.length > 0 ? (
              <>
                <img src={images[activeImgIndex]} alt={product.name} className={styles.image} />
                {images.length > 1 && (
                  <div className={styles.thumbnails}>
                    {images.map((img, idx) => (
                      <button 
                        key={idx} 
                        className={`${styles.thumbnailBtn} ${activeImgIndex === idx ? styles.active : ''}`}
                        onClick={(e) => { e.stopPropagation(); setActiveImgIndex(idx); }}
                      >
                        <img src={img} alt={`Thumbnail ${idx}`} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noImage}>📷<br/><span>Sin imagen</span></div>
            )}
            
            {product.is_on_sale === 1 && <span className={styles.badgeSale} style={{ backgroundColor: '#e60000', color: 'white', position: 'absolute', top: '10px', left: '10px', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>¡OFERTA!</span>}
            {isOutOfStock && <span className={styles.badgeOut} style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#e60000', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 10 }}>Agotado</span>}
          </div>
          
          <div className={styles.details}>
            <div className={styles.category}>{product.category}</div>
            <h2 className={styles.title}>{product.name}</h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '15px' }}>
              <div className={styles.price} style={{ marginBottom: 0 }}>{formatPrice(product.price)}</div>
              {product.is_on_sale === 1 && product.old_price > 0 && (
                <div style={{ color: '#94a3b8', fontSize: '1.2rem', textDecoration: 'line-through' }}>{formatPrice(product.old_price)}</div>
              )}
            </div>
            
            <div className={styles.descriptionBox}>
              <h4 className={styles.descTitle}>Descripción Detallada</h4>
              {product.description ? (
                <p className={styles.descText}>{product.description}</p>
              ) : (
                <p className={styles.descText} style={{ fontStyle: 'italic', color: '#94a3b8' }}>No hay descripción detallada disponible.</p>
              )}
            </div>

            <div className={styles.actions}>
              {!isOutOfStock ? (
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                  <button 
                    className={`btn btn-primary ${styles.actionBtn}`} 
                    onClick={handleAddToCart}
                    disabled={isAdding}
                  >
                    {isAdding ? 'Añadiendo...' : 'Añadir al Carrito'}
                  </button>
                  <button 
                    className={`btn btn-secondary ${styles.actionBtn}`} 
                    onClick={() => {
                      const text = encodeURIComponent(`Hola BikeKing, me gustaría apartar (Plan Separe) el producto: ${product.name} por ${formatPrice(product.price)}. ¿Cuáles son los pasos para dar el abono inicial?`);
                      window.open(`https://wa.me/573103291475?text=${text}`, '_blank');
                    }}
                    style={{ backgroundColor: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                  >
                    Apartar (Plan Separe)
                  </button>
                </div>
              ) : (
                <button 
                  className={`btn btn-secondary ${styles.actionBtn} ${styles.waBtn}`} 
                  onClick={handleWhatsAppRequest}
                >
                  Encargar por WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
