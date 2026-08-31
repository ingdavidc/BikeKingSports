export async function onRequestGet(context) {
  try {
    const DB = context.env.DB;
    const { searchParams } = new URL(context.request.url);
    const isPromo = searchParams.get('promo') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : null;

    if (isPromo) {
      // Get the most expensive product for the promo
      const promoProduct = await DB.prepare(`
        SELECT id, name, description, category, price, old_price, is_on_sale, stock, image_url, image_urls, min_stock_limit 
        FROM products 
        WHERE is_published = 1 OR is_published IS NULL
        ORDER BY price DESC 
        LIMIT 1
      `).first();
      
      return Response.json({ success: true, data: promoProduct });
    }

    const q = searchParams.get('q');
    
    let query = `
      SELECT id, name, description, category, price, old_price, is_on_sale, stock, image_url, image_urls, min_stock_limit 
      FROM products 
      WHERE (is_published = 1 OR is_published IS NULL)
    `;
    let params = [];

    if (q) {
      const terms = q.trim().split(/\s+/);
      const conditions = [];
      for (const term of terms) {
        conditions.push('(name LIKE ? OR sku LIKE ? OR category LIKE ?)');
        params.push(`%${term}%`, `%${term}%`, `%${term}%`);
      }
      query += ` AND (${conditions.join(' AND ')})`;
    }

    query += ` ORDER BY created_at DESC`;

    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    const { results } = await DB.prepare(query).bind(...params).all();

    return Response.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching public products:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
