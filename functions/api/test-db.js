export async function onRequestGet(context) {
  try {
    const DB = context.env.DB;
    const info = await DB.prepare("PRAGMA table_info(sales);").all();
    return Response.json(info.results);
  } catch (err) {
    return Response.json({ error: err.message });
  }
}
