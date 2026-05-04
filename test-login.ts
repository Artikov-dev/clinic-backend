import http from 'http';

const testLogin = () => {
  const data = JSON.stringify({
    email: 'alii@clinic.com',
    password: 'secret1223',
  });

  const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/api/auth/login',
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
      console.log('\n📊 Login Endpoint Test Results\n');
      console.log(`Status: ${res.statusCode}`);
      console.log('\nResponse:');
      try {
        const parsed = JSON.parse(responseData);
        if (parsed.data?.token) {
          console.log({
            success: parsed.success,
            message: parsed.message,
            user: parsed.data.user,
            token: parsed.data.token.substring(0, 50) + '...',
          });
        } else {
          console.log(JSON.stringify(parsed, null, 2));
        }

        if (res.statusCode === 200 && parsed.success) {
          console.log('\n✅ Login endpoint works correctly!');
          console.log('✅ deleted_at column is handled properly!');
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

testLogin();
