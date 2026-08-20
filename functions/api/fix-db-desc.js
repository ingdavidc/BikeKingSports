export async function onRequestGet(context) {
  try {
    const DB = context.env.DB;
    // Add description column
    await DB.prepare('ALTER TABLE products ADD COLUMN description TEXT;').run();
    return Response.json({ success: true, message: 'Column added successfully' });
  } catch (err) {
    if (err.message.includes('duplicate column')) {
        return Response.json({ success: true, message: 'Column already exists' });
    }
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
