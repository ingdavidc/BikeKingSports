async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "bikeking_salt_123");
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestGet(context) {
  try {
    const DB = context.env.DB;
    const password_hash = await hashPassword('admin123');

    // Remove existing admin if exists to ensure clean state
    await DB.prepare("DELETE FROM users WHERE email = 'admin@bikekingsports.com'").run();

    // Insert new admin
    const id = crypto.randomUUID();
    await DB.prepare(
      "INSERT INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(id, 'Admin', 'admin@bikekingsports.com', password_hash, 'admin', 'activo').run();

    // Fetch all users to verify
    const { results } = await DB.prepare("SELECT email FROM users").all();

    return Response.json({ success: true, message: 'Admin user created successfully', users: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
