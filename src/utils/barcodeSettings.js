'use client';

export const DEFAULT_LABEL_SETTINGS = {
  rollType: 'double', // 'double' = 108mm x 25mm (2 columnas), 'single' = 50mm x 25mm (1 columna)
  showBrandName: true, // "BIKEKING SPORTS"
  showLogo: false, // Logo oficial (/logo.png)
  showProductName: true, // Nombre del producto
  showBarcode: true, // Gráfico de barras SVG + SKU
  showPrice: true, // PVP formateado
  showProductBrand: true, // Marca del producto (ej: Shimano, West Biking)
  showLocation: false, // Ubicación en bodega / vitrina
};

const STORAGE_KEY = 'bikeking_label_print_settings';

export const getLabelSettings = () => {
  if (typeof window === 'undefined') return DEFAULT_LABEL_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_LABEL_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.error('Error loading barcode settings:', err);
  }
  return DEFAULT_LABEL_SETTINGS;
};

export const saveLabelSettings = (settings) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving barcode settings:', err);
  }
};

/**
 * Expande una lista de { product, quantity } a una lista plana de etiquetas,
 * y luego la agrupa en filas según rollType:
 * - 'double': filas de 2 etiquetas [ [itemA, itemB], [itemC, null] ]
 * - 'single': filas de 1 etiqueta [ [itemA], [itemB], [itemC] ]
 */
export const buildPrintRows = (itemsWithQty, rollType = 'double') => {
  const flatLabels = [];

  itemsWithQty.forEach(({ product, quantity }) => {
    const qty = Math.max(0, parseInt(quantity, 10) || 0);
    for (let i = 0; i < qty; i++) {
      flatLabels.push({ ...product, _instanceId: `${product.id || product.sku}-${i}-${Math.random()}` });
    }
  });

  if (rollType === 'single') {
    return flatLabels.map(label => [label]);
  }

  // Double roll: 2 columnas por fila
  const rows = [];
  for (let i = 0; i < flatLabels.length; i += 2) {
    rows.push([
      flatLabels[i],
      flatLabels[i + 1] || null // null si la última fila tiene etiqueta impar
    ]);
  }
  return rows;
};
