export async function onRequestGet(context) {
  try {
    const DB = context.env.DB;
    
    // Add columns if they don't exist
    const queries = [
      "ALTER TABLE sales ADD COLUMN status TEXT DEFAULT 'completed';",
      "ALTER TABLE sales ADD COLUMN amount_paid REAL DEFAULT 0;",
      "ALTER TABLE sales ADD COLUMN payment_history TEXT DEFAULT '[]';"
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

    // Set amount_paid = total for existing completed sales
    await DB.prepare("UPDATE sales SET amount_paid = total WHERE amount_paid = 0 OR amount_paid IS NULL").run();

    return Response.json({ success: true, results });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
