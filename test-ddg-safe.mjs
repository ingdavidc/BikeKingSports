async function testDDG() {
    const q = 'CADENA 10 velocidades X10 NEGRA/PLATA KMC';
    const browserHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    };
    
    // add p=1 for safe search
    const ddgRes = await fetch('https://duckduckgo.com/?q=' + encodeURIComponent(q) + '&p=1', { headers: browserHeaders });
    const text = await ddgRes.text();
    const vqdMatch = text.match(/vqd=['"]?([^'"&\s]+)['"]?/);
    if(vqdMatch) {
      console.log('Got VQD', vqdMatch[1]);
      const imgRes = await fetch(`https://duckduckgo.com/i.js?q=${encodeURIComponent(q)}&o=json&vqd=${vqdMatch[1]}&p=1`, {
        headers: { ...browserHeaders, 'Referer': 'https://duckduckgo.com/' }
      });
      const data = await imgRes.json();
      console.log(data.results?.slice(0, 5).map(r => r.image));
    }
}
testDDG();
