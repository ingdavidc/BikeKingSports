export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return Response.json({ success: false, error: "Término de búsqueda vacío" }, { status: 400 });
  }

  try {
    const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=filetype:bitmap%20${encodeURIComponent(query)}&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json`, {
      headers: { 'User-Agent': 'BikeKing/1.0 (bikekingsports.com)' }
    });
    
    const data = await wikiRes.json();
    const pages = data.query?.pages;
    
    if (!pages) {
      return Response.json({ success: false, error: "No se encontraron imágenes" });
    }
    
    const urls = Object.values(pages).map(p => p.imageinfo?.[0]?.url).filter(Boolean);
    if (urls.length === 0) {
      return Response.json({ success: false, error: "No se encontraron imágenes" });
    }

    const results = urls.slice(0, 12).map(url => ({
      url: url,
      preview: url
    }));

    return Response.json({ success: true, images: results });
  } catch (err) {
    return Response.json({ success: false, error: "Error interno: " + err.message }, { status: 500 });
  }
}
