import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(request) {
  try {
    const MEDIA = getRequestContext().env.MEDIA;
    if (!MEDIA) {
      return Response.json({ error: 'MEDIA binding not found' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const arrayBuffer = await file.arrayBuffer();

    // Guardar en Cloudflare R2
    await MEDIA.put(filename, arrayBuffer, {
      httpMetadata: { contentType: file.type },
    });

    // Construir la URL pública.
    // OJO: Cloudflare R2 necesita que actives un subdominio público en el panel para que las imágenes sean accesibles.
    // Por ahora, asumiremos que se activa un "Custom Domain" o "R2.dev" para el bucket.
    // Reemplazaremos PUBLIC_URL más adelante cuando sepamos la URL pública de R2.
    const url = `https://pub-bikekingmedia.r2.dev/${filename}`; // Placeholder

    return Response.json({ success: true, url, filename });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
