const xlsx = require('xlsx');
const fs = require('fs');
const crypto = require('crypto');

const workbook = xlsx.readFile('INVENTARIO BIKE KING JUNIO 2026.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, {header: 1});

let sql = '-- 1. Actualizar esquema de productos\n';
sql += 'ALTER TABLE products ADD COLUMN sku TEXT;\n';
sql += 'ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;\n';
sql += 'ALTER TABLE products ADD COLUMN tax_rate REAL DEFAULT 0;\n';
sql += 'ALTER TABLE products ADD COLUMN discount REAL DEFAULT 0;\n\n';

sql += '-- 2. Insertar inventario inicial\n';
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (!row || row.length === 0 || !row[2]) continue;

  const sku = row[1] || '';
  const desc = (row[2] || '').toString().replace(/'/g, "''");
  const stock = parseFloat(row[3]) || 0;
  const tax = parseFloat(row[4]) || 0;
  const discount = parseFloat(row[5]) || 0;
  const unitPrice = parseFloat(row[6]) || 0;
  const id = crypto.randomUUID();

  sql += `INSERT INTO products (id, name, description, price, category, sku, stock, tax_rate, discount) VALUES ('${id}', '${desc}', '', ${unitPrice}, 'General', '${sku}', ${stock}, ${tax}, ${discount});\n`;
}

fs.writeFileSync('setup_inventory.sql', sql);
console.log('setup_inventory.sql generated.');
