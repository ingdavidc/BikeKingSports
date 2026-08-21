async function test() {
  const query = 'shimano deore xt';
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
  const res = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(url));
  const data = await res.json();
  const html = data.contents;
  const matches = [...html.matchAll(/<img[^>]+src=['"]\/\/external-content\.duckduckgo\.com\/iu\/\?u=([^&'"]+)/g)];
  console.log("Images found:", matches.length);
  if(matches.length > 0) {
    console.log(matches.slice(0, 5).map(m => decodeURIComponent(m[1])));
  }
}
test();
