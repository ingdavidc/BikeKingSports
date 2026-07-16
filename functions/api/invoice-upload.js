import { PDFDocument } from 'pdf-lib';

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ success: false, error: 'No se envió ningún archivo.' }, { status: 400 });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ success: false, error: 'Falta la API Key de Gemini en el entorno (.dev.vars o entorno remoto).' }, { status: 500 });
    }

    // Read original file bytes
    const arrayBuffer = await file.arrayBuffer();
    
    // Attempt to strip PDF restrictions using pdf-lib
    let finalBytes = new Uint8Array(arrayBuffer);
    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        // By saving it without setting a password, pdf-lib strips standard restrictions (like copy/print protections)
        finalBytes = await pdfDoc.save();
      }
    } catch (pdfError) {
      console.warn('Advertencia: No se pudo procesar/quitar restricciones del PDF (puede estar muy encriptado o dañado). Se enviará el original.', pdfError);
    }

    // Convert file to base64
    let binary = '';
    for (let i = 0; i < finalBytes.byteLength; i++) {
      binary += String.fromCharCode(finalBytes[i]);
    }
    const base64Data = btoa(binary);

    // Call Gemini API (1.5 Flash) via standard fetch
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `
      Eres un asistente experto en contabilidad e inventarios. 
      Analiza la siguiente factura en PDF y extrae la información en un formato JSON estricto, sin usar comillas tipográficas u otros caracteres raros.
      No incluyas markdown (como \`\`\`json), SOLAMENTE devuelve el objeto JSON válido.
      Si un dato no existe, déjalo como string vacío o 0.
      
      Formato esperado:
      {
        "provider": {
          "name": "Nombre de la Empresa",
          "document": "NIT o RUT",
          "email": "correo@ejemplo.com",
          "phone": "telefono"
        },
        "products": [
          {
            "name": "Nombre del Repuesto",
            "sku": "Código de Barras o SKU (opcional)",
            "quantity": 10,
            "price": 50000,
            "tax": 19
          }
        ]
      }
    `;

    const bodyData = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: file.type || 'application/pdf',
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1
      }
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyData)
    });

    const geminiData = await response.json();

    if (!response.ok) {
      throw new Error(geminiData.error?.message || 'Error al comunicarse con Gemini');
    }

    // Extract text from Gemini response
    let extractedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean potential markdown blocks
    extractedText = extractedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsedJson = JSON.parse(extractedText);

    return Response.json({ success: true, data: parsedJson });

  } catch (error) {
    console.error('Error procesando factura con Gemini:', error);
    return Response.json({ success: false, error: 'Error procesando la factura: ' + error.message }, { status: 500 });
  }
}
