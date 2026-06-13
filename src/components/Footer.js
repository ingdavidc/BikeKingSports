import Link from 'next/link';
import Logo from './Logo';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.column}>
          <Logo />
          <p className={styles.text} style={{marginTop: '16px'}}>Pasión a Tope. Tu tienda especializada en ciclismo de ruta y MTB en Saravena.</p>
        </div>
        <div className={styles.column}>
          <h4 className={styles.subtitle}>Enlaces</h4>
          <Link href="/" className={styles.link}>Inicio</Link>
          <Link href="/tienda" className={styles.link}>Tienda Virtual</Link>
          <Link href="/admin" className={styles.link}>Admin</Link>
        </div>
        <div className={styles.column}>
          <h4 className={styles.subtitle}>Contacto</h4>
          <p className={styles.text}>📍 Carrera 15 # 23 - 25, Saravena, Colombia</p>
          <p className={styles.text}>📱 +57 3103291475</p>
          <p className={styles.text}>✉️ bk.bikeking@gmail.com</p>
        </div>
      </div>
      <div className={`container ${styles.footerBottom}`}>
        <p>&copy; {new Date().getFullYear()} Bike King. Todos los derechos reservados.</p>
        <a href="https://www.dctelematica.com" target="_blank" rel="noopener noreferrer" className={styles.poweredBy}>
          <span>Powered by</span>
          <img src="/dc-logo.png" alt="DC Telematica Logo" className={styles.developerLogo} />
        </a>
      </div>
    </footer>
  );
}
