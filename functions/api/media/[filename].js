export async function onRequestGet(context) {
  try {
    const filename = context.params.filename;
    const MEDIA = context.env.MEDIA;
    
    if (!MEDIA) {
      return new Response('Media bucket no configurado', { status: 500 });
    }

    const object = await MEDIA.get(filename);

    if (object === null) {
      return new Response('Not Found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000');

    return new Response(object.body, {
      headers,
    });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
