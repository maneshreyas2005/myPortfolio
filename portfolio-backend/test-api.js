const http = require('http');

const post = (path, data) => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch(e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

const get = (path) => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch(e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
};

// Test login
post('/api/auth/login', JSON.stringify({ email: 'admin@portfolio.com' }))
  .then(result => {
    console.log('Login result:', result);
    if (result.token) {
      // Test protected route with token
      get('/api/profile')
        .then(profile => {
          console.log('Profile:', profile);
        })
        .catch(err => console.error('Profile error:', err));
    }
  })
  .catch(err => console.error('Error:', err));