import Link from 'next/link';
import styles from './page.module.css';

export default function Servicios() {
  const servicios = [
    {
      id: 'mantenimiento-general',
      title: 'Mantenimiento General',
      price: 'Desde $80.000',
      features: [
        'Lavado y desengrase profundo',
        'Ajuste de cambios y frenos',
        'Lubricación de cadena',
        'Revisión de presión de llantas',
        'Ajuste de tornillería general'
      ]
    },
    {
      id: 'mantenimiento-full',
      title: 'Mantenimiento Full',
      price: 'Desde $150.000',
      features: [
        'Incluye todo lo del Mantenimiento General',
        'Mantenimiento de manzanas (bujes)',
        'Mantenimiento de centro y dirección',
        'Centrado de rines básico',
        'Purgado de frenos hidráulicos (opcional)'
      ]
    },
    {
      id: 'suspensiones',
      title: 'Servicio a Suspensiones',
      price: 'Según modelo',
      features: [
        'Mantenimiento de suspensión delantera (Horquilla)',
        'Mantenimiento de shock (Amortiguador trasero)',
        'Cambio de retenedores y aceite',
        'Revisión de aire y rebote'
      ]
    },
    {
      id: 'otros-servicios',
      title: 'Otros Servicios Específicos',
      price: 'Previa cotización',
      features: [
        'Conversión a sistema Tubeless',
        'Sangrado de frenos de disco',
        'Armado de bicicletas nuevas en caja',
        'Centrado profesional de rines',
        'Diagnóstico de ruidos y fallas'
      ]
    }
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section para Taller */}
      <section className={styles.heroTaller}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.title}>Servicio Técnico <span className="text-gradient">Especializado</span></h1>
          <p className={styles.subtitle}>Herramienta profesional y mecánicos expertos para tu bicicleta.</p>
        </div>
      </section>

      {/* Intro Section */}
      <section className={`container ${styles.introSection}`}>
        <div className={styles.introText}>
          <h2>¿Por qué elegir nuestro taller?</h2>
          <p>
            En Bike King sabemos que tu bicicleta es más que un medio de transporte, es tu compañera de aventuras. Por eso, nuestro taller está equipado con las mejores marcas de herramientas (Park Tool, Shimano) y nuestro personal se capacita constantemente en las últimas tecnologías de transmisiones, frenos hidráulicos y suspensiones.
          </p>
        </div>
        <div className={styles.introStats}>
          <div className={styles.statBox}>
            <span className={styles.statNumber}>100%</span>
            <span className={styles.statLabel}>Garantía en mano de obra</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNumber}>24h</span>
            <span className={styles.statLabel}>Tiempo promedio de entrega</span>
          </div>
        </div>
      </section>

      {/* Planes de Mantenimiento */}
      <section className={styles.planesSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Planes de Mantenimiento</h2>
          <div className={styles.planesGrid}>
            {servicios.map(servicio => (
              <div key={servicio.id} className={styles.planCard}>
                <div className={styles.planHeader}>
                  <h3>{servicio.title}</h3>
                  <p className={styles.planPrice}>{servicio.price}</p>
                </div>
                <ul className={styles.planFeatures}>
                  {servicio.features.map((feature, index) => (
                    <li key={index}>✓ {feature}</li>
                  ))}
                </ul>
                <div className={styles.planFooter}>
                  <Link href={`https://wa.me/573103291475?text=Hola,%20quisiera%20agendar%20un%20${encodeURIComponent(servicio.title)}`} target="_blank" className="btn btn-primary" style={{width: '100%'}}>
                    Agendar Cita
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Otros Servicios / Diagnóstico */}
      <section className={`container ${styles.otrosServicios}`}>
        <div className={styles.diagBox}>
          <h3>¿Escuchas un ruido extraño o los cambios no entran bien?</h3>
          <p>Tráenos tu bicicleta para un <strong>diagnóstico gratuito</strong>. Te diremos exactamente qué necesita y te daremos un presupuesto sin compromiso.</p>
          <Link href="https://wa.me/573103291475" target="_blank" className="btn btn-secondary">Escríbenos por WhatsApp</Link>
        </div>
      </section>
    </div>
  );
}
