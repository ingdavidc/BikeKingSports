'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function BarcodePrintPortal({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div id="barcode-print-root" className="print-only-container">
      {children}
    </div>,
    document.body
  );
}
