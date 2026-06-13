'use client';
import Link from 'next/link';
import styles from './SocialFloatingBar.module.css';

export default function SocialFloatingBar() {
  const WHATSAPP = '573103291475';
  const FACEBOOK = 'https://www.facebook.com/bikekingsport/';
  const INSTAGRAM = 'https://www.instagram.com/bikeking.sports?igsh=bnNkd2M5dTFnemht';
  const EMAIL = 'mailto:bk.bikeking@gmail.com';

  return (
    <div className={styles.floatingBar}>
      <Link href={`https://wa.me/${WHATSAPP}`} target="_blank" className={`${styles.socialIcon} ${styles.whatsapp}`} aria-label="WhatsApp">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      </Link>
      <Link href={FACEBOOK} target="_blank" className={`${styles.socialIcon} ${styles.facebook}`} aria-label="Facebook">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
      </Link>
      <Link href={INSTAGRAM} target="_blank" className={`${styles.socialIcon} ${styles.instagram}`} aria-label="Instagram">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
      </Link>
      <Link href={EMAIL} className={`${styles.socialIcon} ${styles.email}`} aria-label="Correo Electrónico">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
      </Link>
    </div>
  );
}
