async function test() {
  const query = 'shimano deore xt';
  const res = await fetch('https://searx.be/search?q=' + encodeURIComponent(query) + '&categories=images&format=json');
  const data = await res.json();
  console.log("Images found:", data.results ? data.results.length : 0);
  if(data.results && data.results.length > 0) {
    console.log(data.results.slice(0, 5).map(r => r.img_src));
  }
}
test();
