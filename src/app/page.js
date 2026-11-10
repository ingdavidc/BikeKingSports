'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import WorkGallery from '../components/WorkGallery';
import PromoPopup from '../components/PromoPopup';
import { useCart } from '../context/CartContext';
import ProductQuickView from '../components/ProductQuickView';
import ChristmasSnow from '../components/christmas/ChristmasSnow';
import ChristmasLights from '../components/christmas/ChristmasLights';
import SantaHat from '../components/christmas/SantaHat';
import ChristmasGiftBanner from '../components/christmas/ChristmasGiftBanner';
import { Bike, Settings, Backpack, Shirt, Dumbbell } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [isChristmas, setIsChristmas] = useState(true); // Default true for Christmas season!
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [productsRes, settingsRes] = await Promise.all([
          fetch('/api/store/products?limit=4'),
          fetch('/api/content?type=settings')
        ]);
        
        const productsData = await productsRes.json();
        const settingsData = await settingsRes.json();

        if (productsData.success) {
          setFeaturedProducts(productsData.data);
        }

        if (settingsData && !settingsData.error) {
          setSiteSettings(settingsData);

          // Priority 1: URL query param (?navidad=1 or ?navidad=0)
          const urlParams = new URLSearchParams(window.location.search);
          const urlNavidad = urlParams.get('navidad') ?? urlParams.get('christmas');

          if (urlNavidad !== null) {
            setIsChristmas(urlNavidad === '1' || urlNavidad === 'true');
          } else if (settingsData.christmas_mode === '0' || settingsData.christmas_mode === 'false') {
            setIsChristmas(false);
          } else {
            // Default to enabled for the holiday season
            setIsChristmas(true);
          }
        }
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  };

  const handleWhatsAppRequest = (productName) => {
    const text = encodeURIComponent(`Hola BikeKing, quiero reservar el producto que está en preventa: ${productName}`);
    const whatsappNumber = '573103291475';
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className={styles.container}>
      {/* Falling Snow Effect (Active only in Christmas mode) */}
      {isChristmas && <ChristmasSnow />}

      <PromoPopup />
      
      {/* Promociones / Banner Principal */}
      <section className={`${styles.promoBanner} ${isChristmas ? styles.promoBannerChristmas : ''}`}>
        <div className={styles.promoContent}>
          <span className={`${styles.promoBadge} ${isChristmas ? styles.promoBadgeChristmas : ''}`}>
            {isChristmas ? '🎄 ¡Especial de Navidad!' : '¡Oferta de Temporada!'}
          </span>
          <h2>
            {isChristmas 
              ? (siteSettings?.christmas_banner_title || '¡Llegó la Navidad a BikeKing! El Mejor Regalo Rueda Sobre 2 Ruedas') 
              : 'Llantas Maxxis con 20% de Descuento'}
          </h2>
          <p>
            {isChristmas 
              ? (siteSettings?.christmas_banner_desc || 'Aprovecha ofertas exclusivas de fin de año en bicicletas, componentes y accesorios.') 
              : 'Aprovecha esta promoción exclusiva por tiempo limitado.'}
          </p>
          <Link href="/tienda" className={`btn ${isChristmas ? styles.btnChristmas : 'btn-primary'}`}>
            {isChristmas ? 'Ver Regalos 🎁' : 'Comprar Ahora'}
          </Link>
        </div>
        {/* Fairy lights string under the banner */}
        {isChristmas && <ChristmasLights />}
      </section>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent} animate-fade-in`}>
          {isChristmas && (
            <div className={styles.christmasHeroBadge}>
              <span>❄️</span>
              <span>TEMPORADA NAVIDEÑA BIKEKING</span>
              <span>🎄</span>
            </div>
          )}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {isChristmas && (
              <div className={styles.santaHatWrapper}>
                <SantaHat width={58} height={52} />
              </div>
            )}
            <h1 className={styles.heroTitle}>
              BIKE <span className="text-gradient">KING</span>
            </h1>
          </div>
          <p className={styles.heroSubtitle}>
            {isChristmas ? 'PASIÓN A TOPE • ESPECIAL DE NAVIDAD' : 'PASIÓN A TOPE'}
          </p>
          <p className={styles.heroDesc}>
            {isChristmas 
              ? 'Esta Navidad, regala salud, aventura y libertad. Especialistas en MTB y Ruta en Saravena con las mejores ofertas de fin de año.'
              : 'Especialistas en MTB y Ruta en Saravena. Tienda de bicicletas, repuestos, accesorios y servicio técnico profesional.'
            }
          </p>
          
          <div className={styles.heroButtons}>
            <Link href="/tienda" className={`btn ${isChristmas ? styles.btnHeroChristmas : 'btn-primary'}`}>
              {isChristmas ? '🎁 Catálogo Navideño' : 'Ver Catálogo'}
            </Link>
            <Link href="/servicios" className="btn btn-secondary">
              {isChristmas ? '🔧 Puesta a Punto Navideña' : 'Nuestro Taller'}
            </Link>
          </div>
        </div>
      </section>

      {/* Holiday Gift Guide Banner (Active only during Christmas season) */}
      {isChristmas && <ChristmasGiftBanner />}

      {/* Promo Banners */}
      <section className={`container ${styles.promoBannersSection}`}>
        <div className={styles.promoBannersGrid}>
          {/* Banner 1: Componentes */}
          <Link href="/tienda?categoria=componentes" className={styles.promoCard}>
            <img src="https://pngimg.com/uploads/bicycle_saddle/bicycle_saddle_PNG16.png" alt="Sillín" className={styles.promoImage} style={{filter: 'drop-shadow(5px 5px 15px rgba(0,0,0,0.5))'}} />
            <div className={styles.promoContentRight}>
              <div className={styles.promoPill}>
                COMPONENTES
                <br/>Y REPUESTOS
              </div>
            </div>
            <div className={styles.playIcon}>
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </Link>

          {/* Banner 2: Frenos */}
          <Link href="/tienda?categoria=componentes" className={styles.promoCard}>
            <div className={styles.promoRibbon}>{isChristmas ? '🎄 NAVIDAD' : 'NUEVOS'}</div>
            <img src="https://pngimg.com/uploads/bicycle/bicycle_PNG5377.png" alt="Frenos Shimano" className={styles.promoImage} style={{filter: 'drop-shadow(5px 5px 15px rgba(0,0,0,0.5))', left: '-15%'}} />
            <div className={styles.promoContentRight}>
              <div className={styles.promoPill}>FRENOS XTR Y XT</div>
              <p className={styles.promoSubtitle}>POTENCIA Y CONTROL<br/>SIN LÍMITES</p>
              <div className={styles.promoBrand}>SHIMANO</div>
            </div>
            <div className={styles.playIcon}>
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className={`container ${styles.featuredSection}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {isChristmas ? '🎁 Productos Destacados de Navidad' : 'Productos Destacados'}
          </h2>
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
                    <img src={product.image_url || '/no-photo.jpg'} alt={product.name} />
                    
                    {/* Holiday Gift Badge */}
                    {isChristmas && !isOutOfStock && (
                      <span className={styles.christmasCardBadge}>
                        🎁 Regalo Navideño
                      </span>
                    )}

                    {product.is_on_sale === 1 && (
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        backgroundColor: '#e60000',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        zIndex: 10,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        ¡OFERTA!
                      </span>
                    )}
                    {isOutOfStock && (
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: '#e60000',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        zIndex: 10
                      }}>
                        PREVENTA
                      </span>
                    )}
                  </div>
                  <div className={styles.featuredInfo} style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <h3>{product.name}</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <p className={styles.price}>{formatPrice(product.price)}</p>
                        {product.is_on_sale === 1 && product.old_price > 0 && (
                          <p style={{ color: '#94a3b8', fontSize: '0.95rem', textDecoration: 'line-through', margin: 0, fontWeight: 'normal' }}>
                            {formatPrice(product.old_price)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '15px' }}>
                      {isOutOfStock ? (
                        <button 
                          className="btn btn-secondary" 
                          style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#25D366', color: 'white', borderColor: '#25D366', padding: '10px'}}
                          onClick={(e) => { e.stopPropagation(); handleWhatsAppRequest(product.name); }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
                          RESERVAR AHORA
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

      {/* Services / Categories Section */}
      <section className={`container ${styles.servicesSection}`}>
        <h2 className={styles.sectionTitle}>
          {isChristmas ? '🎄 Categorías & Regalos Navideños' : 'Nuestros Servicios'}
        </h2>
        <div className={styles.grid}>
          <Link href="/tienda?categoria=Bicicletas" className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.cardIcon}>
              <Bike size={48} color="var(--color-primary)" strokeWidth={1.5} />
            </div>
            <h3>Bicicletas</h3>
            <p>Encuentra las mejores marcas en bicicletas para todos los niveles y disciplinas.</p>
            {isChristmas && <span className={styles.categoryChristmasTag}>🎄 Ideal para Regalo</span>}
          </Link>
          <Link href="/tienda?categoria=Componentes" className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.cardIcon}>
              <Settings size={48} color="var(--color-primary)" strokeWidth={1.5} />
            </div>
            <h3>Componentes</h3>
            <p>Repuestos y partes de alta calidad para optimizar el rendimiento de tu bicicleta.</p>
            {isChristmas && <span className={styles.categoryChristmasTag}>⚙️ Puesta a Punto</span>}
          </Link>
          <Link href="/tienda?categoria=Accesorios" className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.cardIcon}>
              <Backpack size={48} color="var(--color-primary)" strokeWidth={1.5} />
            </div>
            <h3>Accesorios</h3>
            <p>Todo lo que necesitas como complemento ideal para rodar seguro y preparado.</p>
            {isChristmas && <span className={styles.categoryChristmasTag}>🎁 Detalles Únicos</span>}
          </Link>
          <Link href="/tienda?categoria=Ropa" className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.cardIcon}>
              <Shirt size={48} color="var(--color-primary)" strokeWidth={1.5} />
            </div>
            <h3>Ropa</h3>
            <p>Indumentaria técnica, cómoda y aerodinámica diseñada para ciclistas.</p>
            {isChristmas && <span className={styles.categoryChristmasTag}>✨ Estrena en Ruta</span>}
          </Link>
          <Link href="/tienda?categoria=Gym" className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.cardIcon}>
              <Dumbbell size={48} color="var(--color-primary)" strokeWidth={1.5} />
            </div>
            <h3>Gym</h3>
            <p>Equipos y accesorios para potenciar tu entrenamiento físico y gimnasio en casa.</p>
            {isChristmas && <span className={styles.categoryChristmasTag}>💪 Salud & Bienestar</span>}
          </Link>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className={styles.eventsSection}>
        <div className={`container ${styles.eventsContainer}`}>
          <div className={styles.eventsHeader}>
            <h2 className={styles.sectionTitle} style={{color: 'white', marginBottom: '10px'}}>
              {isChristmas ? '🎄 Rodadas y Eventos de Fin de Año' : 'Próximos Eventos'}
            </h2>
            <p style={{color: '#e2e8f0', marginBottom: '40px'}}>
              {isChristmas ? 'Celebra el fin de año pedaleando en comunidad.' : 'Únete a nuestra comunidad ciclista.'}
            </p>
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
