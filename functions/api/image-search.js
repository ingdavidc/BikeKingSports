// functions/api/image-search.js
// Usa DuckDuckGo Image Search. Funciona correctamente desde Cloudflare Workers.
export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const query = searchParams.get('q');

  if (!query) {
    return Response.json({ success: false, error: "Término de búsqueda vacío" }, { status: 400 });
  }

  try {
    // Simplify query: remove technical specs that confuse search engines
    // e.g. "CADENA 10 VEL 1/2X11/128 114L X10 NEGRA/PLATA KMC" → "CADENA KMC X10 10 VEL negra plata"
    const cleanQuery = query
      .replace(/\b\d+\/\d+[Xx]\d+\/\d+\b/g, '')  // Remove chain specs: 1/2X11/128
      .replace(/\b\d{2,}L\b/g, '')                  // Remove link count: 114L 96L
      .replace(/\bVEL\b/gi, 'velocidades')           // VEL → velocidades
      .replace(/\s+/g, ' ')
      .trim();

    const browserHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-CO,es;q=0.9,en-US;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive'
    };

    // Step 1: Get VQD token from DuckDuckGo with safe search (p=1)
    const ddgRes = await fetch('https://duckduckgo.com/?q=' + encodeURIComponent(cleanQuery) + '&p=1', {
      headers: browserHeaders
    });

    if (!ddgRes.ok) throw new Error(`DDG homepage returned ${ddgRes.status}`);
    const ddgText = await ddgRes.text();

    const vqdMatch = ddgText.match(/vqd=['"]?([^'"&\s]+)['"]?/);
    if (!vqdMatch) throw new Error("No se pudo obtener token de búsqueda de DuckDuckGo");
    const vqd = vqdMatch[1];

    // Step 2: Fetch images using the VQD token with safe search (p=1)
    const imgRes = await fetch(
      `https://duckduckgo.com/i.js?q=${encodeURIComponent(cleanQuery)}&o=json&vqd=${encodeURIComponent(vqd)}&p=1`,
      {
        headers: {
          ...browserHeaders,
          'Referer': 'https://duckduckgo.com/',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest'
        }
      }
    );

    if (!imgRes.ok) throw new Error(`DDG images returned ${imgRes.status}`);
    const imgData = await imgRes.json();

    if (!imgData.results || imgData.results.length === 0) {
      return Response.json({ success: false, error: "No se encontraron imágenes para este producto" });
    }

    const results = imgData.results.slice(0, 8).map(r => ({
      url: r.image.startsWith('http://') ? r.image.replace('http://', 'https://') : r.image,
      preview: (r.thumbnail || r.image).startsWith('http://') 
        ? (r.thumbnail || r.image).replace('http://', 'https://')
        : (r.thumbnail || r.image)
    }));

    return Response.json({ success: true, images: results, query: cleanQuery });

  } catch (err) {
    console.error('Image search error:', err.message);
    return Response.json({ success: false, error: "Error al buscar imágenes: " + err.message }, { status: 500 });
  }
}
