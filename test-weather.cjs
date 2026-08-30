const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/weather?latitude=40.7128&longitude=-74.0060',
  method: 'GET'
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let data = '';
  res.on('data', d => {
    data += d;
  });
  res.on('end', () => {
    console.log(data);
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
