const http = require('http');

async function runTest() {
  const email = `user_${Date.now()}@test.com`;
  const password = 'password123';
  const name = 'Flow Tester';

  console.log('🚀 Starting Full Flow Test');
  console.log('Credentials:', { email, password });

  // 1. Register
  console.log('\n1. Registering...');
  const regRes = await request('/api/auth/register', 'POST', { name, email, password });
  if (regRes.status !== 201) throw new Error('Registration failed');
  let token = regRes.data.token;
  console.log('✅ Registered');

  // 2. Generate Path
  console.log('\n2. Generating Path (Data Science)...');
  const genRes = await request('/api/path/generate', 'POST', {
    subject: 'Data Science',
    skillLevel: 'beginner',
    hoursPerWeek: 10,
    deadlineWeeks: 12
  }, token);
  if (genRes.status !== 201) throw new Error('Path generation failed: ' + JSON.stringify(genRes.data));
  console.log('✅ Path Created:', genRes.data.subject);

  // 3. Verify Path Exists
  console.log('\n3. Verifying path presence...');
  const check1 = await request('/api/path/me', 'GET', null, token);
  if (check1.status !== 200 || !check1.data.subject) throw new Error('Path not found after creation');
  console.log('✅ Path verified for current session');

  // 4. Simulate Logout/Login
  console.log('\n4. Simulating Logout & Re-Login...');
  const loginRes = await request('/api/auth/login', 'POST', { email, password });
  if (loginRes.status !== 200) throw new Error('Login failed');
  token = loginRes.data.token;
  console.log('✅ Logged in again with new token');

  // 5. Final check for persistence
  console.log('\n5. Checking if path persists...');
  const check2 = await request('/api/path/me', 'GET', null, token);
  if (check2.status !== 200 || check2.data.subject !== 'Data Science') {
    throw new Error('Path did not persist after re-login');
  }
  console.log('✅ Success! Path persisted for user.');
  
  console.log('\n🎉 TEST PASSED');
  console.log('----------------------------');
  console.log('Email:    ', email);
  console.log('Password: ', password);
  console.log('----------------------------');
}

function request(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request({ hostname: 'localhost', port: 5000, path, method, headers }, (res) => {
      let resBody = '';
      res.on('data', c => resBody += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(resBody) }); }
        catch (e) { resolve({ status: res.statusCode, data: resBody }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

runTest().catch(console.error);
