'use client';

import Link from 'next/link';
import styles from './ChristmasGiftBanner.module.css';

export default function ChristmasGiftBanner() {
  const giftIdeas = [
    {
      icon: '🚲',
      title: 'Bicicletas para Estrenar',
      desc: 'El regalo definitivo para todas las edades. Modelos MTB, Ruta e Infantiles listos para rodar.',
      tag: '¡El Regalo Soñado!',
      link: '/tienda?categoria=Bicicletas',
    },
    {
      icon: '⚙️',
      title: 'Componentes & Mejoras',
      desc: 'Regala potencia y suavidad con grupos Shimano, frenos hidráulicos y transmisiones de alta gama.',
      tag: 'Para el Ciclista Exigente',
      link: '/tienda?categoria=Componentes',
    },
    {
      icon: '🎁',
      title: 'Accesorios & Seguridad',
      desc: 'Cascos certificados, luces de alta visibilidad, caramañolas e indumentaria técnica.',
      tag: 'Detalles Perfectos',
      link: '/tienda?categoria=Accesorios',
    },
  ];

  return (
    <div className={`container ${styles.giftWrapper}`}>
      <section className={styles.giftSection}>
        <div className={styles.giftBackgroundGlow} />
        <div className={styles.giftBackgroundGlowLeft} />

        <div className={styles.giftHeader}>
          <span className={styles.giftBadge}>
            <span>🎄</span> Guía de Regalos de Navidad
          </span>
          <h2 className={styles.giftTitle}>
            Esta Navidad, Regala la <span className={styles.giftTitleHighlight}>Pasión del Ciclismo</span>
          </h2>
          <p className={styles.giftSubtitle}>
            Sorprende a quienes más quieres o date el gusto que te mereces. Te ayudamos a elegir el detalle ideal para rodar con todo en este nuevo año.
          </p>
        </div>

        <div className={styles.giftGrid}>
          {giftIdeas.map((item, idx) => (
            <Link key={idx} href={item.link} className={styles.giftCard}>
              <div>
                <div className={styles.cardIcon}>{item.icon}</div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.desc}</p>
              </div>
              <span className={styles.cardTag}>{item.tag}</span>
            </Link>
          ))}
        </div>

        <div className={styles.giftFooter}>
          <Link href="/tienda" className={styles.giftCtaButton}>
            <span>Explorar Catálogo Navideño</span>
            <span>🎁</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
