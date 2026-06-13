import Link from 'next/link';
import WorkGallery from '../components/WorkGallery';
import styles from './page.module.css';

export default function Home() {
  const featuredProducts = [
    { id: 1, name: 'Trek Marlin 5', price: 2500000, image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
    { id: 2, name: 'Casco Giro Fixture', price: 280000, image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
    { id: 4, name: 'Llanta Maxxis Ikon 29', price: 180000, image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className={styles.container}>
      {/* Promociones / Banner Principal */}
      <section className={styles.promoBanner}>
        <div className={styles.promoContent}>
          <span className={styles.promoBadge}>¡Oferta de Temporada!</span>
          <h2>Llantas Maxxis con 20% de Descuento</h2>
          <p>Aprovecha esta promoción exclusiva por tiempo limitado.</p>
          <Link href="/tienda" className="btn btn-primary">Comprar Ahora</Link>
        </div>
      </section>

      {/* Hero Section (Original mejorada) */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent} animate-fade-in`}>
          <h1 className={styles.heroTitle}>
            BIKE <span className="text-gradient">KING</span>
          </h1>
          <p className={styles.heroSubtitle}>PASIÓN A TOPE</p>
          <p className={styles.heroDesc}>
            Especialistas en MTB y Ruta en Saravena. Tienda de bicicletas, repuestos, accesorios y servicio técnico profesional.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/tienda" className="btn btn-primary">Ver Catálogo</Link>
            <Link href="/servicios" className="btn btn-secondary">Nuestro Taller</Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={`container ${styles.featuredSection}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Productos Destacados</h2>
          <Link href="/tienda" className={styles.viewAllLink}>Ver todo →</Link>
        </div>
        <div className={styles.featuredGrid}>
          {featuredProducts.map(product => (
            <div key={product.id} className={styles.featuredCard}>
              <div className={styles.featuredImage}>
                <img src={product.image} alt={product.name} />
              </div>
              <div className={styles.featuredInfo}>
                <h3>{product.name}</h3>
                <p className={styles.price}>{formatPrice(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className={`container ${styles.servicesSection}`}>
        <h2 className={styles.sectionTitle}>Nuestros Servicios</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🚲</div>
            <h3>Venta de Bicicletas</h3>
            <p>Encuentra las mejores marcas en bicicletas de MTB y Ruta para todos los niveles.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🔧</div>
            <h3>Servicio Técnico Especializado</h3>
            <p>Mantenimiento preventivo y correctivo con mecánicos expertos y herramienta profesional.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>⚙️</div>
            <h3>Repuestos y Accesorios</h3>
            <p>Todo lo que necesitas para mejorar tu rendimiento y rodar seguro.</p>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className={styles.eventsSection}>
        <div className={`container ${styles.eventsContainer}`}>
          <div className={styles.eventsHeader}>
            <h2 className={styles.sectionTitle} style={{color: 'white', marginBottom: '10px'}}>Próximos Eventos</h2>
            <p style={{color: '#e2e8f0', marginBottom: '40px'}}>Únete a nuestra comunidad ciclista.</p>
          </div>
          <div className={styles.eventsGrid}>
            <div className={styles.eventCard}>
              <div className={styles.eventDate}>
                <span className={styles.eventDay}>15</span>
                <span className={styles.eventMonth}>OCT</span>
              </div>
              <div className={styles.eventInfo}>
                <h4>Travesía MTB Saravena</h4>
                <p>Nivel Intermedio. Ruta de 45km por paisajes llaneros.</p>
                <Link href="#" className={styles.eventLink}>Ver Detalles</Link>
              </div>
            </div>
            <div className={styles.eventCard}>
              <div className={styles.eventDate}>
                <span className={styles.eventDay}>02</span>
                <span className={styles.eventMonth}>NOV</span>
              </div>
              <div className={styles.eventInfo}>
                <h4>Ruta de Asfalto - 80k</h4>
                <p>Entrenamiento de resistencia para ciclistas de ruta.</p>
                <Link href="#" className={styles.eventLink}>Ver Detalles</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery / Daily Jobs */}
      <WorkGallery />

      {/* Our History / Team Section */}
      <section className={styles.historySection}>
        <div className={`container ${styles.historyContainer}`}>
          <div className={styles.historyText}>
            <span className={styles.historyBadge}>Nuestra Historia</span>
            <h2 className={styles.historyTitle}>Pasión a Tope por el Ciclismo</h2>
            <p>
              Bike King nació de la pasión por el ciclismo en el corazón de Saravena, Arauca. Empezamos como un pequeño taller para amigos y hoy somos el centro especializado de MTB y Ruta de la región.
            </p>
            <p>
              Nuestro objetivo no es solo vender repuestos, sino fomentar un estilo de vida saludable, apoyar talentos locales y construir una comunidad donde todos somos familia. ¡Nos vemos en la ruta!
            </p>
          </div>
          <div className={styles.historyImageWrapper}>
            <div className={styles.placeholderImage}>
              <span>Imagen del Podio/Equipo</span>
              <p>(Sube tu imagen aquí en el Admin Panel)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
