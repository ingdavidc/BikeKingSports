-- Base settings for the home page and global config
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Store Products
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workshop Services
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    video_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users / Staff Authentication
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'activo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default settings for the Home Page
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('home_hero_title', 'BIKE KING SPORTS');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('home_hero_subtitle', 'Taller Especializado y Tienda de Bicicletas');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('home_about_text', 'Somos unos locos apasionados por el ciclismo...');

-- Órdenes de Servicio / Trabajo del Taller
CREATE TABLE IF NOT EXISTS work_orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT DEFAULT '',
    bike_brand TEXT DEFAULT '',
    bike_model TEXT DEFAULT '',
    bike_serial TEXT DEFAULT '',
    problem_description TEXT NOT NULL,
    status TEXT DEFAULT 'recibida',
    priority TEXT DEFAULT 'normal',
    assigned_to TEXT DEFAULT '',
    service_notes TEXT DEFAULT '',
    checklist TEXT DEFAULT '{}',
    photos TEXT DEFAULT '[]',
    estimated_price REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

