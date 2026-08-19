export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return Response.json({ success: false, error: "Término de búsqueda vacío" }, { status: 400 });
  }

  try {
    // 1. Obtener token VQD de DuckDuckGo
    const ddgRes = await fetch('https://duckduckgo.com/?q=' + encodeURIComponent(query), {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' }
    });
    const text = await ddgRes.text();
    const vqdMatch = text.match(/vqd=[\"']?([^\"'&]+)[\"']?/);
    if (!vqdMatch) throw new Error("No VQD token found from DuckDuckGo");
    const vqd = vqdMatch[1];
    
    // 2. Obtener imágenes usando la API de DuckDuckGo
    const imgRes = await fetch('https://duckduckgo.com/i.js?q=' + encodeURIComponent(query) + '&o=json&vqd=' + vqd, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' }
    });
    const data = await imgRes.json();
    
    if (!data || !data.results || data.results.length === 0) {
      return Response.json({ success: false, error: "No se encontraron imágenes" });
    }
    
    const results = data.results.slice(0, 12).map(r => ({
      url: r.image,
      preview: r.thumbnail || r.image
    }));

    return Response.json({ success: true, images: results });
  } catch (err) {
    return Response.json({ success: false, error: "Error interno: " + err.message }, { status: 500 });
  }
}
