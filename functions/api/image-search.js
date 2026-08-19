export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return Response.json({ success: false, error: "Término de búsqueda vacío" }, { status: 400 });
  }

  try {
    const searchQuery = query.trim();
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(searchQuery)}&FORM=HDRSC2`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
      }
    });
    
    if (!res.ok) {
      throw new Error(`Bing returned ${res.status}`);
    }

    const text = await res.text();
    
    // Extraer URLs de las imágenes usando regex sobre el payload de Bing
    const murlRegex = /murl&quot;:&quot;(.*?)&quot;/g;
    let match;
    const urls = [];
    
    while ((match = murlRegex.exec(text)) !== null) {
      if (urls.length < 8) {
        let extractedUrl = match[1];
        if (extractedUrl.startsWith("http://")) {
          extractedUrl = extractedUrl.replace("http://", "https://");
        }
        if (!urls.includes(extractedUrl)) {
          urls.push(extractedUrl);
        }
      } else {
        break;
      }
    }

    if (urls.length === 0) {
      return Response.json({ success: false, error: "No se encontraron imágenes" });
    }

    const results = urls.map(url => ({
      url: url,
      preview: url
    }));

    return Response.json({ success: true, images: results });
  } catch (err) {
    return Response.json({ success: false, error: "Error interno: " + err.message }, { status: 500 });
  }
}
