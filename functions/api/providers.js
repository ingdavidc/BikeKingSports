export async function onRequest(context) {
  const { request, env } = context;
  const { method } = request;

  if (method === 'GET') {
    return handleGet(request, env);
  } else if (method === 'POST') {
    return handlePost(request, env);
  }

  return new Response('Method Not Allowed', { status: 405 });
}

async function handleGet(request, env) {
  try {
    const { results } = await env.DB.prepare('SELECT * FROM providers ORDER BY created_at DESC').all();
    return Response.json({ success: true, data: results });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function handlePost(request, env) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (action === 'add') {
      const id = crypto.randomUUID();
      await env.DB.prepare(
        'INSERT INTO providers (id, name, document, email, phone) VALUES (?, ?, ?, ?, ?)'
      )
        .bind(id, payload.name, payload.document || '', payload.email || '', payload.phone || '')
        .run();
      return Response.json({ success: true, id });
    }

    if (action === 'update') {
      await env.DB.prepare(
        'UPDATE providers SET name = ?, document = ?, email = ?, phone = ? WHERE id = ?'
      )
        .bind(payload.name, payload.document || '', payload.email || '', payload.phone || '', payload.id)
        .run();
      return Response.json({ success: true });
    }

    if (action === 'delete') {
      // Because of ON DELETE CASCADE, this will also remove product_providers entries for this provider
      await env.DB.prepare('DELETE FROM providers WHERE id = ?').bind(payload.id).run();
      return Response.json({ success: true });
    }

    return Response.json({ success: false, error: 'Acción inválida' }, { status: 400 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
