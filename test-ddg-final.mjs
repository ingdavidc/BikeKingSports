// Test DuckDuckGo from this machine with full browser headers - exact copy of what Cloudflare Workers would do
async function testDDG(query) {
  console.log(`\n=== DDG Test: "${query}" ===`);
  try {
    // Step 1: get VQD
    const ddgRes = await fetch('https://duckduckgo.com/?q=' + encodeURIComponent(query), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-CO,es;q=0.9,en-US;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }
    });
    const text = await ddgRes.text();
    const vqdMatch = text.match(/vqd=['"]?([^'"&\s]+)['"]?/);
    if (!vqdMatch) { console.log('NO VQD TOKEN'); return null; }
    const vqd = vqdMatch[1];
    console.log(`VQD: ${vqd}`);

    // Step 2: get images
    const imgRes = await fetch(`https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&vqd=${vqd}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://duckduckgo.com/',
        'Accept': 'application/json'
      }
    });
    const data = await imgRes.json();
    const images = (data.results || []).slice(0, 5);
    console.log(`Images: ${images.length}`);
    images.forEach(img => console.log('  -', img.image?.substring(0, 80)));
    return images;
  } catch(e) {
    console.log('ERROR:', e.message);
    return null;
  }
}

// Test with a real problematic product
await testDDG('CADENA 10 VEL KMC X10 NEGRA PLATA');
await testDDG('KMC X10 chain 10 speed');
