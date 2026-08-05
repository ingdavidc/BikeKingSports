export async function onRequestGet(context) {
  try {
    const DB = context.env.DB;
    const { searchParams } = new URL(context.request.url);
    const isPromo = searchParams.get('promo') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : null;

    if (isPromo) {
      // Get the most expensive product for the promo
      const promoProduct = await DB.prepare(`
        SELECT id, name, category, price, stock, image_url, min_stock_limit 
        FROM products 
        ORDER BY price DESC 
        LIMIT 1
      `).first();
      
      return Response.json({ success: true, data: promoProduct });
    }

    let query = `
      SELECT id, name, category, price, stock, image_url, min_stock_limit 
      FROM products 
      ORDER BY created_at DESC
    `;

    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    const { results } = await DB.prepare(query).all();

    return Response.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching public products:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
