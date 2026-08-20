export async function onRequestGet(context) {
  try {
    const DB = context.env.DB;
    
    // Add columns if they don't exist
    const queries = [
      "ALTER TABLE sales ADD COLUMN transaction_ref TEXT;",
      "ALTER TABLE sales ADD COLUMN cash_received REAL;",
      "ALTER TABLE sales ADD COLUMN change_given REAL;"
    ];

    let results = [];
    for (let q of queries) {
      try {
        await DB.prepare(q).run();
        results.push(`Success: ${q}`);
      } catch (e) {
        results.push(`Skipped (probably exists): ${q} - ${e.message}`);
      }
    }

    return Response.json({ success: true, results });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
