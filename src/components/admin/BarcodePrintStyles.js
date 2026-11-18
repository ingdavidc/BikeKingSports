'use client';

import React from 'react';

export default function BarcodePrintStyles({ rollType = 'double' }) {
  const isDouble = rollType === 'double';
  // El cabezal térmico de la Zebra GC420t imprime hasta 104mm de ancho máximo.
  // Usamos 104mm x 25mm para garantizar que ningún milímetro quede fuera del cabezal.
  const pageSize = isDouble ? '104mm 25mm' : '50mm 25mm';
  const rowWidth = isDouble ? '104mm' : '50mm';

  return (
    <style>{`
      /* OCULTAR 100% EN PANTALLA */
      #barcode-print-root,
      .print-only-container {
        display: none !important;
        visibility: hidden !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
        height: 0 !important;
        width: 0 !important;
        overflow: hidden !important;
      }

      /* REGLAS EXCLUSIVAS DE IMPRESIÓN (@media print) */
      @media print {
        @page {
          size: ${pageSize};
          margin: 0;
        }

        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: ${rowWidth} !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* 
         * ELIMINA LAS HOJAS FANTASMA (234 páginas):
         * Oculta el árbol principal de React (__next, tablas, botones) 
         * y solo permite que exista en el flujo de impresión el portal de etiquetas.
         */
        body > *:not(#barcode-print-root) {
          display: none !important;
        }

        #barcode-print-root,
        .print-only-container {
          display: block !important;
          visibility: visible !important;
          position: static !important;
          width: ${rowWidth} !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          overflow: visible !important;
        }

        .barcode-print-row {
          width: ${rowWidth} !important;
          height: 25mm !important;
          min-height: 25mm !important;
          max-height: 25mm !important;
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: ${isDouble ? 'space-between' : 'center'} !important;
          padding: ${isDouble ? '0 0.5mm' : '0'} !important;
          box-sizing: border-box !important;
          page-break-after: always !important;
          break-after: page !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          overflow: hidden !important;
          background: #ffffff !important;
        }

        .barcode-print-spacer {
          width: 4.5mm !important;
          min-width: 4.5mm !important;
          max-width: 4.5mm !important;
          height: 25mm !important;
          display: block !important;
        }

        .barcode-single-label {
          width: 49mm !important;
          min-width: 49mm !important;
          max-width: 49mm !important;
          height: 24.5mm !important;
          min-height: 24.5mm !important;
          max-height: 24.5mm !important;
          padding: 0.6mm 1mm !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          background: #ffffff !important;
          box-sizing: border-box !important;
        }

        .barcode-single-label.empty-label {
          visibility: hidden !important;
        }
      }
    `}</style>
  );
}
