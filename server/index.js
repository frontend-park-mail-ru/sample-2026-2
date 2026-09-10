const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    const {url} = req;
    console.log(url)
    const fileName = `public/${url}`;

    try {
        const fileContent = fs.readFileSync(fileName, 'utf8'); 
        res.end(fileContent);
    } catch (err) {
        console.error('Error reading file:', err);
    }

});

server.listen(3000, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:3000');
});
