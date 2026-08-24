'use client';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { isCartOpen, closeCart, cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div className={styles.overlay} onClick={closeCart}></div>
      )}

      {/* Drawer */}
      <div className={`${styles.drawer} ${isCartOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2>CARRITO</h2>
          <button className={styles.closeBtn} onClick={closeCart}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className={styles.content}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>Tu carrito está vacío.</p>
              <button className={styles.continueBtn} onClick={closeCart}>
                Seguir Comprando
              </button>
            </div>
          ) : (
            <div className={styles.itemsList}>
              {cartItems.map(item => (
                <div key={item.id} className={styles.cartItem}>
                  <img src={item.image_url || item.image || '/no-photo.jpg'} alt={item.name} className={styles.itemImage} />
                  
                  <div className={styles.itemDetails}>
                    <h4 className={styles.itemName}>{item.name.toUpperCase()}</h4>
                    <p className={styles.itemCategory}>{item.category || 'BIKEKING'}</p>
                    <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                    
                    <div className={styles.controlsRow}>
                      <button onClick={() => removeFromCart(item.id)} className={styles.deleteBtn} title="Eliminar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                      </button>
                      
                      <div className={styles.quantityBox}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Subtotal:</span>
              <span className={styles.totalPrice}>{formatPrice(getCartTotal())}</span>
            </div>
            
            <Link href="/carrito" onClick={closeCart} className={styles.viewCartBtn}>
              VER CARRITO
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
