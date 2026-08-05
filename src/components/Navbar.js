import Link from 'next/link';
import { useCart } from '../context/CartContext';
import Logo from './Logo';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { cartItems, openCart } = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      {/* Main Header */}
      <header className={styles.header}>
        <div className={`container ${styles.navContainer}`}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>Inicio</Link>
            <Link href="/tienda" className={styles.navLink}>Tienda</Link>
            <Link href="/servicios" className={styles.navLink}>Taller</Link>
            <Link href="/tienda?ofertas=true" className={`${styles.navLink} ${styles.ofertasLink}`}>Super Ofertas</Link>
            <button onClick={openCart} className={styles.navLink} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
              🛒 Carrito {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>
          </nav>
        </div>
      </header>
    </>
  );
}
