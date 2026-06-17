// ============================================================
// functions/api/upload.js
// Subida de archivos multimedia al bucket R2.
// Validaciones estrictas de tipo MIME y tamaño.
// ============================================================

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
]);

// Map de MIME a extensión segura (evita extension spoofing)
const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
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

    let formData;
    try {
      formData = await context.request.formData();
    } catch {
      return Response.json({ error: 'Solicitud de formulario inválida' }, { status: 400 });
    }

    const file = formData.get('file');

    if (!file || typeof file.arrayBuffer !== 'function') {
      return Response.json({ error: 'No se recibió ningún archivo válido' }, { status: 400 });
    }

    // Validar tipo MIME contra lista blanca
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return Response.json(
        { error: 'Tipo de archivo no permitido. Tipos aceptados: JPG, PNG, WEBP, GIF, MP4, WEBM' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    // Validar tamaño después de leer para evitar ataques de streaming
    if (arrayBuffer.byteLength > MAX_SIZE_BYTES) {
      return Response.json({ error: 'El archivo supera el límite de 10 MB' }, { status: 400 });
    }
    if (arrayBuffer.byteLength === 0) {
      return Response.json({ error: 'El archivo está vacío' }, { status: 400 });
    }

    // Usar extensión derivada del MIME type, nunca del nombre del archivo original
    const safeExtension = MIME_TO_EXT[file.type];
    const safeName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExtension}`;

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
