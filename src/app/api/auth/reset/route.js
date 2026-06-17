import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const DB = getRequestContext().env.DB;
    // Update admin password to the new SHA-256 hash
    await DB.prepare("UPDATE users SET password_hash = 'fc44c980b9f101f99eb8e5ba2a4829241499b48b3b4d800f0c235401708f188c' WHERE email = 'admin@bikekingsports.com'").run();
    return Response.json({ success: true, message: 'Admin password hash updated successfully.' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
