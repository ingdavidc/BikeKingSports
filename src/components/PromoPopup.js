'use client';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import styles from './PromoPopup.module.css';
import { useRouter } from 'next/navigation';

export default function PromoPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [promoProduct, setPromoProduct] = useState(null);
  const [popupSettings, setPopupSettings] = useState(null);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [promoRes, settingsRes] = await Promise.all([
          fetch('/api/store/products?promo=true'),
          fetch('/api/content?type=settings')
        ]);
        
        const promoData = await promoRes.json();
        const settingsData = await settingsRes.json();
        
        if (promoData.success && promoData.data) {
          setPromoProduct(promoData.data);
          
          if (settingsData && !settingsData.error) {
            setPopupSettings({
              badge: settingsData.popup_badge || '¡Producto Destacado!',
              title: settingsData.popup_title || 'Recomendación Especial',
              text: settingsData.popup_text || 'Lleva tu rendimiento al siguiente nivel con nuestro mejor producto disponible.'
            });
          } else {
            // Default settings if fetch fails
            setPopupSettings({
              badge: '¡Producto Destacado!',
              title: 'Recomendación Especial',
              text: 'Lleva tu rendimiento al siguiente nivel con nuestro mejor producto disponible.'
            });
          }
          
          // Show popup after 3 seconds of page load
          setTimeout(() => {
            setIsVisible(true);
          }, 3000);
        }
      } catch (err) {
        console.error("Error fetching promo data:", err);
      }
    };

    fetchData();
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

  const badge = popupSettings?.badge || '¡Producto Destacado!';
  const title = popupSettings?.title || 'Recomendación Especial';
  const text = popupSettings?.text || 'Lleva tu rendimiento al siguiente nivel con nuestro mejor producto disponible.';

  return (
    <div className={styles.popupOverlay} onClick={handleClose}>
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>&times;</button>
        
        <div className={styles.popupImageContainer}>
          <img 
            src={promoProduct.image_url || '/no-photo.jpg'} 
            alt={promoProduct.name} 
            className={styles.popupImage} 
          />
          <div className={styles.popupBadge}>{badge}</div>
        </div>
        
        <div className={styles.popupDetails}>
          <h2>{title}</h2>
          <h3>{promoProduct.name}</h3>
          <p className={styles.popupPrice}>{formatPrice(promoProduct.price)}</p>
          <p className={styles.popupDesc}>{text}</p>
          
          <button className={`btn btn-primary ${styles.popupButton}`} onClick={handleAddToCart}>
            Añadir al Carrito Ahora
          </button>
        </div>
      </div>
    </div>
  );
}
