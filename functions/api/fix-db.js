export async function onRequest(context) {
  try {
    const DB = context.env.DB;
    
    // Drop the table to remove any bad constraints
    await DB.prepare('DROP TABLE IF EXISTS product_providers').run();
    
    // Recreate it correctly
    await DB.prepare(`
      CREATE TABLE product_providers (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          provider_id TEXT NOT NULL,
          is_main BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
      )
    `).run();
    
    return Response.json({ success: true, message: 'product_providers table recreated successfully.' });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
