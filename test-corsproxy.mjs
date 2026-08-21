const q = 'CADENA 10 VEL 1/2X11/128 114L X10 NEGRA/PLATA KMC';
const cleanQuery = q.replace(/\b\d+\/\d+[Xx]\d+\/\d+\b/g, '').replace(/\b\d{2,}L\b/g, '').replace(/\bVEL\b/gi, 'velocidades').replace(/\s+/g, ' ').trim();

async function testCorsProxy() {
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanQuery)}`)}`;
    
    try {
        const res = await fetch(proxyUrl);
        const html = await res.text();
        
        const imgRegex = /src="(\/\/external-content\.duckduckgo\.com\/iu\/\?u=[^"]+)"/g;
        let match;
        const urls = [];
        while ((match = imgRegex.exec(html)) !== null && urls.length < 5) {
            urls.push(decodeURIComponent(match[1].replace('//external-content.duckduckgo.com/iu/?u=', '').split('&')[0]));
        }
        
        console.log("CorsProxy IO + DuckDuckGo HTML results:");
        console.log(urls);
    } catch(err) {
        console.error(err);
    }
}

testCorsProxy();
