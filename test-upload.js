const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  const form = new FormData();
  fs.writeFileSync('test.jpg', 'fake image data');
  form.append('file', fs.createReadStream('test.jpg'));
  
  // Try local first if it works
  const res = await fetch('http://localhost:8788/api/upload', {
    method: 'POST',
    body: form,
    headers: {
       'Authorization': 'Bearer test'
    }
  });
  const data = await res.json();
  console.log('Result:', data);
}
testUpload();
