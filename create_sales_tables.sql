CREATE TABLE IF NOT EXISTS customers (
    document TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL,
    work_order_id TEXT,
    customer_document TEXT,
    items TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    amount_paid REAL DEFAULT 0,
    payment_history TEXT DEFAULT '[]',
    transaction_ref TEXT,
    cash_received REAL,
    change_given REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_document) REFERENCES customers(document)
);
