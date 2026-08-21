const fetch = require('node-fetch'); // wait next.js / node 24 has native fetch
fetch('http://localhost:8788/api/inventory', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({id: 1, name: 'Test', image: 'img1.jpg', image_urls: '[\"img1.jpg\"]'})
}).then(r => r.text()).then(console.log).catch(console.error);
