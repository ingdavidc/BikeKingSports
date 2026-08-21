const q = 'CADENA 10 VEL 1/2X11/128 114L X10 NEGRA/PLATA KMC';
const cleanQuery = q.replace(/\b\d+\/\d+[Xx]\d+\/\d+\b/g, '').replace(/\b\d{2,}L\b/g, '').replace(/\bVEL\b/gi, 'velocidades').replace(/\s+/g, ' ').trim();
console.log('Clean Query:', cleanQuery);

async function testDDG() {
    const browserHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-CO,es;q=0.9,en-US;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive'
    };

    const ddgRes = await fetch('https://duckduckgo.com/?q=' + encodeURIComponent(cleanQuery), { headers: browserHeaders });
    const ddgText = await ddgRes.text();
    const vqdMatch = ddgText.match(/vqd=['"]?([^'"&\s]+)['"]?/);
    console.log('VQD:', vqdMatch ? vqdMatch[1] : 'NONE');

    if (vqdMatch) {
      const imgRes = await fetch(`https://duckduckgo.com/i.js?q=${encodeURIComponent(cleanQuery)}&o=json&vqd=${encodeURIComponent(vqdMatch[1])}`, {
        headers: { ...browserHeaders, 'Referer': 'https://duckduckgo.com/', 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
      });
      const imgData = await imgRes.json();
      console.log('Images length:', imgData.results?.length);
      console.log('Sample images:', imgData.results?.slice(0, 5).map(r => r.image));
    }
}
testDDG();
