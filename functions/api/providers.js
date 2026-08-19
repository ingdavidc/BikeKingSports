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
        'INSERT INTO providers (id, name, document, email, phone, contact_person, brands, category, website, address, payment_terms, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(
          id, 
          payload.name, 
          payload.document || '', 
          payload.email || '', 
          payload.phone || '',
          payload.contact_person || '',
          payload.brands || '',
          payload.category || '',
          payload.website || '',
          payload.address || '',
          payload.payment_terms || '',
          payload.notes || ''
        )
        .run();
      return Response.json({ success: true, id });
    }

    if (action === 'update') {
      await env.DB.prepare(
        'UPDATE providers SET name = ?, document = ?, email = ?, phone = ?, contact_person = ?, brands = ?, category = ?, website = ?, address = ?, payment_terms = ?, notes = ? WHERE id = ?'
      )
        .bind(
          payload.name, 
          payload.document || '', 
          payload.email || '', 
          payload.phone || '',
          payload.contact_person || '',
          payload.brands || '',
          payload.category || '',
          payload.website || '',
          payload.address || '',
          payload.payment_terms || '',
          payload.notes || '',
          payload.id
        )
        .run();
      return Response.json({ success: true });
    }

    if (action === 'delete') {
      try {
        // First, nullify any references in the products table to avoid FOREIGN KEY constraint failure
        await env.DB.prepare('UPDATE products SET supplier_id = NULL WHERE supplier_id = ?').bind(payload.id).run();
        await env.DB.prepare('UPDATE products SET alt_supplier_id = NULL WHERE alt_supplier_id = ?').bind(payload.id).run();
        
        // Then delete the provider
        await env.DB.prepare('DELETE FROM providers WHERE id = ?').bind(payload.id).run();
        return Response.json({ success: true });
      } catch (err) {
        if (err.message.includes('FOREIGN KEY')) {
          return Response.json({ success: false, error: 'No se puede eliminar el proveedor porque está vinculado a otros registros (compras o histórico).' }, { status: 400 });
        }
        throw err;
      }
    }

    return Response.json({ success: false, error: 'Acción inválida' }, { status: 400 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
