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
  catch { return Response.json({ error: 'Cuerpo invÃ¡lido' }, { status: 400 }); }

  const { items, payment_method, work_order_id, total, customer, amount_paid, status, transaction_ref, cash_received, change_given } = body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'La venta debe contener artículos' }, { status: 400 });
  }
  if (!payment_method) {
    return Response.json({ error: 'Método de pago requerido' }, { status: 400 });
  }

  const DB = context.env.DB;
  const saleId = crypto.randomUUID();
  const itemsJson = JSON.stringify(items);
  let customerDoc = null;

  try {
    const stmts = [];

    // 0. Si hay cliente, insertarlo o actualizarlo
    if (customer && customer.document) {
      customerDoc = customer.document;
      stmts.push(
        DB.prepare(`
          INSERT INTO customers (document, name, email, phone) 
          VALUES (?, ?, ?, ?)
          ON CONFLICT(document) DO UPDATE SET 
            name = excluded.name, 
            email = excluded.email, 
            phone = excluded.phone
        `).bind(customerDoc, customer.name || '', customer.email || '', customer.phone || '')
      );
    }
    
    const saleStatus = status || 'completed';
    const saleAmountPaid = amount_paid !== undefined ? amount_paid : total;
    const initialPaymentHistory = saleAmountPaid > 0 ? JSON.stringify([{
      date: new Date().toISOString(),
      amount: saleAmountPaid,
      method: payment_method,
      reference: transaction_ref || null
    }]) : '[]';

    // 1. Crear el registro de la venta
    stmts.push(
      DB.prepare('INSERT INTO sales (id, total, payment_method, work_order_id, customer_document, items, status, amount_paid, payment_history, transaction_ref, cash_received, change_given) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(saleId, total, payment_method, work_order_id || null, customerDoc, itemsJson, saleStatus, saleAmountPaid, initialPaymentHistory, transaction_ref || null, cash_received || null, change_given || null)
    );

    // 2. Deducir stock para cada item
    for (const item of items) {
      if (item.sku && item.quantity) {
        stmts.push(
          DB.prepare('UPDATE products SET stock = stock - ? WHERE sku = ?')
            .bind(item.quantity, item.sku)
        );
      }
    }

    // 3. Si hay work_order_id, sumamos el total al estimated_price de la orden de taller
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

export async function onRequestPut(context) {
  const role = context.data?.role;
  if (!role) return Response.json({ error: 'No autorizado' }, { status: 401 });

  let body;
  try { body = await context.request.json(); }
  catch { return Response.json({ error: 'Cuerpo inválido' }, { status: 400 }); }

  const { id, payment_amount, payment_method } = body;
  
  if (!id || !payment_amount || !payment_method) {
    return Response.json({ error: 'Faltan campos' }, { status: 400 });
  }

  const DB = context.env.DB;

  try {
    const sale = await DB.prepare('SELECT * FROM sales WHERE id = ?').bind(id).first();
    if (!sale) return Response.json({ error: 'Venta no encontrada' }, { status: 404 });

    const newAmountPaid = (sale.amount_paid || 0) + parseFloat(payment_amount);
    let newStatus = sale.status;
    if (newAmountPaid >= sale.total) {
      newStatus = 'completed';
    }

    let history = [];
    try { history = JSON.parse(sale.payment_history || '[]'); } catch (e) {}
    
    history.push({
      date: new Date().toISOString(),
      amount: parseFloat(payment_amount),
      method: payment_method
    });

    await DB.prepare('UPDATE sales SET amount_paid = ?, status = ?, payment_history = ? WHERE id = ?')
      .bind(newAmountPaid, newStatus, JSON.stringify(history), id).run();

    return Response.json({ success: true, newStatus, newAmountPaid });
  } catch (err) {
    console.error('PUT /api/sales:', err);
    return Response.json({ error: 'Error al registrar abono' }, { status: 500 });
  }
}
