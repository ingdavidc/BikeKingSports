'use client';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import Logo from './Logo';
import SmartSearch from './SmartSearch';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { cartItems, openCart } = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <div className={styles.topbar}>
        <div className={`container ${styles.topbarInner}`}>
          <div className={styles.topbarLeft}>
            <Link href="/nosotros" className={styles.topLink}>NOSOTROS</Link>
            <span className={styles.divider}>|</span>
            <Link href="/guia" className={styles.topLink}>GUÍA DEL CICLISTA</Link>
            <span className={styles.divider}>|</span>
            <Link href="/contacto" className={styles.topLink}>CONTACTO</Link>
          </div>
          <div className={styles.topbarRight}>
            <Link href="/tienda?ofertas=true" className={styles.ofertasBtn}>
              SUPER OFERTAS
            </Link>
            <span style={{marginRight: '10px', marginLeft: '15px', fontWeight: 'bold'}}>SÍGUENOS:</span>
            <a href="https://www.instagram.com/" target="_blank" className={styles.socialLink}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://www.facebook.com/" target="_blank" className={styles.socialLink}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>
        </div>
      </div>

      <nav className={styles.navbar}>
        <div className={`container ${styles.navInner}`}>
          <div className={styles.logoContainer}>
            <Logo />
          </div>

          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>INICIO</Link>
            <Link href="/tienda" className={styles.navLink}>TIENDA</Link>
            <Link href="/servicios" className={styles.navLink}>TALLER</Link>
          </div>

          <div className={styles.actions}>
            <div style={{width: '300px'}}>
              <SmartSearch />
            </div>

            <button className={styles.cartButton} onClick={openCart}>
              <div className={styles.cartIconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
              </div>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
