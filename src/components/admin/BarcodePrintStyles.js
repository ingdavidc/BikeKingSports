'use client';

import React from 'react';

export default function BarcodePrintStyles({ rollType = 'double' }) {
  const isDouble = rollType === 'double';
  const pageSize = isDouble ? '108mm 25mm' : '50mm 25mm';
  const rowWidth = isDouble ? '108mm' : '50mm';
  const rowPadding = isDouble ? '0 1.5mm' : '0';

  return (
    <style>{`
      @media print {
        @page {
          size: ${pageSize};
          margin: 0;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body * {
          visibility: hidden !important;
        }
        #barcode-print-root, #barcode-print-root * {
          visibility: visible !important;
        }
        #barcode-print-root {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: ${rowWidth} !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          display: block !important;
        }
        .barcode-print-row {
          width: ${rowWidth} !important;
          height: 25mm !important;
          min-height: 25mm !important;
          max-height: 25mm !important;
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: flex-start !important;
          padding: ${rowPadding} !important;
          box-sizing: border-box !important;
          page-break-after: always !important;
          break-after: page !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          overflow: hidden !important;
          background: #ffffff !important;
        }
        .barcode-print-spacer {
          width: 5mm !important;
          min-width: 5mm !important;
          max-width: 5mm !important;
          height: 25mm !important;
          display: block !important;
        }
        .barcode-single-label {
          width: 50mm !important;
          min-width: 50mm !important;
          max-width: 50mm !important;
          height: 25mm !important;
          min-height: 25mm !important;
          max-height: 25mm !important;
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
