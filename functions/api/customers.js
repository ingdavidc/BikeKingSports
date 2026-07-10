// ============================================================
// functions/api/customers.js
// CRUD de Clientes
// ============================================================

export async function onRequestGet(context) {
  const role = context.data?.role;
  if (!role) return Response.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const DB = context.env.DB;
    const { searchParams } = new URL(context.request.url);
    const document = searchParams.get('document');

    if (document) {
      // Buscar un cliente específico
      const customer = await DB.prepare('SELECT * FROM customers WHERE document = ?').bind(document).first();
      return Response.json({ success: true, data: customer || null });
    }

    // Listar clientes (los últimos 100)
    const { results } = await DB.prepare('SELECT * FROM customers ORDER BY created_at DESC LIMIT 100').all();
    return Response.json({ success: true, data: results });

  } catch (err) {
    console.error('GET /api/customers:', err);
    return Response.json({ error: 'Error al obtener clientes' }, { status: 500 });
  }
}
