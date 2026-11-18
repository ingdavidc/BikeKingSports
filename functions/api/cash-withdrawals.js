// ============================================================
// functions/api/cash-withdrawals.js
// BIKE KING - Gestión de Retiros de Dinero y Cuadre de Caja
// ============================================================

export async function onRequest(context) {
  const { request } = context;
  const role = context.data?.role;
  if (!role) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (request.method === 'GET') {
    return handleGet(context);
  } else if (request.method === 'POST') {
    return handlePost(context);
  } else if (request.method === 'DELETE') {
    return handleDelete(context);
  }

  return new Response('Method Not Allowed', { status: 405 });
}

// ── GET: Listar retiros y calcular balance de caja en vivo ───
async function handleGet(context) {
  try {
    const DB = context.env.DB;
    const url = new URL(context.request.url);

    // Asegurar que la tabla existe
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS cash_withdrawals (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        reason TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        authorized_by TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Rango de hoy (desde las 00:00:00 del día actual)
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();

    // 1. Obtener retiros de dinero
    const [allWithdrawalsQuery, todayWithdrawalsQuery] = await Promise.all([
      DB.prepare('SELECT * FROM cash_withdrawals ORDER BY created_at DESC LIMIT 50').all(),
      DB.prepare('SELECT * FROM cash_withdrawals WHERE created_at >= ? ORDER BY created_at DESC').bind(todayStart).all(),
    ]);

    const withdrawals = allWithdrawalsQuery.results || [];
    const todayWithdrawals = todayWithdrawalsQuery.results || [];
    const todayTotalWithdrawals = todayWithdrawals.reduce((sum, w) => sum + Number(w.amount || 0), 0);

    // 2. Obtener ventas de hoy para el cuadre de caja
    const todaySalesQuery = await DB.prepare(`
      SELECT id, total, payment_method, status, amount_paid, payment_history, created_at 
      FROM sales 
      WHERE created_at >= ?
      ORDER BY created_at ASC
    `).bind(todayStart).all();

    const todaySales = todaySalesQuery.results || [];

    let todayCashSales = 0;       // Ventas pagadas en efectivo
    let todayOtherMethods = {};   // Nequi, Bancolombia, Tarjeta, etc.
    let todayTotalSalesRevenue = 0;

    for (const sale of todaySales) {
      const pm = (sale.payment_method || 'Otros').trim();
      const revenue = sale.amount_paid !== undefined && sale.amount_paid !== null 
        ? Number(sale.amount_paid) 
        : Number(sale.total || 0);

      todayTotalSalesRevenue += revenue;

      if (pm.toLowerCase() === 'efectivo') {
        todayCashSales += revenue;
      } else {
        todayOtherMethods[pm] = (todayOtherMethods[pm] || 0) + revenue;
      }
    }

    // Cuadre de caja exacto
    const expectedCashInDrawer = todayCashSales - todayTotalWithdrawals;

    return Response.json({
      success: true,
      withdrawals,
      todayWithdrawals,
      registerSummary: {
        todayDate: now.toISOString().slice(0, 10),
        todayTotalSalesRevenue,
        todayCashSales,
        todayTotalWithdrawals,
        expectedCashInDrawer,
        otherMethods: Object.entries(todayOtherMethods).map(([method, total]) => ({ method, total })),
        salesCountToday: todaySales.length,
        withdrawalsCountToday: todayWithdrawals.length,
      }
    });

  } catch (err) {
    console.error('GET /api/cash-withdrawals:', err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── POST: Registrar un nuevo retiro de efectivo ──────────────
async function handlePost(context) {
  try {
    const DB = context.env.DB;
    const user = context.data?.user;
    const body = await context.request.json();

    const amount = Number(body.amount);
    const reason = (body.reason || '').trim();
    const category = (body.category || 'general').trim();
    const authorized_by = (body.authorized_by || user?.name || 'Administrador').trim();
    const notes = (body.notes || '').trim();

    if (!amount || isNaN(amount) || amount <= 0) {
      return Response.json({ success: false, error: 'El monto a retirar debe ser mayor a 0' }, { status: 400 });
    }
    if (!reason) {
      return Response.json({ success: false, error: 'Debes indicar el motivo del retiro' }, { status: 400 });
    }

    // Asegurar que la tabla existe
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS cash_withdrawals (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        reason TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        authorized_by TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    const id = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    await DB.prepare(`
      INSERT INTO cash_withdrawals (id, amount, reason, category, authorized_by, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, amount, reason, category, authorized_by, notes, nowIso).run();

    return Response.json({
      success: true,
      id,
      withdrawal: {
        id,
        amount,
        reason,
        category,
        authorized_by,
        notes,
        created_at: nowIso
      }
    });

  } catch (err) {
    console.error('POST /api/cash-withdrawals:', err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── DELETE: Eliminar o anular un retiro (Admin) ──────────────
async function handleDelete(context) {
  const role = context.data?.role;
  if (role !== 'admin') {
    return Response.json({ success: false, error: 'Solo administradores pueden eliminar retiros' }, { status: 403 });
  }

  try {
    const DB = context.env.DB;
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return Response.json({ success: false, error: 'ID es requerido' }, { status: 400 });
    }

    await DB.prepare('DELETE FROM cash_withdrawals WHERE id = ?').bind(id).run();
    return Response.json({ success: true });

  } catch (err) {
    console.error('DELETE /api/cash-withdrawals:', err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
