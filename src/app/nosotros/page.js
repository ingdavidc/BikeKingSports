'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Target, Eye } from 'lucide-react';

export default function Nosotros() {
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
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1>{getVal('about_hero_title', 'Nosotros')}</h1>
        <p>{getVal('about_hero_subtitle', 'Pasión por el ciclismo, experiencia a tu servicio.')}</p>
      </section>

      <main className={styles.contentSection}>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutText}>
            <h2>{getVal('about_title', 'Más de una década rodando juntos')}</h2>
            <p>{getVal('about_p1', 'En Bike King llevamos más de 11 años impulsando el ciclismo en Saravena y toda Colombia. Somos ciclistas apasionados que entienden perfectamente lo que necesitas para rodar seguro, cómodo y con estilo.')}</p>
            <p>{getVal('about_p2', 'En nuestra tienda encuentras mucho más que productos: encuentras experiencia, un servicio técnico impecable y una verdadera comunidad de amantes de las bielas.')}</p>
          </div>
          <div className={styles.aboutImage}>
            <img src={getVal('about_image_url', 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')} alt="Bike King" />
          </div>
        </div>

        <div className={styles.missionVision}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <Target size={48} color="var(--color-primary)" strokeWidth={1.5} />
            </div>
            <h3>Misión</h3>
            <p>{getVal('about_mission', 'Rodar contigo cada kilómetro, ofreciendo lo mejor en bicicletas, productos, repuestos y servicio técnico para garantizar que tu experiencia sobre ruedas sea siempre excepcional y segura.')}</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <Eye size={48} color="var(--color-primary)" strokeWidth={1.5} />
            </div>
            <h3>Visión</h3>
            <p>{getVal('about_vision', 'Ser reconocidos como el principal referente del ciclismo en la región, construyendo la comunidad de ciclistas más sólida, apasionada y comprometida de Colombia.')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
