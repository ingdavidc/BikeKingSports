'use client';
import Link from 'next/link';
import Logo from './Logo';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.column}>
          <Logo />
          <p className={styles.text} style={{marginTop: '16px'}}>Tu tienda de confianza para ciclismo en Saravena. Encuentra las mejores marcas, servicio tÃ©cnico especializado y todo lo que necesitas para rodar.</p>
        </div>
        <div className={styles.column}>
          <h4 className={styles.subtitle}>CategorÃ­as</h4>
          <Link href="/tienda?categoria=bicicletas" className={styles.link}>Bicicletas</Link>
          <Link href="/tienda?categoria=accesorios" className={styles.link}>Accesorios</Link>
          <Link href="/tienda?categoria=repuestos" className={styles.link}>Repuestos</Link>
          <Link href="/tienda?categoria=ropa" className={styles.link}>Indumentaria</Link>
        </div>
        <div className={styles.column}>
          <h4 className={styles.subtitle}>Nosotros</h4>
          <Link href="/nosotros" className={styles.link}>Historia</Link>
          <Link href="/servicios" className={styles.link}>Servicio TÃ©cnico</Link>
          <Link href="/guia" className={styles.link}>GuÃ­a del Ciclista</Link>
          <Link href="/contacto" className={styles.link}>ContÃ¡ctanos</Link>
        </div>
        <div className={styles.column}>
          <h4 className={styles.subtitle}>Contacto</h4>
          <p className={styles.text}>ðŸ“ Cl. 22 #13-27, Saravena, Arauca</p>
          <p className={styles.text}>ðŸ“± +57 310 329 1475</p>
          <p className={styles.text}>âœ‰ï¸ tienda@bikekingsports.com</p>
          <div style={{ marginTop: '15px' }}>
            <p className={styles.text} style={{fontWeight: 'bold', marginBottom: '5px'}}>Horario de AtenciÃ³n:</p>
            <p className={styles.text}>Lunes a SÃ¡bado: 8:00 AM - 6:00 PM</p>
          </div>
        </div>
      </div>
      <div className={`container ${styles.footerBottom}`}>
        <p>
          &copy; {new Date().getFullYear()} BIKE KING. Todos los derechos reservados.
          <span style={{ margin: '0 10px', opacity: 0.5 }}>|</span>
          <Link href="/admin" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'bold' }}>Acceso Corporativo</Link>
        </p>
        <a href="https://www.dctelematica.com" target="_blank" rel="noopener noreferrer" className={styles.poweredBy}>
          <span>Powered by</span>
          <img src="/dc-logo.png" alt="DC Telematica" className={styles.developerLogo} />
        </a>
      </div>
    </footer>
  );
}

