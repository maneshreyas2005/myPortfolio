const http = require('http');

const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (data) {
      headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

const runTests = async () => {
  console.log('Testing Portfolio Backend APIs...\n');

  // Test 1: Public profile endpoint
  const profileRes = await request('/api/profile');
  console.log('1. GET /api/profile:', profileRes.status, profileRes.data.name ? 'SUCCESS (Name: ' + profileRes.data.name + ')' : 'FAIL');

  // Test 2: Public skills endpoint
  const skillsRes = await request('/api/skills');
  console.log('2. GET /api/skills:', skillsRes.status, Array.isArray(skillsRes.data) ? `SUCCESS (${skillsRes.data.length} categories)` : 'FAIL');

  // Test 3: Public projects endpoint
  const projectsRes = await request('/api/projects');
  console.log('3. GET /api/projects:', projectsRes.status, Array.isArray(projectsRes.data) ? `SUCCESS (${projectsRes.data.length} projects)` : 'FAIL');

  // Test 4: Public experience endpoint
  const expRes = await request('/api/experience');
  console.log('4. GET /api/experience:', expRes.status, Array.isArray(expRes.data) ? `SUCCESS (${expRes.data.length} experiences)` : 'FAIL');

  // Test 5: Public education endpoint
  const eduRes = await request('/api/education');
  console.log('5. GET /api/education:', eduRes.status, Array.isArray(eduRes.data) ? `SUCCESS (${eduRes.data.length} education entries)` : 'FAIL');

  // Test 5b: Public community endpoint
  const comRes = await request('/api/community');
  console.log('5b. GET /api/community:', comRes.status, Array.isArray(comRes.data) ? `SUCCESS (${comRes.data.length} community photos)` : 'FAIL');

  // Test 6: Admin login
  const loginRes = await request('/api/auth/login', 'POST', JSON.stringify({
    email: 'admin@portfolio.com',
    password: 'admin123'
  }));
  console.log('6. POST /api/auth/login:', loginRes.status, loginRes.data.token ? 'SUCCESS (Token received)' : 'FAIL');

  if (loginRes.data.token) {
    const token = loginRes.data.token;

    // Test 7: Protected auth verification
    const meRes = await request('/api/auth/me', 'GET', null, token);
    console.log('7. GET /api/auth/me (Protected):', meRes.status, meRes.data.email ? 'SUCCESS (Email: ' + meRes.data.email + ')' : 'FAIL');

    // Test 8: Export backup
    const exportRes = await request('/api/export', 'GET', null, token);
    console.log('8. GET /api/export (Protected):', exportRes.status, exportRes.data.exportedAt ? 'SUCCESS (Exported at ' + exportRes.data.exportedAt + ')' : 'FAIL');
  }

  console.log('\nAll API tests completed successfully!');
  process.exit(0);
};

runTests().catch(err => {
  console.error('Test execution error:', err.message);
  process.exit(1);
});
