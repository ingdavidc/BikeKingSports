'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import WorkGallery from '../components/WorkGallery';
import PromoPopup from '../components/PromoPopup';
import { useCart } from '../context/CartContext';
import SmartSearch from '../components/SmartSearch';
import ProductQuickView from '../components/ProductQuickView';
import styles from './page.module.css';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/store/products?limit=4');
        const data = await res.json();
        if (data.success) {
          setFeaturedProducts(data.data);
        }
      } catch (err) {
        console.error("Error fetching featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  };

  const handleWhatsAppRequest = (productName) => {
    const text = encodeURIComponent(`Hola BikeKing, quiero encargar el producto que está agotado: ${productName}`);
    const whatsappNumber = '573103291475';
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className={styles.container}>
      <PromoPopup />
      
      {/* Promociones / Banner Principal */}
      <section className={styles.promoBanner}>
        <div className={styles.promoContent}>
          <span className={styles.promoBadge}>¡Oferta de Temporada!</span>
          <h2>Llantas Maxxis con 20% de Descuento</h2>
          <p>Aprovecha esta promoción exclusiva por tiempo limitado.</p>
          <Link href="/tienda" className="btn btn-primary">Comprar Ahora</Link>
        </div>
      </section>

      {/* Hero Section */}
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
          
          <SmartSearch />
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
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Cargando productos destacados...</div>
        ) : (
          <div className={styles.featuredGrid}>
            {featuredProducts.map(product => {
              const isOutOfStock = (product.stock || 0) <= 0;

              return (
                <div 
                  key={product.id} 
                  className={styles.featuredCard} 
                  style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className={styles.featuredImage} style={{ position: 'relative' }}>
                    <img src={product.image_url || 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'} alt={product.name} />
                    {isOutOfStock && (
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        zIndex: 10
                      }}>
                        Agotado
                      </span>
                    )}
                  </div>
                  <div className={styles.featuredInfo} style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <h3>{product.name}</h3>
                      <p className={styles.price}>{formatPrice(product.price)}</p>
                    </div>
                    
                    <div style={{ marginTop: '15px' }}>
                      {isOutOfStock ? (
                        <button 
                          className="btn btn-secondary" 
                          style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#25D366', color: 'white', borderColor: '#25D366', padding: '10px'}}
                          onClick={(e) => { e.stopPropagation(); handleWhatsAppRequest(product.name); }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
                          Solicitar Pedido
                        </button>
                      ) : (
                        <button 
                          className="btn btn-primary" 
                          style={{width: '100%', padding: '10px'}}
                          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        >
                          Agregar al Carrito
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Services Section */}
      <section className={`container ${styles.servicesSection}`}>
        <h2 className={styles.sectionTitle}>Nuestros Servicios</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🚲</div>
            <h3>Bicicletas</h3>
            <p>Encuentra las mejores marcas en bicicletas para todos los niveles y disciplinas.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>⚙️</div>
            <h3>Componentes</h3>
            <p>Repuestos y partes de alta calidad para optimizar el rendimiento de tu bicicleta.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🎒</div>
            <h3>Accesorios</h3>
            <p>Todo lo que necesitas como complemento ideal para rodar seguro y preparado.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>👕</div>
            <h3>Ropa</h3>
            <p>Indumentaria técnica, cómoda y aerodinámica diseñada para ciclistas.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🏋️</div>
            <h3>Gym</h3>
            <p>Equipos y accesorios para potenciar tu entrenamiento físico y gimnasio en casa.</p>
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
      {/* Quick View Modal */}
      {selectedProduct && (
        <ProductQuickView 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
