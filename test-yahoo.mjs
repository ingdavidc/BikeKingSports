async function testYahoo() {
    const q = 'CADENA 10 velocidades KMC';
    const url = `https://images.search.yahoo.com/search/images?p=${encodeURIComponent(q)}`;
    
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
    });
    
    const text = await res.text();
    const regex = /imgurl=(https?:\/\/[^&]+)/g;
    let match;
    const urls = [];
    while ((match = regex.exec(text)) !== null && urls.length < 5) {
        urls.push(decodeURIComponent(match[1]));
    }
    
    console.log("Yahoo Images:");
    console.log(urls);
}
testYahoo();
