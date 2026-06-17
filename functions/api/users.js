// ============================================================
// functions/api/users.js
// CRUD de usuarios. Solo accesible por admins (verificado en _middleware.js).
// ============================================================

const VALID_ROLES = ['admin', 'ventas', 'mecanico'];
const MAX_NAME_LENGTH = 100;
const MAX_PASSWORD_LENGTH = 128;

// PBKDF2 — compatible con Edge Runtime de Cloudflare
async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: 100000 },
    keyMaterial,
    256
  );
  const hashArray = Array.from(new Uint8Array(bits));
  return btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function sanitizeString(str, maxLen) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

export async function onRequestGet(context) {
  const role = context.data?.role;
  if (role !== 'admin') {
    return Response.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    const DB = context.env.DB;
    const { results } = await DB.prepare(
      'SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC'
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

  let body;
  try {
    body = await context.request.json();
  } catch {
    return Response.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
  }

  const { action, payload } = body;
  if (!action || typeof action !== 'string' || !payload || typeof payload !== 'object') {
    return Response.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const DB = context.env.DB;
  const PBKDF2_SALT = context.env.PASSWORD_SALT || 'bikeking_pbkdf2_salt_2026';

  try {
    // ─── Agregar usuario ───────────────────────────────────────
    if (action === 'add_user') {
      const name = sanitizeString(payload.name, MAX_NAME_LENGTH);
      const email = sanitizeString(payload.email, 254).toLowerCase();
      const password = typeof payload.password === 'string' ? payload.password : '';
      const newRole = sanitizeString(payload.role, 20);

      if (!name || !email || !password || !newRole) {
        return Response.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
      }
      if (!VALID_ROLES.includes(newRole)) {
        return Response.json({ error: 'Rol inválido' }, { status: 400 });
      }
      if (password.length < 8) {
        return Response.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
      }
      if (password.length > MAX_PASSWORD_LENGTH) {
        return Response.json({ error: 'Contraseña demasiado larga' }, { status: 400 });
      }

      const existing = await DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
      if (existing) {
        return Response.json({ error: 'El correo ya está registrado' }, { status: 409 });
      }

      const id = crypto.randomUUID();
      const password_hash = await hashPassword(password, PBKDF2_SALT);
      await DB.prepare(
        'INSERT INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(id, name, email, password_hash, newRole, 'activo').run();

      return Response.json({ success: true, id });
    }

    // ─── Actualizar usuario ────────────────────────────────────
    if (action === 'update_user') {
      const { id } = payload;
      const name = sanitizeString(payload.name, MAX_NAME_LENGTH);
      const newRole = sanitizeString(payload.role, 20);
      const password = typeof payload.password === 'string' ? payload.password : '';

      if (!id || typeof id !== 'string' || !name || !newRole) {
        return Response.json({ error: 'Campos requeridos incompletos' }, { status: 400 });
      }
      if (!VALID_ROLES.includes(newRole)) {
        return Response.json({ error: 'Rol inválido' }, { status: 400 });
      }

      // Prevenir que el último admin sea degradado
      if (newRole !== 'admin') {
        const currentUser = await DB.prepare('SELECT role FROM users WHERE id = ?').bind(id).first();
        if (currentUser?.role === 'admin') {
          const { results: admins } = await DB.prepare(
            "SELECT id FROM users WHERE role = 'admin' AND status = 'activo'"
          ).all();
          if (admins.length <= 1) {
            return Response.json({ error: 'No puedes cambiar el rol del único administrador activo' }, { status: 400 });
          }
        }
      }

      if (password) {
        if (password.length < 8) {
          return Response.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
        }
        if (password.length > MAX_PASSWORD_LENGTH) {
          return Response.json({ error: 'Contraseña demasiado larga' }, { status: 400 });
        }
        const password_hash = await hashPassword(password, PBKDF2_SALT);
        await DB.prepare('UPDATE users SET name = ?, role = ?, password_hash = ? WHERE id = ?')
          .bind(name, newRole, password_hash, id).run();
      } else {
        await DB.prepare('UPDATE users SET name = ?, role = ? WHERE id = ?')
          .bind(name, newRole, id).run();
      }
      return Response.json({ success: true });
    }

    // ─── Cambiar estado activo/inactivo ────────────────────────
    if (action === 'update_status') {
      const { id, status } = payload;
      if (!id || typeof id !== 'string') {
        return Response.json({ error: 'ID de usuario requerido' }, { status: 400 });
      }
      const validStatuses = ['activo', 'inactivo'];
      if (!validStatuses.includes(status)) {
        return Response.json({ error: 'Estado inválido' }, { status: 400 });
      }

      // Prevenir desactivar el último admin
      if (status === 'inactivo') {
        const targetUser = await DB.prepare('SELECT role FROM users WHERE id = ?').bind(id).first();
        if (targetUser?.role === 'admin') {
          const { results: admins } = await DB.prepare(
            "SELECT id FROM users WHERE role = 'admin' AND status = 'activo'"
          ).all();
          if (admins.length <= 1) {
            return Response.json({ error: 'No puedes desactivar al único administrador activo' }, { status: 400 });
          }
        }
      }

      await DB.prepare('UPDATE users SET status = ? WHERE id = ?').bind(status, id).run();
      return Response.json({ success: true });
    }

    // ─── Eliminar usuario ─────────────────────────────────────
    if (action === 'delete_user') {
      const { id } = payload;
      if (!id || typeof id !== 'string') {
        return Response.json({ error: 'ID de usuario requerido' }, { status: 400 });
      }

      // Prevenir eliminar el último admin
      const targetUser = await DB.prepare('SELECT role FROM users WHERE id = ?').bind(id).first();
      if (!targetUser) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });

      if (targetUser.role === 'admin') {
        const { results: admins } = await DB.prepare(
          "SELECT id FROM users WHERE role = 'admin' AND status = 'activo'"
        ).all();
        if (admins.length <= 1) {
          return Response.json({ error: 'No puedes eliminar al único administrador activo' }, { status: 400 });
        }
      }

      await DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Acción no válida' }, { status: 400 });

  } catch (error) {
    console.error('POST /api/users error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
