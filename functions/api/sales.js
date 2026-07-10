// ============================================================
// functions/api/sales.js
// CRUD de Ventas y Punto de Venta (POS)
// ============================================================

export async function onRequestGet(context) {
  const role = context.data?.role;
  if (!role) return Response.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const DB = context.env.DB;
    // Fetch last 50 sales for history
    const { results } = await DB.prepare('SELECT * FROM sales ORDER BY created_at DESC LIMIT 50').all();
    return Response.json(results);
  } catch (err) {
    console.error('GET /api/sales:', err);
    return Response.json({ error: 'Error al obtener ventas' }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  const role = context.data?.role;
  if (!role) return Response.json({ error: 'No autorizado' }, { status: 401 });

  let body;
  try { body = await context.request.json(); }
  catch { return Response.json({ error: 'Cuerpo inválido' }, { status: 400 }); }

  const { items, payment_method, work_order_id, total } = body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'La venta debe contener artículos' }, { status: 400 });
  }
  if (!payment_method) {
    return Response.json({ error: 'Método de pago requerido' }, { status: 400 });
  }

  const DB = context.env.DB;
  const saleId = crypto.randomUUID();
  const itemsJson = JSON.stringify(items);

  try {
    // 1. Deducir stock del inventario
    // Cloudflare D1 batching allows us to execute multiple statements in one roundtrip
    const stmts = [];
    
    // Crear el registro de la venta
    stmts.push(
      DB.prepare('INSERT INTO sales (id, total, payment_method, work_order_id, items) VALUES (?, ?, ?, ?, ?)')
        .bind(saleId, total, payment_method, work_order_id || null, itemsJson)
    );

    // Deducir stock para cada item
    for (const item of items) {
      if (item.sku && item.quantity) {
        stmts.push(
          DB.prepare('UPDATE products SET stock = stock - ? WHERE sku = ?')
            .bind(item.quantity, item.sku)
        );
      }
    }

    // 2. Si hay work_order_id, sumamos el total al estimated_price de la orden de taller
    if (work_order_id) {
      stmts.push(
        DB.prepare('UPDATE work_orders SET estimated_price = estimated_price + ? WHERE id = ?')
          .bind(total, work_order_id)
      );
    }

    // Ejecutar transaccion (batch)
    await DB.batch(stmts);

    return Response.json({ success: true, id: saleId });

  } catch (err) {
    console.error('POST /api/sales:', err);
    return Response.json({ error: 'Error interno del servidor al registrar la venta' }, { status: 500 });
  }
}
