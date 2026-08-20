export async function onRequestGet(context) {
  try {
    const { id } = context.params;
    const DB = context.env.DB;

    const sale = await DB.prepare('SELECT * FROM sales WHERE id = ?').bind(id).first();
    if (!sale) return Response.json({ error: 'Venta no encontrada' }, { status: 404 });

    // Intentar traer los datos del cliente si existe
    let customerData = null;
    if (sale.customer_document) {
      customerData = await DB.prepare('SELECT * FROM customers WHERE document = ?').bind(sale.customer_document).first();
    }

    return Response.json({
      ...sale,
      customer: customerData
    });

  } catch (err) {
    console.error('GET /api/sales/[id]:', err);
    return Response.json({ error: 'Error al obtener la venta' }, { status: 500 });
  }
}
