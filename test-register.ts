import http from 'http';

const testRegister = () => {
  const data = JSON.stringify({
    full_name: 'Alii Valiyev',
    email: 'alii@clinic.com',
    password: 'secret1223',
    role_id: 'f5b27fc4-cc34-487b-956f-3b007e438714',
  });

  const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('\n📊 Register Endpoint Test Results\n');
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
      console.log('\nResponse:');
      try {
        const parsed = JSON.parse(responseData);
        console.log(JSON.stringify(parsed, null, 2));
        
        if (res.statusCode === 201 || res.statusCode === 200) {
          console.log('\n✅ Register endpoint works correctly!');
        } else if (res.statusCode === 409) {
          console.log('\n⚠️  Email already exists (expected on retry)');
        } else {
          console.log('\n❌ Unexpected response');
        }
      } catch (e) {
        console.log(responseData);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Error: ${e.message}`);
  });

  req.write(data);
  req.end();
};

testRegister();
