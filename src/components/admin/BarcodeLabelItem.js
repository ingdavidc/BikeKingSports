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
          width: isPreview ? '50mm' : '49mm',
          height: isPreview ? '25mm' : '24.5mm',
          minWidth: isPreview ? '50mm' : '49mm',
          maxWidth: isPreview ? '50mm' : '49mm',
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
    showLogo = false,
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

  // Detectar qué secciones de contenido están activas y tienen datos
  const hasCorporateBrand = showBrandName || showLogo;
  const hasHeader = hasCorporateBrand || (showProductBrand && brand);
  const hasName = showProductName && !!product.name;
  const hasBarcode = showBarcode && !!sku;
  const hasFooter = (showPrice && !!priceFormatted) || (showLocation && !!location);

  // Conteo de bloques de texto activos (0 a 3)
  const textRowsCount = (hasHeader ? 1 : 0) + (hasName ? 1 : 0) + (hasFooter ? 1 : 0);

  // 1. DIMENSIONAMIENTO DINÁMICO DEL CÓDIGO DE BARRAS
  // Ajustado milimétricamente para caber en 25mm sin pisar textos ni desbordar
  let barcodeHeight = 22;
  let barcodeWidth = 1.05; // 1.05 garantiza que quepa en 38-40mm de ancho y no se corte a la derecha
  let barcodeFontSize = 8.5;

  if (hasBarcode) {
    if (textRowsCount === 0) {
      // Solo código de barras
      barcodeHeight = 46;
      barcodeWidth = 1.25;
      barcodeFontSize = 10;
    } else if (textRowsCount === 1) {
      // 1 bloque de texto + código de barras (ej. Solo BIKEKING SPORTS, o Solo Nombre)
      // Si el nombre es largo (más de 30 letras), dejamos altura de 26 para que no pise el texto
      const isLongName = hasName && (product.name || '').length > 30;
      barcodeHeight = isLongName ? 26 : 32;
      barcodeWidth = 1.05;
      barcodeFontSize = 8.5;
    } else if (textRowsCount === 2) {
      // 2 bloques de texto + código de barras (ej. Nombre + Código + Precio)
      barcodeHeight = 22;
      barcodeWidth = 1.05;
      barcodeFontSize = 8;
    } else {
      // Todo activo (Header + Nombre + Código + Footer)
      barcodeHeight = 18;
      barcodeWidth = 1.02;
      barcodeFontSize = 7.5;
    }
  }

  // 2. DISTRIBUCIÓN VERTICAL Y ESPACIADO DINÁMICO
  let containerJustify = 'center';
  let containerGap = '0.6mm';
  let containerPadding = '0.6mm 1mm';

  if (!hasBarcode) {
    containerJustify = 'center';
    containerGap = textRowsCount <= 2 ? '1.5mm' : '1mm';
  } else if (textRowsCount === 0) {
    containerJustify = 'center';
    containerGap = '0px';
  } else if (textRowsCount === 1) {
    containerJustify = 'center';
    containerGap = '0.8mm';
    containerPadding = '0.6mm 1mm';
  } else if (textRowsCount === 2) {
    containerJustify = 'space-between';
    containerGap = '0.4mm';
    containerPadding = '0.6mm 1mm';
  } else {
    containerJustify = 'space-between';
    containerGap = '0.2mm';
    containerPadding = '0.4mm 1mm';
  }

  // 3. TIPOGRAFÍAS DINÁMICAS
  const brandNameSize = textRowsCount === 1 ? '10px' : (textRowsCount === 2 ? '8.5px' : '7.5px');
  const brandNameLetterSpacing = textRowsCount === 1 ? '0.6px' : '0.3px';

  const isLongName = (product.name || '').length > 32;
  const productNameSize = textRowsCount === 1 ? (isLongName ? '8.5px' : '9.5px') : (textRowsCount === 2 ? '8px' : '7.5px');
  const productNameLineHeight = 1.15;
  const productNameMaxLines = textRowsCount === 1 ? 3 : 2;
  const productNameMaxHeight = textRowsCount === 1 ? '6.2mm' : (textRowsCount === 2 ? '4.8mm' : '3.8mm');

  const priceSize = textRowsCount === 1 ? '11px' : (textRowsCount === 2 ? '9.5px' : '8.5px');
  const productBrandSize = textRowsCount === 1 ? '8px' : '7px';
  const locationSize = textRowsCount === 1 ? '8px' : '7px';

  return (
    <div
      className="barcode-single-label"
      style={{
        width: isPreview ? '50mm' : '49mm',
        height: isPreview ? '25mm' : '24.5mm',
        minWidth: isPreview ? '50mm' : '49mm',
        maxWidth: isPreview ? '50mm' : '49mm',
        boxSizing: 'border-box',
        padding: containerPadding,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: containerJustify,
        gap: containerGap,
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
      {/* 1. Header: Logo y/o Marca corporativa BIKEKING SPORTS y/o Marca del Producto */}
      {hasHeader && (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: (hasCorporateBrand && showProductBrand && brand) ? 'space-between' : 'center',
            alignItems: 'center',
            lineHeight: 1,
            flexShrink: 0
          }}
        >
          {hasCorporateBrand && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
              {showLogo && (
                <img
                  src="/logo.png"
                  alt="Bike King Sports"
                  style={{
                    height: textRowsCount === 1 ? (showBrandName ? '4mm' : '5.5mm') : '3.2mm',
                    maxHeight: textRowsCount === 1 ? '20px' : '14px',
                    objectFit: 'contain',
                    filter: 'contrast(125%)'
                  }}
                />
              )}
              {showBrandName && (
                <span
                  style={{
                    fontSize: showLogo ? (textRowsCount === 1 ? '9px' : '7px') : brandNameSize,
                    fontWeight: '900',
                    letterSpacing: brandNameLetterSpacing,
                    color: '#000000',
                    whiteSpace: 'nowrap'
                  }}
                >
                  BIKEKING SPORTS
                </span>
              )}
            </div>
          )}
          {showProductBrand && brand && (
            <span
              style={{
                fontSize: productBrandSize,
                fontWeight: '700',
                textTransform: 'uppercase',
                color: '#1e293b',
                maxWidth: hasCorporateBrand ? '18mm' : '46mm',
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
      {hasName && (
        <div
          style={{
            width: '100%',
            fontSize: productNameSize,
            fontWeight: '700',
            lineHeight: productNameLineHeight,
            maxHeight: productNameMaxHeight,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: productNameMaxLines,
            WebkitBoxOrient: 'vertical',
            textAlign: 'center',
            wordBreak: 'break-word',
            color: '#000000',
            flexShrink: 0
          }}
          title={product.name}
        >
          {product.name || 'Producto sin nombre'}
        </div>
      )}

      {/* 3. Código de Barras (react-barcode) */}
      {hasBarcode && (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            flexShrink: 0
          }}
        >
          <Barcode
            value={sku}
            width={barcodeWidth}
            height={barcodeHeight}
            fontSize={barcodeFontSize}
            margin={0}
            displayValue={true}
            textMargin={1}
            background="transparent"
            lineColor="#000000"
          />
        </div>
      )}

      {/* 4. Pie: Precio y/o Ubicación */}
      {hasFooter && (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: (showPrice && showLocation && location) ? 'space-between' : 'center',
            alignItems: 'center',
            lineHeight: 1,
            flexShrink: 0
          }}
        >
          {showLocation && location && (
            <span
              style={{
                fontSize: locationSize,
                color: '#334155',
                fontWeight: '600',
                maxWidth: (showPrice && priceFormatted) ? '20mm' : '46mm',
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
                fontSize: priceSize,
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
