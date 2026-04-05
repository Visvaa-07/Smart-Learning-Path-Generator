const http = require('http');

async function testAuth() {
  const email = `test_login_${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Login Test User';

  // 1. Register
  console.log('--- Registering User ---');
  const regRes = await post('/api/auth/register', { name, email, password });
  console.log('Register Status:', regRes.status);
  if (!regRes.data.token) throw new Error('No token after registration');

  // 2. Login
  console.log('--- Testing Login ---');
  const loginRes = await post('/api/auth/login', { email, password });
  console.log('Login Status:', loginRes.status);
  console.log('Data:', JSON.stringify(loginRes.data, null, 2));

  if (loginRes.data.token) {
    console.log('✅ JWT Login successful!');
    process.exit(0);
  } else {
    console.error('❌ JWT Missing in login response');
    process.exit(1);
  }
}

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost', port: 5000, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

testAuth().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
