// Test to see EXACTLY what Cloudflare Workers would receive by checking response
// and comparing with the current Bing regex behavior
import fs from 'fs';

async function testBing(query) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&FORM=HDRSC2`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }
  });
  
  const text = await res.text();
  
  // Check what the current regex in production does:
  const murlRegex = /murl&quot;:&quot;(.*?)&quot;/g;
  let match;
  const urls = [];
  while ((match = murlRegex.exec(text)) !== null) {
    if (urls.length < 8) {
      let extractedUrl = match[1];
      if (extractedUrl.startsWith("http://")) {
        extractedUrl = extractedUrl.replace("http://", "https://");
      }
      if (!urls.includes(extractedUrl)) {
        urls.push(extractedUrl);
      }
    } else break;
  }
  
  console.log(`\n=== Query: "${query}" ===`);
  console.log(`URLs found: ${urls.length}`);
  urls.forEach((u, i) => console.log(`  ${i+1}. ${u}`));
}

// Test with real bike products
await testBing('CADENA 1 VEL 1/2X1/8 96L C410 GRIS TEC');
await testBing('SHIMANO DEORE XT RD-M8000');
await testBing('BICICLETA MTB 29P MONKEY ALUMINIO GW');
