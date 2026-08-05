'use client';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import styles from './PromoPopup.module.css';
import { useRouter } from 'next/navigation';

export default function PromoPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [promoProduct, setPromoProduct] = useState(null);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const res = await fetch('/api/store/products?promo=true');
        const data = await res.json();
        if (data.success && data.data) {
          setPromoProduct(data.data);
          
          // Show popup after 3 seconds of page load
          setTimeout(() => {
            setIsVisible(true);
          }, 3000);
        }
      } catch (err) {
        console.error("Error fetching promo:", err);
      }
    };

    fetchPromo();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleAddToCart = () => {
    if (promoProduct) {
      addToCart(promoProduct);
      handleClose();
      router.push('/carrito');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  };

  if (!isVisible || !promoProduct) return null;

  return (
    <div className={styles.popupOverlay} onClick={handleClose}>
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>&times;</button>
        
        <div className={styles.popupImageContainer}>
          <img 
            src={promoProduct.image_url || 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'} 
            alt={promoProduct.name} 
            className={styles.popupImage} 
          />
          <div className={styles.popupBadge}>¡Producto Destacado!</div>
        </div>
        
        <div className={styles.popupDetails}>
          <h2>Recomendación Especial</h2>
          <h3>{promoProduct.name}</h3>
          <p className={styles.popupPrice}>{formatPrice(promoProduct.price)}</p>
          <p className={styles.popupDesc}>Lleva tu rendimiento al siguiente nivel con nuestro mejor producto disponible.</p>
          
          <button className={`btn btn-primary ${styles.popupButton}`} onClick={handleAddToCart}>
            Añadir al Carrito Ahora
          </button>
        </div>
      </div>
    </div>
  );
}
