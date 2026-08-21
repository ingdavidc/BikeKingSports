// Test script to check what Bing actually returns from this machine
// (simulating what Cloudflare Workers would get)
import fs from 'fs';

async function testBing(query) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&FORM=HDRSC2`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }
  });
  
  const text = await res.text();
  fs.writeFileSync('bing-response.html', text);
  
  // Pattern 1: HTML-encoded
  const murlRegex1 = /murl&quot;:&quot;(.*?)&quot;/g;
  let match;
  const urls1 = [];
  while ((match = murlRegex1.exec(text)) !== null && urls1.length < 5) {
    urls1.push(match[1]);
  }
  
  // Pattern 2: Raw JSON
  const murlRegex2 = /"murl":"(.*?)"/g;
  const urls2 = [];
  while ((match = murlRegex2.exec(text)) !== null && urls2.length < 5) {
    urls2.push(match[1]);
  }
  
  // Pattern 3: iurl
  const iurlRegex = /iurl&quot;:&quot;(.*?)&quot;/g;
  const urls3 = [];
  while ((match = iurlRegex.exec(text)) !== null && urls3.length < 5) {
    urls3.push(match[1]);
  }
  
  console.log(`\n=== Query: "${query}" ===`);
  console.log(`Response size: ${text.length} bytes`);
  console.log(`Status: ${res.status}`);
  console.log(`\nPattern 1 (murl HTML-encoded): ${urls1.length} matches`);
  urls1.forEach(u => console.log('  -', u.substring(0, 100)));
  console.log(`\nPattern 2 (murl raw JSON): ${urls2.length} matches`);
  urls2.forEach(u => console.log('  -', u.substring(0, 100)));
  console.log(`\nPattern 3 (iurl): ${urls3.length} matches`);
  urls3.forEach(u => console.log('  -', u.substring(0, 100)));
  
  // Check if page has CAPTCHA or bot detection
  const hasCaptcha = text.includes('captcha') || text.includes('robot') || text.includes('CAPTCHA');
  console.log(`\nHas CAPTCHA/Bot detection: ${hasCaptcha}`);
}

await testBing('CADENA 1 VEL 1/2X1/8 96L C410 GRIS TEC');
