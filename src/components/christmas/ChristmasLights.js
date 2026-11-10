'use client';

import styles from './ChristmasLights.module.css';

export default function ChristmasLights() {
  const bulbColors = [
    styles.bulbRed,
    styles.bulbGold,
    styles.bulbGreen,
    styles.bulbBlue,
    styles.bulbWhite,
    styles.bulbRed,
    styles.bulbGreen,
    styles.bulbGold,
    styles.bulbBlue,
    styles.bulbRed,
    styles.bulbWhite,
    styles.bulbGreen,
    styles.bulbGold,
    styles.bulbRed,
    styles.bulbBlue,
    styles.bulbGreen,
    styles.bulbGold,
    styles.bulbWhite,
  ];

  return (
    <div className={styles.lightStringContainer} aria-hidden="true">
      <svg className={styles.wireSvg} preserveAspectRatio="none" viewBox="0 0 1000 20">
        <path d="M0,5 Q 50,18 100,6 T 200,6 T 300,6 T 400,6 T 500,6 T 600,6 T 700,6 T 800,6 T 900,6 T 1000,5" />
      </svg>
      <div className={styles.bulbsWrapper}>
        {bulbColors.map((colorClass, idx) => (
          <div key={idx} className={styles.bulbItem} style={{ animationDelay: `${(idx * 0.15) % 2}s` }}>
            <div className={styles.bulbSocket} />
            <div className={`${styles.bulb} ${colorClass}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
