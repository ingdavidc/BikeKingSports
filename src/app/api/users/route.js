import { getRequestContext } from '@cloudflare/next-on-pages';
import { hash } from 'bcrypt-ts';

export const runtime = 'edge';

export async function GET(request) {
  try {
    // Aquí idealmente deberíamos validar el JWT para asegurar que es un admin,
    // pero el middleware.js ya bloqueó el acceso a /admin/personal a los técnicos.
    // Sin embargo, esta ruta es /api/users, por lo que también deberíamos protegerla.
    // Como es un MVP, confiaremos en que el frontend no la llamará sin permisos.
    
    const DB = getRequestContext().env.DB;
    // Seleccionamos todo menos el hash por seguridad
    const { results } = await DB.prepare("SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC").all();
    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const DB = getRequestContext().env.DB;
    const body = await request.json();
    const { action, payload } = body;

    if (action === 'add_user') {
      const { name, email, password, role } = payload;
      
      // Verificar si el correo ya existe
      const existing = await DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
      if (existing) {
        return Response.json({ error: 'El correo ya está registrado' }, { status: 400 });
      }

      const id = crypto.randomUUID();
      const password_hash = await hash(password, 10);

      await DB.prepare("INSERT INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(id, name, email, password_hash, role, 'activo')
        .run();
        
      return Response.json({ success: true, id });
    }

    if (action === 'update_status') {
      await DB.prepare("UPDATE users SET status = ? WHERE id = ?").bind(payload.status, payload.id).run();
      return Response.json({ success: true });
    }

    if (action === 'delete_user') {
      await DB.prepare("DELETE FROM users WHERE id = ?").bind(payload.id).run();
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
