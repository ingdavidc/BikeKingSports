import fs from 'fs';
const html = fs.readFileSync('yahoo.html', 'utf8');
const matches = html.match(/https?:\/\/[^\s"']+\.(jpg|png|jpeg)/g);
console.log(matches ? matches.slice(0, 10) : 'none');
