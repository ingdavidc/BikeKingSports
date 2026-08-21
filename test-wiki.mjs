const query = "CADENA KMC X10";
async function testWiki() {
    const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?origin=*&action=query&generator=search&gsrsearch=filetype:bitmap%20${encodeURIComponent(query)}&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json`);
    const data = await wikiRes.json();
    console.log(data);
}
testWiki();
