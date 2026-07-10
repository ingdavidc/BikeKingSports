// functions/api/inventory.js

export async function onRequestGet(context) {
  try {
    const DB = context.env.DB;
    const { searchParams } = new URL(context.request.url);
    const search = searchParams.get('q');

    let query = 'SELECT * FROM products';
    let params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR sku LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

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
      INSERT INTO products (id, name, description, price, category, sku, stock, tax_rate, discount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.name || '',
      body.description || '',
      body.price || 0,
      body.category || 'General',
      body.sku || '',
      body.stock || 0,
      body.tax_rate || 0,
      body.discount || 0
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

    await DB.prepare(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, category = ?, sku = ?, stock = ?, tax_rate = ?, discount = ?
      WHERE id = ?
    `).bind(
      body.name,
      body.description,
      body.price,
      body.category,
      body.sku,
      body.stock,
      body.tax_rate,
      body.discount,
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
