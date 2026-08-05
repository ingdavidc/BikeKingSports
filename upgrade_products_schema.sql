-- Migración: Estructura de Inventario Distrielectricos -> BikeKing
-- Este script realiza una migración segura usando una tabla temporal para no perder datos.

-- 1. Renombrar la tabla original para resguardar los datos
ALTER TABLE products RENAME TO products_old;

-- 2. Crear la nueva tabla con todos los campos del ERP
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    
    -- Identificación
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    commercial_name TEXT,
    description TEXT,
    features TEXT,
    brand TEXT,
    category TEXT,
    
    -- Inventario y Medidas
    unit TEXT DEFAULT 'Und',
    stock INTEGER DEFAULT 0,
    min_stock_limit INTEGER DEFAULT 10,
    max_stock_limit INTEGER,
    location TEXT,
    
    -- Costos y Precios
    cost REAL DEFAULT 0,
    profit_margin REAL DEFAULT 30,
    volume_discount REAL DEFAULT 0,
    tax REAL DEFAULT 19,
    price REAL NOT NULL,
    
    -- Proveedores e Imagen
    supplier_id TEXT,
    alt_supplier_id TEXT,
    image_url TEXT,
    image_urls TEXT DEFAULT '[]',
    technical_sheet_url TEXT,
    sales_count INTEGER DEFAULT 0,
    popularity INTEGER DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (supplier_id) REFERENCES providers(id),
    FOREIGN KEY (alt_supplier_id) REFERENCES providers(id)
);

-- 3. Copiar los datos de la tabla antigua a la nueva tabla, mapeando las columnas
INSERT INTO products (id, name, description, price, image_url, category, created_at, updated_at)
SELECT id, name, description, price, image_url, category, created_at, CURRENT_TIMESTAMP
FROM products_old;

-- 4. Borrar la tabla antigua (Descomentar si estás 100% seguro de que los datos migraron correctamente)
-- DROP TABLE products_old;
