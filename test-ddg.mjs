import fs from 'fs';
async function test() {
  const ddgRes = await fetch('https://duckduckgo.com/?q=bike', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' }
  });
  const text = await ddgRes.text();
  fs.writeFileSync('ddg-response.html', text);
}
test();
