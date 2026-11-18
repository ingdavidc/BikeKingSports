'use client';

import React from 'react';
import Barcode from 'react-barcode';

export default function BarcodeLabelItem({ product, settings = {}, isPreview = false }) {
  if (!product) {
    // Espacio en blanco para la columna vacía si la fila es impar
    return (
      <div 
        className="barcode-single-label empty-label"
        style={{
          width: '50mm',
          height: '25mm',
          minWidth: '50mm',
          maxWidth: '50mm',
          boxSizing: 'border-box',
          visibility: isPreview ? 'visible' : 'hidden',
          border: isPreview ? '1px dashed #cbd5e1' : 'none',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isPreview ? '#f8fafc' : 'transparent',
          color: '#94a3b8',
          fontSize: '11px',
          fontStyle: 'italic'
        }}
      >
        {isPreview && <span>(Espacio libre en rollo)</span>}
      </div>
    );
  }

  const {
    showBrandName = true,
    showProductName = true,
    showBarcode = true,
    showPrice = true,
    showProductBrand = true,
    showLocation = false,
  } = settings;

  const sku = product.sku || 'SIN-SKU';
  const priceFormatted = product.price ? `$${Number(product.price).toLocaleString('es-CO')}` : null;
  const brand = (product.brand || '').trim();
  const location = (product.location || '').trim();

  return (
    <div
      className="barcode-single-label"
      style={{
        width: '50mm',
        height: '25mm',
        minWidth: '50mm',
        maxWidth: '50mm',
        boxSizing: 'border-box',
        padding: '0.8mm 1.5mm',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial, Helvetica, sans-serif',
        border: isPreview ? '1px solid #94a3b8' : 'none',
        borderRadius: isPreview ? '4px' : '0px',
        boxShadow: isPreview ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
        position: 'relative'
      }}
    >
      {/* 1. Header: Marca corporativa BIKEKING y/o Marca del Producto */}
      {(showBrandName || (showProductBrand && brand)) && (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: (showBrandName && showProductBrand && brand) ? 'space-between' : 'center',
            alignItems: 'center',
            lineHeight: 1,
            marginBottom: '0.4mm'
          }}
        >
          {showBrandName && (
            <span
              style={{
                fontSize: '8.5px',
                fontWeight: '900',
                letterSpacing: '0.6px',
                color: '#000000'
              }}
            >
              BIKEKING
            </span>
          )}
          {showProductBrand && brand && (
            <span
              style={{
                fontSize: '7.5px',
                fontWeight: '700',
                textTransform: 'uppercase',
                color: '#1e293b',
                maxWidth: showBrandName ? '22mm' : '46mm',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {brand}
            </span>
          )}
        </div>
      )}

      {/* 2. Nombre del Producto */}
      {showProductName && (
        <div
          style={{
            width: '100%',
            fontSize: '8.5px',
            fontWeight: '700',
            lineHeight: 1.1,
            maxHeight: '4.8mm',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textAlign: 'center',
            wordBreak: 'break-word',
            color: '#000000',
            marginBottom: '0.4mm'
          }}
          title={product.name}
        >
          {product.name || 'Producto sin nombre'}
        </div>
      )}

      {/* 3. Código de Barras (react-barcode) */}
      {showBarcode && (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            margin: '0.2mm 0',
            flexShrink: 0
          }}
        >
          <Barcode
            value={sku}
            width={1.15}
            height={24}
            fontSize={9}
            margin={0}
            displayValue={true}
            textMargin={1}
            background="transparent"
            lineColor="#000000"
          />
        </div>
      )}

      {/* 4. Pie: Precio y/o Ubicación */}
      {(showPrice || (showLocation && location)) && (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: (showPrice && showLocation && location) ? 'space-between' : 'center',
            alignItems: 'center',
            lineHeight: 1,
            marginTop: '0.3mm'
          }}
        >
          {showLocation && location && (
            <span
              style={{
                fontSize: '7.5px',
                color: '#334155',
                fontWeight: '600',
                maxWidth: showPrice ? '22mm' : '46mm',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              Ubic: {location}
            </span>
          )}
          {showPrice && priceFormatted && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: '900',
                color: '#000000',
                letterSpacing: '0.2px'
              }}
            >
              PVP: {priceFormatted}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
