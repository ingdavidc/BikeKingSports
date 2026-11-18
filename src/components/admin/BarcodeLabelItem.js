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

  // Detectar qué secciones de contenido están activas y tienen datos
  const hasHeader = (showBrandName || (showProductBrand && brand));
  const hasName = showProductName && !!product.name;
  const hasBarcode = showBarcode && !!sku;
  const hasFooter = (showPrice && !!priceFormatted) || (showLocation && !!location);

  // Conteo de bloques de texto activos (0 a 3)
  const textRowsCount = (hasHeader ? 1 : 0) + (hasName ? 1 : 0) + (hasFooter ? 1 : 0);

  // 1. DIMENSIONAMIENTO DINÁMICO DEL CÓDIGO DE BARRAS
  // Si hay pocos elementos, aumentamos la altura y grosor de barras para ocupar el espacio
  let barcodeHeight = 24;
  let barcodeWidth = 1.15;
  let barcodeFontSize = 9;

  if (hasBarcode) {
    if (textRowsCount === 0) {
      // Solo código de barras
      barcodeHeight = 52;
      barcodeWidth = 1.35;
      barcodeFontSize = 11;
    } else if (textRowsCount === 1) {
      // 1 bloque de texto + código de barras (ej. Solo BIKEKING + Código, o Solo Nombre + Código)
      barcodeHeight = 40;
      barcodeWidth = 1.25;
      barcodeFontSize = 10;
    } else if (textRowsCount === 2) {
      // 2 bloques de texto + código de barras (ej. Nombre + Código + Precio)
      barcodeHeight = 29;
      barcodeWidth = 1.2;
      barcodeFontSize = 9.5;
    } else {
      // Todo activo (Header + Nombre + Código + Footer)
      barcodeHeight = 22;
      barcodeWidth = 1.15;
      barcodeFontSize = 8.5;
    }
  }

  // 2. DISTRIBUCIÓN VERTICAL Y ESPACIADO DINÁMICO
  let containerJustify = 'center';
  let containerGap = '1.4mm';
  let containerPadding = '0.8mm 1.5mm';

  if (!hasBarcode) {
    containerJustify = 'center';
    containerGap = textRowsCount <= 2 ? '2mm' : '1.2mm';
  } else if (textRowsCount === 0) {
    containerJustify = 'center';
    containerGap = '0px';
  } else if (textRowsCount === 1) {
    // Si solo hay 1 texto y el código de barras, centramos verticalmente con separación armoniosa
    containerJustify = 'center';
    containerGap = '1.5mm';
    containerPadding = '1mm 1.5mm';
  } else if (textRowsCount === 2) {
    containerJustify = 'space-evenly';
    containerGap = '0.8mm';
    containerPadding = '0.8mm 1.5mm';
  } else {
    // 3 bloques de texto (máxima ocupación)
    containerJustify = 'space-between';
    containerGap = '0.3mm';
    containerPadding = '0.5mm 1.5mm';
  }

  // 3. TIPOGRAFÍAS DINÁMICAS (Escalan si hay más espacio disponible)
  const brandNameSize = textRowsCount === 1 ? '12px' : (textRowsCount === 2 ? '9.5px' : '8.5px');
  const brandNameLetterSpacing = textRowsCount === 1 ? '1px' : '0.6px';

  const productNameSize = textRowsCount === 1 ? '10.5px' : (textRowsCount === 2 ? '9.5px' : '8.5px');
  const productNameLineHeight = textRowsCount === 1 ? 1.25 : 1.15;
  const productNameMaxLines = textRowsCount === 1 ? 3 : 2;
  const productNameMaxHeight = textRowsCount === 1 ? '8.5mm' : (textRowsCount === 2 ? '6mm' : '4.6mm');

  const priceSize = textRowsCount === 1 ? '12.5px' : (textRowsCount === 2 ? '11px' : '9.5px');
  const productBrandSize = textRowsCount === 1 ? '9px' : '7.5px';
  const locationSize = textRowsCount === 1 ? '9px' : '7.5px';

  return (
    <div
      className="barcode-single-label"
      style={{
        width: '50mm',
        height: '25mm',
        minWidth: '50mm',
        maxWidth: '50mm',
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
      {/* 1. Header: Marca corporativa BIKEKING y/o Marca del Producto */}
      {hasHeader && (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: (showBrandName && showProductBrand && brand) ? 'space-between' : 'center',
            alignItems: 'center',
            lineHeight: 1,
            flexShrink: 0
          }}
        >
          {showBrandName && (
            <span
              style={{
                fontSize: brandNameSize,
                fontWeight: '900',
                letterSpacing: brandNameLetterSpacing,
                color: '#000000'
              }}
            >
              BIKEKING
            </span>
          )}
          {showProductBrand && brand && (
            <span
              style={{
                fontSize: productBrandSize,
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
                maxWidth: (showPrice && priceFormatted) ? '22mm' : '46mm',
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
