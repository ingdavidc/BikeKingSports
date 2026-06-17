// ============================================================
// functions/api/content.js
// Gestión de contenido del sitio: configuración, productos, servicios y eventos.
// GET es público (para que el sitio lo use). POST requiere autenticación.
// ============================================================

const VALID_TYPES = ['settings', 'products', 'services', 'events'];
const VALID_ACTIONS = ['update_setting', 'add_product', 'delete_product', 'update_product', 'add_service', 'delete_service', 'add_event', 'delete_event'];
const MAX_TEXT_LENGTH = 2000;
const MAX_URL_LENGTH = 500;

function sanitize(val, maxLen = MAX_TEXT_LENGTH) {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function sanitizePrice(val) {
  const num = parseFloat(val);
  return isNaN(num) || num < 0 ? 0 : Math.round(num * 100) / 100;
}

export async function onRequestGet(context) {
  try {
    const DB = context.env.DB;
    if (!DB) return Response.json({ error: 'Error de configuración del servidor' }, { status: 500 });

    const { searchParams } = new URL(context.request.url);
    const type = searchParams.get('type');

    if (!VALID_TYPES.includes(type)) {
      return Response.json({ error: 'Parámetro "type" inválido' }, { status: 400 });
    }

    if (type === 'settings') {
      const { results } = await DB.prepare('SELECT key, value FROM site_settings').all();
      const settingsObj = results.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {});
      return Response.json(settingsObj);
    }

    if (type === 'products') {
      const { results } = await DB.prepare(
        'SELECT id, name, description, price, image_url, category, created_at FROM products ORDER BY created_at DESC'
      ).all();
      return Response.json(results);
    }

    if (type === 'services') {
      const { results } = await DB.prepare(
        'SELECT id, name, description, price, video_url, created_at FROM services ORDER BY created_at DESC'
      ).all();
      return Response.json(results);
    }

    if (type === 'events') {
      const { results } = await DB.prepare(
        'SELECT id, title, date, description, image_url, created_at FROM events ORDER BY date DESC'
      ).all();
      return Response.json(results);
    }

  } catch (error) {
    console.error('GET /api/content error:', error);
    return Response.json({ error: 'Error al obtener contenido' }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  const role = context.data?.role;
  if (!role) return Response.json({ error: 'No autorizado' }, { status: 401 });

  let body;
  try {
    body = await context.request.json();
  } catch {
    return Response.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
  }

  const { action, payload } = body;

  if (!action || typeof action !== 'string' || !VALID_ACTIONS.includes(action)) {
    return Response.json({ error: 'Acción no válida' }, { status: 400 });
  }
  if (!payload || typeof payload !== 'object') {
    return Response.json({ error: 'Payload inválido' }, { status: 400 });
  }

  try {
    const DB = context.env.DB;

    // ─── Configuración del sitio ───────────────────────────────
    if (action === 'update_setting') {
      if (role !== 'admin' && role !== 'ventas') {
        return Response.json({ error: 'Acceso denegado' }, { status: 403 });
      }
      const key = sanitize(payload.key, 100);
      const value = sanitize(payload.value, MAX_TEXT_LENGTH);
      if (!key) return Response.json({ error: 'Clave requerida' }, { status: 400 });

      await DB.prepare(
        'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
      ).bind(key, value).run();
      return Response.json({ success: true });
    }

    // ─── Productos ─────────────────────────────────────────────
    if (action === 'add_product') {
      if (role !== 'admin' && role !== 'ventas') {
        return Response.json({ error: 'Acceso denegado' }, { status: 403 });
      }
      const name = sanitize(payload.name, 200);
      const description = sanitize(payload.description, MAX_TEXT_LENGTH);
      const price = sanitizePrice(payload.price);
      const image_url = sanitize(payload.image_url, MAX_URL_LENGTH);
      const category = sanitize(payload.category, 100);

      if (!name) return Response.json({ error: 'El nombre es requerido' }, { status: 400 });
      if (price <= 0) return Response.json({ error: 'El precio debe ser mayor a 0' }, { status: 400 });

      const id = crypto.randomUUID();
      await DB.prepare(
        'INSERT INTO products (id, name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(id, name, description, price, image_url, category).run();
      return Response.json({ success: true, id });
    }

    if (action === 'update_product') {
      if (role !== 'admin' && role !== 'ventas') {
        return Response.json({ error: 'Acceso denegado' }, { status: 403 });
      }
      const { id } = payload;
      if (!id || typeof id !== 'string') return Response.json({ error: 'ID requerido' }, { status: 400 });

      const name = sanitize(payload.name, 200);
      const description = sanitize(payload.description, MAX_TEXT_LENGTH);
      const price = sanitizePrice(payload.price);
      const image_url = sanitize(payload.image_url, MAX_URL_LENGTH);
      const category = sanitize(payload.category, 100);

      if (!name) return Response.json({ error: 'El nombre es requerido' }, { status: 400 });

      await DB.prepare(
        'UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, category = ? WHERE id = ?'
      ).bind(name, description, price, image_url, category, id).run();
      return Response.json({ success: true });
    }

    if (action === 'delete_product') {
      if (role !== 'admin' && role !== 'ventas') {
        return Response.json({ error: 'Acceso denegado' }, { status: 403 });
      }
      const { id } = payload;
      if (!id || typeof id !== 'string') return Response.json({ error: 'ID requerido' }, { status: 400 });

      await DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
      return Response.json({ success: true });
    }

    // ─── Servicios ─────────────────────────────────────────────
    if (action === 'add_service') {
      const name = sanitize(payload.name, 200);
      const description = sanitize(payload.description, MAX_TEXT_LENGTH);
      const price = sanitizePrice(payload.price);
      const video_url = sanitize(payload.video_url, MAX_URL_LENGTH);

      if (!name) return Response.json({ error: 'El nombre del servicio es requerido' }, { status: 400 });

      const id = crypto.randomUUID();
      await DB.prepare(
        'INSERT INTO services (id, name, description, price, video_url) VALUES (?, ?, ?, ?, ?)'
      ).bind(id, name, description, price, video_url).run();
      return Response.json({ success: true, id });
    }

    if (action === 'delete_service') {
      const { id } = payload;
      if (!id || typeof id !== 'string') return Response.json({ error: 'ID requerido' }, { status: 400 });
      await DB.prepare('DELETE FROM services WHERE id = ?').bind(id).run();
      return Response.json({ success: true });
    }

    // ─── Eventos ───────────────────────────────────────────────
    if (action === 'add_event') {
      if (role !== 'admin' && role !== 'ventas') {
        return Response.json({ error: 'Acceso denegado' }, { status: 403 });
      }
      const title = sanitize(payload.title, 200);
      const date = sanitize(payload.date, 20);
      const description = sanitize(payload.description, MAX_TEXT_LENGTH);
      const image_url = sanitize(payload.image_url, MAX_URL_LENGTH);

      if (!title || !date) {
        return Response.json({ error: 'El título y la fecha son requeridos' }, { status: 400 });
      }
      // Validar formato de fecha básico
      if (!/^\d{4}-\d{2}-\d{2}/.test(date)) {
        return Response.json({ error: 'Formato de fecha inválido (use YYYY-MM-DD)' }, { status: 400 });
      }

      const id = crypto.randomUUID();
      await DB.prepare(
        'INSERT INTO events (id, title, date, description, image_url) VALUES (?, ?, ?, ?, ?)'
      ).bind(id, title, date, description, image_url).run();
      return Response.json({ success: true, id });
    }

    if (action === 'delete_event') {
      if (role !== 'admin' && role !== 'ventas') {
        return Response.json({ error: 'Acceso denegado' }, { status: 403 });
      }
      const { id } = payload;
      if (!id || typeof id !== 'string') return Response.json({ error: 'ID requerido' }, { status: 400 });
      await DB.prepare('DELETE FROM events WHERE id = ?').bind(id).run();
      return Response.json({ success: true });
    }

  } catch (error) {
    console.error('POST /api/content error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
