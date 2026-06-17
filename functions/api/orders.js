// ============================================================
// functions/api/orders.js
// CRUD de órdenes de trabajo del taller.
// Mecánicos pueden crear y actualizar sus órdenes.
// Ventas pueden ver todas las órdenes (solo lectura de estado).
// Admins tienen acceso total.
// ============================================================

const VALID_STATUSES = ['recibida', 'en_proceso', 'lista', 'entregada'];
const VALID_PRIORITIES = ['urgente', 'normal', 'rutina'];
const MAX_TEXT = 1000;

function s(val, max = MAX_TEXT) {
  return typeof val === 'string' ? val.trim().slice(0, max) : '';
}

export async function onRequestGet(context) {
  const role = context.data?.role;
  if (!role) return Response.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const DB = context.env.DB;
    const { searchParams } = new URL(context.request.url);
    const filter = searchParams.get('status'); // filtrar por estado
    const serial = searchParams.get('serial'); // historial por serial

    let query = 'SELECT * FROM work_orders';
    let params = [];

    if (serial) {
      query += ' WHERE bike_serial = ?';
      params = [serial];
      query += ' ORDER BY created_at DESC';
    } else if (filter && VALID_STATUSES.includes(filter)) {
      query += ' WHERE status = ?';
      params = [filter];
      query += ' ORDER BY CASE priority WHEN \'urgente\' THEN 1 WHEN \'normal\' THEN 2 ELSE 3 END, created_at DESC';
    } else {
      query += ' ORDER BY CASE priority WHEN \'urgente\' THEN 1 WHEN \'normal\' THEN 2 ELSE 3 END, created_at DESC';
    }

    const { results } = params.length
      ? await DB.prepare(query).bind(...params).all()
      : await DB.prepare(query).all();

    return Response.json(results);
  } catch (err) {
    console.error('GET /api/orders:', err);
    return Response.json({ error: 'Error al obtener órdenes' }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  const role = context.data?.role;
  const user = context.data?.user;
  if (!role) return Response.json({ error: 'No autorizado' }, { status: 401 });

  if (role === 'ventas') {
    return Response.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  let body;
  try { body = await context.request.json(); }
  catch { return Response.json({ error: 'Cuerpo inválido' }, { status: 400 }); }

  const { action, payload } = body;
  if (!action || !payload || typeof payload !== 'object') {
    return Response.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const DB = context.env.DB;

  try {
    // ─── Crear orden ──────────────────────────────────────────
    if (action === 'create_order') {
      const customer_name = s(payload.customer_name, 200);
      const customer_phone = s(payload.customer_phone, 20);
      const bike_brand = s(payload.bike_brand, 100);
      const bike_model = s(payload.bike_model, 100);
      const bike_serial = s(payload.bike_serial, 100);
      const problem_description = s(payload.problem_description);
      const priority = VALID_PRIORITIES.includes(payload.priority) ? payload.priority : 'normal';
      const estimated_price = parseFloat(payload.estimated_price) || 0;
      const cl = payload.checklist ? JSON.stringify(payload.checklist) : '{}';
      const ph = payload.photos ? JSON.stringify(payload.photos) : '[]';

      if (!customer_name || !problem_description) {
        return Response.json({ error: 'Cliente y descripción del problema son requeridos' }, { status: 400 });
      }

      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      await DB.prepare(
        `INSERT INTO work_orders (id, customer_name, customer_phone, bike_brand, bike_model, bike_serial,
         problem_description, status, priority, assigned_to, estimated_price, checklist, photos, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'recibida', ?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, customer_name, customer_phone, bike_brand, bike_model, bike_serial,
             problem_description, priority, user?.name || '', estimated_price, cl, ph, now, now).run();

      return Response.json({ success: true, id });
    }

    // ─── Actualizar estado y diagnósticos (checklist/photos) ──
    if (action === 'update_status') {
      const { id, status, service_notes, checklist, photos } = payload;
      if (!id || typeof id !== 'string') return Response.json({ error: 'ID requerido' }, { status: 400 });
      if (!VALID_STATUSES.includes(status)) return Response.json({ error: 'Estado inválido' }, { status: 400 });

      const notes = s(service_notes);
      const cl = checklist ? JSON.stringify(checklist) : undefined;
      const ph = photos ? JSON.stringify(photos) : undefined;
      const now = new Date().toISOString();

      let query = 'UPDATE work_orders SET status = ?, service_notes = ?, updated_at = ?';
      let binds = [status, notes, now];

      if (cl !== undefined) { query += ', checklist = ?'; binds.push(cl); }
      if (ph !== undefined) { query += ', photos = ?'; binds.push(ph); }

      query += ' WHERE id = ?';
      binds.push(id);

      await DB.prepare(query).bind(...binds).run();

      return Response.json({ success: true });
    }

    // ─── Actualizar orden completa ────────────────────────────
    if (action === 'update_order') {
      if (role !== 'admin' && role !== 'mecanico') {
        return Response.json({ error: 'Acceso denegado' }, { status: 403 });
      }
      const { id } = payload;
      if (!id || typeof id !== 'string') return Response.json({ error: 'ID requerido' }, { status: 400 });

      const customer_name = s(payload.customer_name, 200);
      const customer_phone = s(payload.customer_phone, 20);
      const bike_brand = s(payload.bike_brand, 100);
      const bike_model = s(payload.bike_model, 100);
      const bike_serial = s(payload.bike_serial, 100);
      const problem_description = s(payload.problem_description);
      const priority = VALID_PRIORITIES.includes(payload.priority) ? payload.priority : 'normal';
      const estimated_price = parseFloat(payload.estimated_price) || 0;
      const service_notes = s(payload.service_notes);
      const now = new Date().toISOString();

      if (!customer_name || !problem_description) {
        return Response.json({ error: 'Cliente y descripción son requeridos' }, { status: 400 });
      }

      await DB.prepare(
        `UPDATE work_orders SET customer_name=?, customer_phone=?, bike_brand=?, bike_model=?, bike_serial=?,
         problem_description=?, priority=?, estimated_price=?, service_notes=?, updated_at=? WHERE id=?`
      ).bind(customer_name, customer_phone, bike_brand, bike_model, bike_serial,
             problem_description, priority, estimated_price, service_notes, now, id).run();

      return Response.json({ success: true });
    }

    // ─── Eliminar orden (solo admin) ──────────────────────────
    if (action === 'delete_order') {
      if (role !== 'admin') return Response.json({ error: 'Solo administradores pueden eliminar órdenes' }, { status: 403 });
      const { id } = payload;
      if (!id || typeof id !== 'string') return Response.json({ error: 'ID requerido' }, { status: 400 });

      await DB.prepare('DELETE FROM work_orders WHERE id = ?').bind(id).run();
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Acción no válida' }, { status: 400 });

  } catch (err) {
    console.error('POST /api/orders:', err);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
