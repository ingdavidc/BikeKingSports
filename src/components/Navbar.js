import Link from 'next/link';
import { useCart } from '../context/CartContext';
import Logo from './Logo';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { cartItems } = useCart();
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
            <Link href="/carrito" className={styles.navLink}>
              🛒 Carrito {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
