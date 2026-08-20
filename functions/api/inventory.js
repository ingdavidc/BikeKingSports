// functions/api/inventory.js
export async function onRequestGet(context) {
  try {
    const DB = context.env.DB;
    const { searchParams } = new URL(context.request.url);
    const search = searchParams.get('q');

    let query = `
      SELECT p.*, prov.name as provider_name 
      FROM products p
      LEFT JOIN providers prov ON p.supplier_id = prov.id
    `;
    let params = [];

    if (search) {
      query += ' WHERE p.name LIKE ? OR p.sku LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC';

    const { results } = await DB.prepare(query).bind(...params).all();
    return Response.json({ success: true, data: results });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const DB = context.env.DB;
    const body = await context.request.json();
    const id = crypto.randomUUID();

    await DB.prepare(`
      INSERT INTO products (
        id, name, description, sku, category, brand, 
        stock, unit, min_stock_limit, max_stock_limit, location,
        cost, profit_margin, tax, price, 
        supplier_id, alt_supplier_id, image_url, is_published
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.name || '',
      body.description || '',
      body.sku || '',
      body.category || 'General',
      body.brand || '',
      body.stock || 0,
      body.unit || 'Und',
      body.minLimit || 10,
      body.maxLimit || 100,
      body.location || '',
      body.cost || 0,
      body.utilityPercent || 30,
      body.tax_rate || 19,
      body.price || 0,
      body.provider || null,
      body.altProvider || null,
      body.image || null,
      body.is_published !== undefined ? (body.is_published ? 1 : 0) : 1
    ).run();

    return Response.json({ success: true, id });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function onRequestPut(context) {
  try {
    const DB = context.env.DB;
    const body = await context.request.json();

    if (body.action === 'toggle_publish') {
      await DB.prepare('UPDATE products SET is_published = ? WHERE id = ?').bind(body.is_published ? 1 : 0, body.id).run();
      return Response.json({ success: true });
    }

    await DB.prepare(`
      UPDATE products 
      SET name = ?, description = ?, sku = ?, category = ?, brand = ?, 
          stock = ?, unit = ?, min_stock_limit = ?, max_stock_limit = ?, location = ?,
          cost = ?, profit_margin = ?, tax = ?, price = ?, 
          supplier_id = ?, alt_supplier_id = ?, image_url = ?, is_published = ?
      WHERE id = ?
    `).bind(
      body.name || '',
      body.description || '',
      body.sku || '',
      body.category || 'General',
      body.brand || '',
      body.stock || 0,
      body.unit || 'Und',
      body.minLimit || 10,
      body.maxLimit || 100,
      body.location || '',
      body.cost || 0,
      body.utilityPercent || 30,
      body.tax_rate || 19,
      body.price || 0,
      body.provider || null,
      body.altProvider || null,
      body.image || null,
      body.is_published !== undefined ? (body.is_published ? 1 : 0) : 1,
      body.id
    ).run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function onRequestDelete(context) {
  try {
    const DB = context.env.DB;
    const { searchParams } = new URL(context.request.url);
    const id = searchParams.get('id');

    if (!id) return Response.json({ success: false, error: 'ID is required' }, { status: 400 });

    await DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
