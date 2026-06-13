'use client';
import styles from './Logo.module.css';

export default function Logo() {
  return (
    <div className={styles.logoContainer}>
      <div className={styles.logoBox}>
        <div className={styles.windLines}>
          <div className={styles.line1}></div>
          <div className={styles.line2}></div>
          <div className={styles.line3}></div>
        </div>
        <span className={styles.textBike}>BIKE</span>
        <span className={styles.textKing}>
          KIN<span className={styles.letterG}>G
            <div className={styles.uciStripes}>
              <div className={styles.stripe} style={{backgroundColor: '#0072C6'}}></div>
              <div className={styles.stripe} style={{backgroundColor: '#E5142B'}}></div>
              <div className={styles.stripe} style={{backgroundColor: '#000000'}}></div>
              <div className={styles.stripe} style={{backgroundColor: '#F4C300'}}></div>
              <div className={styles.stripe} style={{backgroundColor: '#008D36'}}></div>
            </div>
          </span>
        </span>
      </div>
      <div className={styles.tagline}>PASIÓN A TOPE</div>
    </div>
  );
}
