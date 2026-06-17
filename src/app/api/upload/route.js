export const runtime = 'edge';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { verifyAuthHeader, unauthorized } from '@/lib/auth';

// Tipos MIME permitidos para subir archivos
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
];

// Tamaño máximo: 10MB
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request) {
  // SECURITY: Solo usuarios autenticados pueden subir archivos
  const authPayload = await verifyAuthHeader(request);
  if (!authPayload) return unauthorized();

  try {
    const MEDIA = getRequestContext().env.MEDIA;
    if (!MEDIA) {
      return Response.json({ error: 'MEDIA binding not found' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ error: `Tipo de archivo no permitido. Tipos aceptados: JPG, PNG, WEBP, GIF, MP4, WEBM` }, { status: 400 });
    }

    // Validar tamaño
    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_SIZE_BYTES) {
      return Response.json({ error: 'El archivo supera el límite de 10MB' }, { status: 400 });
    }

    // Sanitizar nombre: solo letras, números, guiones y el punto de extensión
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

