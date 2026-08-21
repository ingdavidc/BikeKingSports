async function testProd() {
    try {
      const url = `https://bikekingsports.pages.dev/api/image-search?q=test`;
      const res = await fetch(url);
      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.error("Error:", err);
    }
}
testProd();
