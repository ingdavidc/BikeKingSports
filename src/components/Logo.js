'use client';
import styles from './Logo.module.css';

export default function Logo() {
  return (
    <div className={styles.logoContainer}>
      <img src="/logo.png" alt="Bike King Sports" className={styles.logoImage} />
    </div>
  );
}
