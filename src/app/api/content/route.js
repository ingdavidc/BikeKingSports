import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const DB = getRequestContext().env.DB;
    if (!DB) {
      return Response.json({ error: 'DB binding not found' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'settings') {
      const { results } = await DB.prepare("SELECT * FROM site_settings").all();
      // Convert array of {key, value} to a single object {key: value}
      const settingsObj = results.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {});
      return Response.json(settingsObj);
    } 
    
    if (type === 'products') {
      const { results } = await DB.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
      return Response.json(results);
    }

    if (type === 'services') {
      const { results } = await DB.prepare("SELECT * FROM services ORDER BY created_at DESC").all();
      return Response.json(results);
    }

    if (type === 'events') {
      const { results } = await DB.prepare("SELECT * FROM events ORDER BY date DESC").all();
      return Response.json(results);
    }

    return Response.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const DB = getRequestContext().env.DB;
    const body = await request.json();
    const { action, payload } = body;

    if (action === 'update_setting') {
      await DB.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
        .bind(payload.key, payload.value)
        .run();
      return Response.json({ success: true });
    }

    if (action === 'add_product') {
      const id = crypto.randomUUID();
      await DB.prepare("INSERT INTO products (id, name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(id, payload.name, payload.description, payload.price, payload.image_url, payload.category)
        .run();
      return Response.json({ success: true, id });
    }

    if (action === 'delete_product') {
      await DB.prepare("DELETE FROM products WHERE id = ?").bind(payload.id).run();
      return Response.json({ success: true });
    }

    if (action === 'add_service') {
      const id = crypto.randomUUID();
      await DB.prepare("INSERT INTO services (id, name, description, price, video_url) VALUES (?, ?, ?, ?, ?)")
        .bind(id, payload.name, payload.description, payload.price, payload.video_url || '')
        .run();
      return Response.json({ success: true, id });
    }

    if (action === 'delete_service') {
      await DB.prepare("DELETE FROM services WHERE id = ?").bind(payload.id).run();
      return Response.json({ success: true });
    }

    if (action === 'add_event') {
      const id = crypto.randomUUID();
      await DB.prepare("INSERT INTO events (id, title, date, description, image_url) VALUES (?, ?, ?, ?, ?)")
        .bind(id, payload.title, payload.date, payload.description, payload.image_url || '')
        .run();
      return Response.json({ success: true, id });
    }

    if (action === 'delete_event') {
      await DB.prepare("DELETE FROM events WHERE id = ?").bind(payload.id).run();
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
