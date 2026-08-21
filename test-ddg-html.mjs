import fs from 'fs';
async function test() {
  const query = 'shimano deore xt';
  const res = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query), {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  fs.writeFileSync('ddg-html.html', html);
  console.log("Size:", html.length);
}
test();
