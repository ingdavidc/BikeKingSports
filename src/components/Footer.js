'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import styles from './Footer.module.css';

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch('/api/content?type=settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setSettings(data);
      });
  }, []);

  const getVal = (key, fallback) => {
    return settings && settings[key] ? settings[key] : fallback;
  };

  return (
    <footer className={styles.footer}>
      <div className={container \}>
        <div className={styles.column}>
          <Logo />
          <p className={styles.text} style={{marginTop: '16px'}}>Tu tienda de confianza para ciclismo en Saravena. Encuentra las mejores marcas, servicio técnico especializado y todo lo que necesitas para rodar.</p>
        </div>
        <div className={styles.column}>
          <h4 className={styles.subtitle}>Categorías</h4>
          <Link href="/tienda?categoria=bicicletas" className={styles.link}>Bicicletas</Link>
          <Link href="/tienda?categoria=accesorios" className={styles.link}>Accesorios</Link>
          <Link href="/tienda?categoria=repuestos" className={styles.link}>Repuestos</Link>
          <Link href="/tienda?categoria=ropa" className={styles.link}>Indumentaria</Link>
        </div>
        <div className={styles.column}>
          <h4 className={styles.subtitle}>Nosotros</h4>
          <Link href="/nosotros" className={styles.link}>Historia</Link>
          <Link href="/servicios" className={styles.link}>Servicio Técnico</Link>
          <Link href="/guia" className={styles.link}>Guía del Ciclista</Link>
          <Link href="/contacto" className={styles.link}>Contáctanos</Link>
        </div>
        <div className={styles.column}>
          <h4 className={styles.subtitle}>Contacto</h4>
          <p className={styles.text}>📍 {getVal('contact_address', 'Cl. 22 #13-27, Saravena, Arauca')}</p>
          <p className={styles.text}>📱 {getVal('contact_phone', '+57 310 329 1475')}</p>
          <p className={styles.text}>✉️ {getVal('contact_email', 'tienda@bikekingsports.com')}</p>
          <div style={{ marginTop: '15px' }}>
            <p className={styles.text} style={{fontWeight: 'bold', marginBottom: '5px'}}>Horario de Atención:</p>
            <p className={styles.text}>Lunes a Sábado: {getVal('contact_hours_week', '8:00 AM - 6:00 PM')}</p>
          </div>
        </div>
      </div>
      <div className={container \}>
        <p>
          &copy; {new Date().getFullYear()} BIKE KING. Todos los derechos reservados.
          <span className={styles.divider}>|</span>
          <Link href="/admin" className={styles.adminLink}>Acceso Corporativo</Link>
        </p>
        <div className={styles.poweredBy}>
          Powered by <span className={styles.dc}>DC</span>
        </div>
      </div>
    </footer>
  );
}
