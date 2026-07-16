export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
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
        const existingBySku = await env.DB.prepare('SELECT id, stock FROM products WHERE sku = ?').bind(sku).first();
        if (existingBySku) {
          productId = existingBySku.id;
        }
      }

      if (!productId && prod.name) {
        const existingByName = await env.DB.prepare('SELECT id, stock FROM products WHERE name = ?').bind(prod.name).first();
        if (existingByName) {
          productId = existingByName.id;
        }
      }

      if (productId) {
        // Update stock
        const quantityToAdd = Number(prod.quantity) || 0;
        if (quantityToAdd > 0) {
          await env.DB.prepare('UPDATE products SET stock = stock + ? WHERE id = ?')
            .bind(quantityToAdd, productId)
            .run();
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
            'General', 
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
