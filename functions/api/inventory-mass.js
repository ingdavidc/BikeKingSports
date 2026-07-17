export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // Auto-create missing tables on the fly
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS product_providers (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          provider_id TEXT NOT NULL,
          is_main BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
      )
    `).run();

    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS purchase_invoices (
          id TEXT PRIMARY KEY,
          provider_id TEXT NOT NULL,
          invoice_number TEXT,
          total_amount REAL,
          date DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (provider_id) REFERENCES providers(id)
      )
    `).run();

    const { provider, products } = await request.json();

    if (!provider || !provider.name) {
      return Response.json({ success: false, error: 'Falta información del proveedor.' }, { status: 400 });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return Response.json({ success: false, error: 'No hay productos para procesar.' }, { status: 400 });
    }

    let providerId = provider.id;

    // Check if provider exists by document or name, or create
    if (!providerId) {
      // Intentar buscar proveedor existente
      let existingProvider = null;
      if (provider.document) {
        existingProvider = await env.DB.prepare('SELECT id FROM providers WHERE document = ?').bind(provider.document).first();
      }
      if (!existingProvider && provider.name) {
        existingProvider = await env.DB.prepare('SELECT id FROM providers WHERE name = ?').bind(provider.name).first();
      }

      if (existingProvider) {
        providerId = existingProvider.id;
      } else {
        providerId = crypto.randomUUID();
        await env.DB.prepare(
          'INSERT INTO providers (id, name, document, email, phone) VALUES (?, ?, ?, ?, ?)'
        )
          .bind(providerId, provider.name, provider.document || '', provider.email || '', provider.phone || '')
          .run();
      }
    }

    // Register invoice
    const invoiceId = crypto.randomUUID();
    const totalAmount = products.reduce((acc, p) => acc + (Number(p.price || 0) * Number(p.quantity || 1)), 0);
    
    await env.DB.prepare(
      'INSERT INTO purchase_invoices (id, provider_id, invoice_number, total_amount) VALUES (?, ?, ?, ?)'
    )
      .bind(invoiceId, providerId, provider.invoice_number || '', totalAmount)
      .run();

    // Process products
    for (const prod of products) {
      let productId = null;
      let isNew = false;
      const sku = prod.sku || '';

      // Check if product exists
      if (sku) {
        const existingBySku = await env.DB.prepare('SELECT id, stock, price FROM products WHERE sku = ?').bind(sku).first();
        if (existingBySku) {
          productId = existingBySku.id;
          prod.db_price = existingBySku.price;
        }
      }

      if (!productId && prod.name) {
        const existingByName = await env.DB.prepare('SELECT id, stock, price FROM products WHERE name = ?').bind(prod.name).first();
        if (existingByName) {
          productId = existingByName.id;
          prod.db_price = existingByName.price;
        }
      }

      if (productId) {
        const quantityToAdd = Number(prod.quantity) || 0;
        
        let newPrice = Number(prod.db_price) || 0;
        const invoicePrice = Number(prod.price) || 0;
        const priceAction = prod.priceAction || 'overwrite'; // Changed from keep to overwrite per user request

        if (priceAction === 'overwrite') {
          newPrice = invoicePrice;
        } else if (priceAction === 'average') {
          if (newPrice > 0 && invoicePrice > 0) {
            newPrice = (newPrice + invoicePrice) / 2;
          } else {
            newPrice = invoicePrice || newPrice;
          }
        }

        if (quantityToAdd > 0 || priceAction !== 'keep' || prod.category) {
          const catUpdate = prod.category ? ', category = ?' : '';
          const query = `UPDATE products SET stock = stock + ?, price = ?${catUpdate} WHERE id = ?`;
          
          if (prod.category) {
            await env.DB.prepare(query)
              .bind(quantityToAdd, newPrice, prod.category, productId)
              .run();
          } else {
            await env.DB.prepare(query)
              .bind(quantityToAdd, newPrice, productId)
              .run();
          }
        }
      } else {
        // Create new product
        productId = crypto.randomUUID();
        isNew = true;
        await env.DB.prepare(
          'INSERT INTO products (id, name, category, sku, price, stock, tax_rate) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
          .bind(
            productId, 
            prod.name, 
            prod.category || 'General', 
            sku, 
            prod.price || 0, 
            prod.quantity || 0, 
            prod.tax || 0
          )
          .run();
      }

      // Check if relationship product_providers exists, if not, create it
      const relation = await env.DB.prepare('SELECT id FROM product_providers WHERE product_id = ? AND provider_id = ?')
        .bind(productId, providerId)
        .first();

      if (!relation) {
        // Si es producto nuevo, este es su proveedor principal
        await env.DB.prepare(
          'INSERT INTO product_providers (id, product_id, provider_id, is_main) VALUES (?, ?, ?, ?)'
        )
          .bind(crypto.randomUUID(), productId, providerId, isNew ? 1 : 0)
          .run();
      }
    }

    return Response.json({ success: true, message: 'Factura y productos procesados exitosamente.' });

  } catch (error) {
    console.error('Error masivo de inventario:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
