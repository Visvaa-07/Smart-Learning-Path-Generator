const http = require('http');

async function createVisvaaUser() {
  const email = 'visvaa@gmail.com';
  const password = 'visvaa123';
  const name = 'Visvaa';

  console.log('🚀 Creating user "visvaa@gmail.com"...');

  const postData = JSON.stringify({ name, email, password });
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      try {
        const json = JSON.parse(data);
        if (res.statusCode === 201) {
          console.log('\n✅ User created successfully!');
          console.log('----------------------------');
          console.log('Email:   ', email);
          console.log('Password:', password);
          console.log('----------------------------');
          console.log('Note: The password is automatically hashed in the database via the User model hook.');
          process.exit(0);
        } else {
          console.error('\n❌ Failed to create user:', json.message || data);
          process.exit(1);
        }
      } catch (e) {
        console.error('\n❌ Failed to parse response:', data);
        process.exit(1);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Problem with request:', e.message);
    process.exit(1);
  });

  req.write(postData);
  req.end();
}

createVisvaaUser();
