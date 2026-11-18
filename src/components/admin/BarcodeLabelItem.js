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
          width: isPreview ? '50mm' : '48.5mm',
          height: isPreview ? '25mm' : '24.5mm',
          minWidth: isPreview ? '50mm' : '48.5mm',
          maxWidth: isPreview ? '50mm' : '48.5mm',
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
  const skuLength = (sku || '').length;
  const priceFormatted = product.price ? `$${Number(product.price).toLocaleString('es-CO')}` : null;
  const brand = (product.brand || '').trim();
  const location = (product.location || '').trim();

  // Detectar qué secciones de contenido están activas y tienen datos
  const hasCorporateBrand = showBrandName || showLogo;
  const hasHeader = hasCorporateBrand || (showProductBrand && brand);
  const hasName = showProductName && !!product.name;
  const hasBarcode = showBarcode && !!sku;
  const hasFooter = (showPrice && !!priceFormatted) || (showLocation && !!location);

  const isLongName = (product.name || '').length > 30;
  const isVeryLongName = (product.name || '').length > 48;

  // 1. CÁLCULO INTELIGENTE DEL ANCHO DEL MÓDULO DEL CÓDIGO (barcodeWidth)
  // Aprovecha al máximo los ~48.5mm de ancho sin cortar márgenes
  let barcodeWidth = 1.25;
  if (skuLength > 15) {
    barcodeWidth = 0.95;
  } else if (skuLength > 12) {
    barcodeWidth = 1.05;
  } else if (skuLength > 9) {
    barcodeWidth = 1.18;
  } else {
    // 9 caracteres o menos (ej: BK-722919) -> 1.26 aprovecha ~40mm
    barcodeWidth = 1.26;
  }

  // 2. DIMENSIONES Y ALTURAS DINÁMICAS (Llenado inteligente sin desperdiciar espacio)
  let barcodeHeight = 22;
  let barcodeFontSize = 8.5;
  let brandNameSize = '8.5px';
  let brandNameLetterSpacing = '0.3px';
  let productNameSize = '8px';
  let productNameLineHeight = 1.15;
  let productNameMaxLines = 2;
  let productNameMaxHeight = '4.5mm';
  let priceSize = '10px';
  let productBrandSize = '7.5px';
  let locationSize = '7.5px';
  let logoHeight = '3.5mm';
  let logoMaxHeight = '14px';
  let containerPadding = '0.6mm 1mm';
  let containerGap = '0.4mm';
  let containerJustify = 'space-between';

  if (!hasBarcode) {
    // CASO SIN CÓDIGO DE BARRAS (solo texto informativo)
    containerJustify = 'space-around';
    containerGap = '1mm';
    containerPadding = '1mm 1.5mm';
    brandNameSize = '11.5px';
    brandNameLetterSpacing = '0.5px';
    logoHeight = '5.5mm';
    logoMaxHeight = '22px';
    productNameSize = hasHeader && hasFooter ? '10px' : '12px';
    productNameMaxHeight = hasHeader && hasFooter ? '9mm' : '13mm';
    productNameMaxLines = hasHeader && hasFooter ? 3 : 5;
    priceSize = '15px';
    productBrandSize = '9.5px';
    locationSize = '9.5px';
  } else if (!hasName) {
    // CASO SIN NOMBRE DE PRODUCTO (¡Espacio vertical disponible para llenado óptimo!)
    if (hasHeader && hasFooter) {
      // Caso exacto: BIKE KING SPORTS + CÓDIGO + PVP
      barcodeHeight = 36;
      barcodeFontSize = 9.5;
      brandNameSize = '11.5px';
      brandNameLetterSpacing = '0.5px';
      priceSize = '13.5px';
      productBrandSize = '9px';
      locationSize = '8.5px';
      logoHeight = '4.8mm';
      logoMaxHeight = '18px';
      containerPadding = '0.8mm 1.2mm';
      containerGap = '0.4mm';
      containerJustify = 'space-between';
    } else if (hasHeader && !hasFooter) {
      // Solo Marca corporativa + Código
      barcodeHeight = 46;
      barcodeFontSize = 10;
      barcodeWidth = skuLength <= 9 ? 1.32 : barcodeWidth;
      brandNameSize = '12px';
      brandNameLetterSpacing = '0.8px';
      productBrandSize = '10px';
      logoHeight = '6mm';
      logoMaxHeight = '24px';
      containerPadding = '1mm 1.5mm';
      containerJustify = 'space-around';
    } else if (!hasHeader && hasFooter) {
      // Solo Código + PVP
      barcodeHeight = 44;
      barcodeFontSize = 10;
      barcodeWidth = skuLength <= 9 ? 1.32 : barcodeWidth;
      priceSize = '14.5px';
      locationSize = '9.5px';
      containerPadding = '1mm 1.5mm';
      containerJustify = 'space-around';
    } else {
      // Solo Código de barras absoluto
      barcodeHeight = 56;
      barcodeFontSize = 11;
      barcodeWidth = skuLength <= 9 ? 1.38 : (skuLength <= 12 ? 1.22 : 1.05);
      containerPadding = '1mm 1.5mm';
      containerJustify = 'center';
    }
  } else {
    // CASO CON NOMBRE DE PRODUCTO (Distribución compacta y equilibrada)
    if (hasHeader && hasFooter) {
      // Todo activo (Header + Nombre + Código + PVP)
      barcodeHeight = isLongName ? 20 : 24;
      barcodeFontSize = 8;
      barcodeWidth = skuLength > 12 ? 0.95 : (skuLength > 9 ? 1.02 : 1.08);
      brandNameSize = '8px';
      brandNameLetterSpacing = '0.2px';
      productNameSize = isVeryLongName ? '7.5px' : '8.2px';
      productNameMaxHeight = isLongName ? '4.2mm' : '3.6mm';
      productNameMaxLines = 2;
      priceSize = '9.5px';
      productBrandSize = '7px';
      locationSize = '7px';
      logoHeight = '3.2mm';
      logoMaxHeight = '12px';
      containerPadding = '0.5mm 1mm';
      containerGap = '0.2mm';
      containerJustify = 'space-between';
    } else if (hasHeader && !hasFooter) {
      // Header + Nombre + Código (sin precio)
      barcodeHeight = isLongName ? 26 : 30;
      barcodeFontSize = 8.5;
      barcodeWidth = skuLength > 12 ? 1.0 : (skuLength > 9 ? 1.1 : 1.16);
      brandNameSize = '9px';
      brandNameLetterSpacing = '0.3px';
      productNameSize = isLongName ? '8.5px' : '9.5px';
      productNameMaxHeight = isLongName ? '5.5mm' : '4.5mm';
      productNameMaxLines = 2;
      productBrandSize = '8px';
      logoHeight = '3.8mm';
      logoMaxHeight = '15px';
      containerPadding = '0.6mm 1.2mm';
      containerGap = '0.3mm';
      containerJustify = 'space-between';
    } else if (!hasHeader && hasFooter) {
      // Nombre + Código + PVP (sin header corporativo)
      barcodeHeight = isLongName ? 26 : 30;
      barcodeFontSize = 8.5;
      barcodeWidth = skuLength > 12 ? 1.0 : (skuLength > 9 ? 1.1 : 1.16);
      productNameSize = isLongName ? '8.5px' : '9.5px';
      productNameMaxHeight = isLongName ? '5.5mm' : '4.5mm';
      productNameMaxLines = 2;
      priceSize = '11.5px';
      locationSize = '8px';
      containerPadding = '0.6mm 1.2mm';
      containerGap = '0.3mm';
      containerJustify = 'space-between';
    } else {
      // Solo Nombre + Código
      barcodeHeight = isLongName ? 34 : 40;
      barcodeFontSize = 9;
      barcodeWidth = skuLength > 12 ? 1.08 : (skuLength > 9 ? 1.18 : 1.25);
      productNameSize = isLongName ? '9.5px' : '10.5px';
      productNameMaxHeight = isLongName ? '7mm' : '5.5mm';
      productNameMaxLines = isLongName ? 3 : 2;
      containerPadding = '0.8mm 1.5mm';
      containerJustify = 'space-around';
    }
  }

  return (
    <div
      className="barcode-single-label"
      style={{
        width: isPreview ? '50mm' : '48.5mm',
        height: isPreview ? '25mm' : '24.5mm',
        minWidth: isPreview ? '50mm' : '48.5mm',
        maxWidth: isPreview ? '50mm' : '48.5mm',
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
      {/* 1. Header: Logo y/o Marca corporativa BIKE KING SPORTS y/o Marca del Producto */}
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
                    height: logoHeight,
                    maxHeight: logoMaxHeight,
                    objectFit: 'contain',
                    filter: 'contrast(125%)'
                  }}
                />
              )}
              {showBrandName && (
                <span
                  style={{
                    fontSize: showLogo ? (hasName ? '7px' : '9.5px') : brandNameSize,
                    fontWeight: '900',
                    letterSpacing: brandNameLetterSpacing,
                    color: '#000000',
                    whiteSpace: 'nowrap'
                  }}
                >
                  BIKE KING SPORTS
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
