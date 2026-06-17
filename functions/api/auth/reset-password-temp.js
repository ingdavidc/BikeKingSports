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

    // Update admin password
    await DB.prepare("UPDATE users SET password_hash = ? WHERE email = 'admin@bikekingsports.com'").bind(password_hash).run();

    return Response.json({ success: true, message: 'Admin password reset to admin123' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
