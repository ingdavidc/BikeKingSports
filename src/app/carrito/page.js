'use client';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import styles from './page.module.css';

export default function Carrito() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const WHATSAPP_NUMBER = '573103291475';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    let text = '*¡Hola Bike King!* 👋\nMe gustaría realizar el siguiente pedido:\n\n';
    
    cartItems.forEach((item, index) => {
      text += `*${index + 1}.* ${item.name} (x${item.quantity}) - ${formatPrice(item.price * item.quantity)}\n`;
    });

    text += `\n*Total estimado:* ${formatPrice(getCartTotal())}\n\n`;
    text += 'Quedo atento a la confirmación y medios de pago. ¡Gracias!';

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
    
    // Clear cart optionally after clicking, or let the user keep it until confirmed. 
    // Usually better to keep it until payment is confirmed by the vendor.
    window.open(whatsappUrl, '_blank');
  };

  if (cartItems.length === 0) {
    return (
      <div className={`container ${styles.emptyCart}`}>
        <h2>Tu carrito está vacío</h2>
        <p>Parece que aún no has agregado productos a tu carrito.</p>
        <Link href="/tienda" className="btn btn-primary" style={{marginTop: '20px'}}>
          Ir a la Tienda
        </Link>
      </div>
    );
  }

  const handleLayaway = () => {
    let message = `Hola BikeKing, me gustaría apartar (Plan Separe) los siguientes productos:\n\n`;
    cartItems.forEach(item => {
      message += `- ${item.name} (x${item.quantity}) - ${formatPrice(item.price * item.quantity)}\n`;
    });
    message += `\n*Total a Apartar: ${formatPrice(getCartTotal())}*\n\n¿Cuáles son los pasos para dar el abono inicial?`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '573103291475';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className={`container ${styles.cartContainer}`}>
      <h1 className={styles.title}>Carrito de Compras</h1>
      
      <div className={styles.cartLayout}>
        <div className={styles.cartItemsList}>
          {cartItems.map(item => (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.itemImageContainer}>
                <img src={item.image_url || item.image} alt={item.name} className={styles.itemImage} />
              </div>
              <div className={styles.itemDetails}>
                <h3 className={styles.itemName}>{item.name}</h3>
                <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                
                <div className={styles.quantityControl}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className={styles.qtyBtn}>-</button>
                  <span className={styles.qtyValue}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className={styles.qtyBtn}>+</button>
                </div>
              </div>
              <div className={styles.itemTotal}>
                <p>{formatPrice(item.price * item.quantity)}</p>
                <button onClick={() => removeFromCart(item.id)} className={styles.removeBtn}>
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
          
          <button onClick={clearCart} className={styles.clearBtn}>
            Vaciar Carrito
          </button>
        </div>

        <div className={styles.cartSummary}>
          <h2 className={styles.summaryTitle}>Resumen de Pedido</h2>
          
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatPrice(getCartTotal())}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Envío</span>
            <span>Por calcular</span>
          </div>
          
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Total Estimado</span>
            <span>{formatPrice(getCartTotal())}</span>
          </div>

          <button onClick={handleCheckout} className={`btn btn-primary ${styles.checkoutBtn}`}>
            Confirmar Pedido vía WhatsApp
          </button>
          
          <button onClick={handleLayaway} className={`btn btn-secondary ${styles.checkoutBtn}`} style={{ marginTop: '10px', backgroundColor: '#fff', color: '#0f172a', border: '2px solid #cbd5e1' }}>
            Apartar (Plan Separe)
          </button>
          <p className={styles.checkoutNote}>
            Serás redirigido a WhatsApp para finalizar tu compra directamente con nosotros.
          </p>
        </div>
      </div>
    </div>
  );
}
