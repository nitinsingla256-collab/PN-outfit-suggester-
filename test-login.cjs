const fetch = require('node-fetch');

async function testLogin() {
  const url = 'http://127.0.0.1:3000/api/auth/signin';
  console.log('Testing login...');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nitinsingla256@gmail.com', password: '1211' })
  });
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', data);
}

testLogin();
