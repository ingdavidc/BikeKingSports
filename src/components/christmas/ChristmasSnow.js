'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ChristmasSnow.module.css';

export default function ChristmasSnow() {
  const canvasRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const animationFrameId = useRef(null);
  const snowflakesRef = useRef([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsPaused(true);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle count: 45 for smooth, elegant 60fps performance without visual clutter
    const snowflakeCount = window.innerWidth < 768 ? 28 : 45;
    const flakes = [];

    for (let i = 0; i < snowflakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1.2, // 1.2px to 3.7px
        density: Math.random() * snowflakeCount,
        speed: Math.random() * 0.7 + 0.5, // gentle descent
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayAmplitude: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.35,
        angle: Math.random() * Math.PI * 2,
      });
    }

    snowflakesRef.current = flakes;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      
      for (let i = 0; i < flakes.length; i++) {
        const flake = flakes[i];
        
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 4;
        ctx.fill();

        // Update position if not paused
        if (!isPaused) {
          flake.angle += flake.swaySpeed;
          flake.y += flake.speed;
          flake.x += Math.sin(flake.angle) * flake.swayAmplitude;

          // Wrap around screen
          if (flake.y > height + 5) {
            flake.y = -5;
            flake.x = Math.random() * width;
          }
          if (flake.x > width + 5) {
            flake.x = -5;
          } else if (flake.x < -5) {
            flake.x = width + 5;
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isMounted, isPaused]);

  if (!isMounted) return null;

  return (
    <>
      <canvas ref={canvasRef} className={styles.snowCanvas} />
      <button 
        className={styles.snowToggleBtn} 
        onClick={() => setIsPaused(!isPaused)}
        title={isPaused ? "Reanudar efecto de nieve" : "Pausar efecto de nieve"}
        type="button"
        aria-label="Control de nieve"
      >
        <span className={`${styles.snowDot} ${isPaused ? styles.snowDotPaused : ''}`}></span>
        {isPaused ? '❄️ Reanudar nieve' : '❄️ Nieve activa'}
      </button>
    </>
  );
}
