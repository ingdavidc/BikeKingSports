async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "bikeking_salt_123");
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestGet(context) {
  // SECURITY: _middleware.js ya verificó autenticación
  const role = context.data?.role;
  if (role !== 'admin') {
    return Response.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    const DB = context.env.DB;
    const { results } = await DB.prepare(
      "SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC"
    ).all();
    return Response.json(results);
  } catch (error) {
    console.error('GET /api/users error:', error);
    return Response.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  const role = context.data?.role;
  if (role !== 'admin') {
    return Response.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    const DB = context.env.DB;
    const body = await context.request.json();
    const { action, payload } = body;

    if (!action || !payload) {
      return Response.json({ error: 'Payload inválido' }, { status: 400 });
    }

    if (action === 'add_user') {
      const { name, email, password, role } = payload;

      if (!name || !email || !password || !role) {
        return Response.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
      }

      const validRoles = ['admin', 'ventas', 'tecnico'];
      if (!validRoles.includes(role)) {
        return Response.json({ error: 'Rol inválido' }, { status: 400 });
      }

      if (password.length < 6) {
        return Response.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
      }

      const existing = await DB.prepare("SELECT id FROM users WHERE email = ?").bind(email.toLowerCase().trim()).first();
      if (existing) {
        return Response.json({ error: 'El correo ya está registrado' }, { status: 409 });
      }

      const id = crypto.randomUUID();
      const password_hash = await hashPassword(password);

      await DB.prepare(
        "INSERT INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(id, name.trim(), email.toLowerCase().trim(), password_hash, role, 'activo').run();

      return Response.json({ success: true, id });
    }

    if (action === 'update_status') {
      const validStatuses = ['activo', 'inactivo'];
      if (!validStatuses.includes(payload.status)) {
        return Response.json({ error: 'Estado inválido' }, { status: 400 });
      }
      await DB.prepare("UPDATE users SET status = ? WHERE id = ?").bind(payload.status, payload.id).run();
      return Response.json({ success: true });
    }

    if (action === 'delete_user') {
      await DB.prepare("DELETE FROM users WHERE id = ?").bind(payload.id).run();
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/users error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
