'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styles from './page.module.css';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function Contacto() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    
    // Simulate sending
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus(''), 5000);
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <Navbar />
      
      <section className={styles.hero}>
        <h1>Contacto</h1>
        <p>Estamos aquí para ayudarte. Escríbenos o visítanos en nuestra tienda física.</p>
      </section>

      <main className={styles.contentSection}>
        {/* Columna Izquierda: Info y Mapa */}
        <div className={styles.infoColumn}>
          <div className={styles.infoBlock}>
            <h3>Información de Contacto</h3>
            
            <div className={styles.infoItem}>
              <MapPin size={24} />
              <div>
                <strong>Dirección</strong>
                <p>Cl. 22 #13-27, Saravena, Arauca</p>
              </div>
            </div>
            
            <div className={styles.infoItem}>
              <Phone size={24} />
              <div>
                <strong>Teléfono / WhatsApp</strong>
                <p>+57 310 329 1475</p>
              </div>
            </div>
            
            <div className={styles.infoItem}>
              <Mail size={24} />
              <div>
                <strong>Correo Electrónico</strong>
                <p>tienda@bikekingsports.com</p>
              </div>
            </div>
          </div>

          <div className={styles.infoBlock}>
            <h3><Clock size={24} color="var(--color-primary)" /> Horarios de Atención</h3>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <span style={{ fontWeight: '600', color: '#475569' }}>Lunes a Viernes</span>
                <span style={{ color: '#0f172a', fontWeight: 'bold' }}>8:00 AM - 6:00 PM</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <span style={{ fontWeight: '600', color: '#475569' }}>Sábados</span>
                <span style={{ color: '#0f172a', fontWeight: 'bold' }}>8:00 AM - 6:00 PM</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '600', color: '#475569' }}>Domingos y Festivos</span>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Cerrado</span>
              </li>
            </ul>
          </div>

          <div className={styles.mapContainer}>
            <iframe 
              src="https://maps.google.com/maps?q=Cl.%2022%20%2313-27,%20Saravena,%20Arauca&t=&z=17&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Columna Derecha: Formulario */}
        <div className={styles.formColumn}>
          <h2>Envíanos un Mensaje</h2>
          <p>Completa el formulario y nos pondremos en contacto contigo lo más pronto posible.</p>

          {status === 'success' && (
            <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
              ¡Mensaje enviado con éxito! Te contactaremos pronto.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Nombre Completo</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                className={styles.formControl} 
                value={formData.name}
                onChange={handleChange}
                required 
                placeholder="Ej. Juan Pérez"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Correo Electrónico</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                className={styles.formControl} 
                value={formData.email}
                onChange={handleChange}
                required 
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subject">Asunto</label>
              <input 
                type="text" 
                id="subject" 
                name="subject" 
                className={styles.formControl} 
                value={formData.subject}
                onChange={handleChange}
                required 
                placeholder="¿En qué podemos ayudarte?"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Mensaje</label>
              <textarea 
                id="message" 
                name="message" 
                className={styles.formControl} 
                value={formData.message}
                onChange={handleChange}
                required 
                placeholder="Escribe tu mensaje aquí..."
              ></textarea>
            </div>

            <button type="submit" className={tn btn-primary } disabled={status === 'sending'}>
              {status === 'sending' ? 'Enviando...' : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  Enviar Mensaje <Send size={20} />
                </span>
              )}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
