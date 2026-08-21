const q = 'CADENA 10 VEL 1/2X11/128 114L X10 NEGRA/PLATA KMC';
const cleanQuery = q.replace(/\b\d+\/\d+[Xx]\d+\/\d+\b/g, '').replace(/\b\d{2,}L\b/g, '').replace(/\bVEL\b/gi, 'velocidades').replace(/\s+/g, ' ').trim();

async function testCorsProxyBing() {
    const bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(cleanQuery)}&FORM=HDRSC2`;
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(bingUrl)}`;
    
    try {
        const res = await fetch(proxyUrl);
        const text = await res.text();
        
        const murlRegex = /murl&quot;:&quot;(.*?)&quot;/g;
        let match;
        const urls = [];
        while ((match = murlRegex.exec(text)) !== null && urls.length < 5) {
            urls.push(match[1]);
        }
        
        console.log("CorsProxy IO + Bing results:");
        console.log(urls);
    } catch(err) {
        console.error(err);
    }
}

testCorsProxyBing();
