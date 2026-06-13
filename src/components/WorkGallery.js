'use client';
import styles from './WorkGallery.module.css';

export default function WorkGallery() {
  // Mock data: esto vendrá de Firebase más adelante
  const galleryItems = [
    { id: 1, type: 'Trabajo', desc: 'Mantenimiento Full MTB', image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=500&q=80' },
    { id: 2, type: 'Cliente', desc: '¡Bici Nueva Entregada!', image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=500&q=80' },
    { id: 3, type: 'Trabajo', desc: 'Sangrado de Frenos', image: 'https://images.unsplash.com/photo-1588629202302-861c8a14ec8c?auto=format&fit=crop&w=500&q=80' },
    { id: 4, type: 'Cliente', desc: 'Feliz con sus llantas Maxxis', image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=500&q=80' },
    { id: 5, type: 'Trabajo', desc: 'Armado a la carta', image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=500&q=80' },
    { 
      id: 6, 
      type: '¡Te Esperamos!', 
      isCTA: true,
      title: '¡Tú puedes ser el próximo!',
      desc: 'Visítanos en el taller, hablemos de bicis y prepárate para salir a rodar. 🚲💙'
    }
  ];

  // Duplicamos el array para que el efecto visual no tenga fin (Marquee effect)
  const duplicatedItems = [...galleryItems, ...galleryItems];

  return (
    <section className={styles.gallerySection}>
      <div className={`container ${styles.galleryHeader}`}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>Día a Día en <span className="text-gradient">Bike King</span></h2>
          <p className={styles.subtitle}>Nuestros trabajos recientes y clientes felices.</p>
        </div>
      </div>

      <div className={styles.carouselWrapper}>
        <div className={styles.carouselTrack}>
          {duplicatedItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className={`${styles.galleryCard} ${item.isCTA ? styles.ctaCard : ''}`}>
              {item.isCTA ? (
                <div className={styles.ctaContent}>
                  <div className={styles.ctaIcon}>👋</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <div className={styles.badge}>{item.type}</div>
                </div>
              ) : (
                <>
                  <div className={styles.imageWrapper}>
                    <img src={item.image} alt={item.desc} className={styles.image} />
                    <div className={styles.badge}>{item.type}</div>
                  </div>
                  <div className={styles.cardInfo}>
                    <p>{item.desc}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
