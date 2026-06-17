const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
];

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function onRequestPost(context) {
  // SECURITY: _middleware.js ya verificó autenticación
  const role = context.data?.role;
  if (!role) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const MEDIA = context.env.MEDIA;
    if (!MEDIA) {
      return Response.json({ error: 'MEDIA binding not found' }, { status: 500 });
    }

    const formData = await context.request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ error: `Tipo de archivo no permitido. Tipos aceptados: JPG, PNG, WEBP, GIF, MP4, WEBM` }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_SIZE_BYTES) {
      return Response.json({ error: 'El archivo supera el límite de 10MB' }, { status: 400 });
    }

    const extension = file.name.split('.').pop().toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;

    await MEDIA.put(safeName, arrayBuffer, {
      httpMetadata: { contentType: file.type },
    });

    const url = `https://pub-bikekingmedia.r2.dev/${safeName}`;

    return Response.json({ success: true, url, filename: safeName });

  } catch (error) {
    console.error('POST /api/upload error:', error);
    return Response.json({ error: 'Error al subir el archivo' }, { status: 500 });
  }
}
