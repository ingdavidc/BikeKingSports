import { useState } from 'react';
import { useCart } from '../context/CartContext';
import styles from './ProductQuickView.module.css';

export default function ProductQuickView({ product, onClose }) {
  const { addToCart, openCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

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
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className={styles.image} />
            ) : (
              <div className={styles.noImage}>??<br/><span>Sin imagen</span></div>
            )}
            {isOutOfStock && <span className={styles.badgeOut}>Agotado</span>}
          </div>
          
          <div className={styles.details}>
            <div className={styles.category}>{product.category}</div>
            <h2 className={styles.title}>{product.name}</h2>
            <div className={styles.price}>{formatPrice(product.price)}</div>
            
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
                <button 
                  className={`btn btn-primary ${styles.actionBtn}`} 
                  onClick={handleAddToCart}
                  disabled={isAdding}
                >
                  {isAdding ? 'Añadiendo...' : 'Añadir al Carrito'}
                </button>
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
