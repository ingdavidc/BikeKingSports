'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Logo from './Logo';
import SmartSearch from './SmartSearch';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { cartItems, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className={styles.header}>
      {/* Top Bar (Desktop) */}
      <div className={styles.topbar}>
        <div className={`container ${styles.topbarContainer}`}>
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
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Area */}
      <div className={styles.mainHeader}>
        <div className={`container ${styles.mainHeaderContainer}`}>
          <Link href="/" className={styles.logoLink} onClick={() => setMobileMenuOpen(false)}>
            <Logo />
          </Link>
          
          <div className={styles.searchContainer}>
            <SmartSearch />
          </div>

          <div className={styles.headerActions}>
            <div className={styles.cartContainer}>
              <button onClick={openCart} className={styles.cartBtn} aria-label="Abrir carrito">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
              </button>
            </div>

            <button
              type="button"
              className={styles.menuToggleBtn}
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <Link href="/" className={styles.mobileDrawerLink} onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
          <Link href="/tienda" className={styles.mobileDrawerLink} onClick={() => setMobileMenuOpen(false)}>Tienda</Link>
          <Link href="/tienda?ofertas=true" className={`${styles.mobileDrawerLink} ${styles.mobileDrawerOffer}`} onClick={() => setMobileMenuOpen(false)}>🔥 Super Ofertas</Link>
          <Link href="/servicios" className={styles.mobileDrawerLink} onClick={() => setMobileMenuOpen(false)}>Taller y Servicios</Link>
          <Link href="/nosotros" className={styles.mobileDrawerLink} onClick={() => setMobileMenuOpen(false)}>Nosotros</Link>
          <Link href="/contacto" className={styles.mobileDrawerLink} onClick={() => setMobileMenuOpen(false)}>Contacto</Link>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className={styles.navBar}>
        <div className={`container ${styles.navMenu}`}>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>INICIO</Link>
            <Link href="/tienda" className={styles.navLink}>TIENDA</Link>
            <Link href="/servicios" className={styles.navLink}>TALLER</Link>
            <Link href="/tienda?ofertas=true" className={styles.mobileNavOffer}>OFERTAS</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
