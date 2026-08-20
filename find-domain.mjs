async function testProd() {
  const domains = [
    'corporate-bikeking.pages.dev',
    'bikeking.pages.dev',
    'bikekingsports.pages.dev'
  ];

  for (let domain of domains) {
    try {
      console.log(`Testing ${domain}...`);
      const res = await fetch(`https://${domain}/api/image-search?q=CADENA+KMC`);
      if (res.ok) {
        const data = await res.json();
        console.log(`SUCCESS for ${domain}:`, data.images?.length, 'images');
        return;
      }
    } catch(e) {}
  }
}
testProd();
