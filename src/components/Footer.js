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
          <p className={styles.text}>📍 Cl. 22 #13-27, Saravena, Arauca</p>
          <p className={styles.text}>📱 +57 3103291475</p>
          <p className={styles.text}>✉️ tienda@bikekingsports.com</p>
          
          <div style={{ marginTop: '20px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1984.1866415743477!2d-71.8796853!3d6.9535794!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e6bc34f3c7e7b69%3A0xcb0c9be740e74b33!2sSaravena%2C%20Arauca!5e0!3m2!1ses!2sco!4v1700000000000!5m2!1ses!2sco" 
              width="100%" 
              height="160" 
              style={{ border: 0, display: 'block', filter: 'grayscale(100%) contrast(1.1) brightness(0.9) opacity(0.8)', transition: 'filter 0.3s' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              onMouseOver={e => e.currentTarget.style.filter = 'none'}
              onMouseOut={e => e.currentTarget.style.filter = 'grayscale(100%) contrast(1.1) brightness(0.9) opacity(0.8)'}
            ></iframe>
          </div>
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
