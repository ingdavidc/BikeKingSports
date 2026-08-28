const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function onRequestPost(context) {
  const role = context.data?.role;
  if (!role) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const MEDIA = context.env.MEDIA;
    if (!MEDIA) {
      return Response.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    const { url } = await context.request.json();
    if (!url) {
      return Response.json({ error: 'Falta la URL de la imagen' }, { status: 400 });
    }

    const imgRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://duckduckgo.com/'
      }
    });

    if (!imgRes.ok) {
      return Response.json({ error: 'No se pudo descargar la imagen origen' }, { status: 400 });
    }

    const contentType = imgRes.headers.get('content-type') || '';
    const cleanContentType = contentType.split(';')[0].trim().toLowerCase();

    // If DuckDuckGo gives application/octet-stream or something weird, default to jpeg if it ends in jpg
    let finalMime = cleanContentType;
    if (!ALLOWED_MIME_TYPES.has(cleanContentType)) {
       if (url.toLowerCase().includes('.png')) finalMime = 'image/png';
       else if (url.toLowerCase().includes('.webp')) finalMime = 'image/webp';
       else if (url.toLowerCase().includes('.gif')) finalMime = 'image/gif';
       else finalMime = 'image/jpeg';
    }

    if (!ALLOWED_MIME_TYPES.has(finalMime)) {
       finalMime = 'image/jpeg';
    }

    const arrayBuffer = await imgRes.arrayBuffer();

    if (arrayBuffer.byteLength > MAX_SIZE_BYTES) {
      return Response.json({ error: 'La imagen supera los 10 MB' }, { status: 400 });
    }
    if (arrayBuffer.byteLength === 0) {
      return Response.json({ error: 'La imagen está vacía' }, { status: 400 });
    }

    const safeExtension = MIME_TO_EXT[finalMime];
    const safeName = `ai-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExtension}`;

    await MEDIA.put(safeName, arrayBuffer, {
      httpMetadata: { contentType: finalMime },
    });

    const finalUrl = `/api/media/${safeName}`;
    return Response.json({ success: true, url: finalUrl });

  } catch (error) {
    console.error('POST /api/upload-url error:', error);
    return Response.json({ error: 'Error al procesar la imagen de la IA' }, { status: 500 });
  }
}
