import fs from 'fs';
async function test() {
  const query = 'shimano deore xt';
  const res = await fetch('https://www.dogpile.com/serp?qc=images&q=' + encodeURIComponent(query));
  const html = await res.text();
  const matches = [...html.matchAll(/(src|data-src)=['"](http[^'"]+)['"]/g)];
  console.log("Images found:", matches.length);
  const results = matches.map(m => m[2]);
  console.log(results.slice(0, 5));
}
test();
