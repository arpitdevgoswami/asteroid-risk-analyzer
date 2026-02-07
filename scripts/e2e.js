const puppeteer = require('puppeteer');

(async () => {
  const logs = { console: [], requests: [], responses: [] };
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  page.on('console', msg => {
    try { logs.console.push({ type: msg.type(), text: msg.text() }); } catch (e) {}
  });

  page.on('request', req => {
    logs.requests.push({ url: req.url(), method: req.method(), headers: req.headers() });
  });

  page.on('response', async res => {
    try {
      const ct = res.headers()['content-type'] || '';
      let body = null;
      if (ct.includes('application/json')) {
        body = await res.json();
      } else {
        try { body = await res.text(); } catch (e) { body = '<binary or no body>'; }
      }
      logs.responses.push({ url: res.url(), status: res.status(), headers: res.headers(), body });
    } catch (e) {
      logs.responses.push({ url: res.url(), status: res.status(), error: String(e) });
    }
  });

  try {
    const base = 'http://localhost:3000';
    await page.goto(base, { waitUntil: 'networkidle2' });

    // Fill login form
    await page.type('#loginUsername', 'proxy_test_user');
    await page.type('#loginPassword', 'secret123');

    // Submit and wait for navigation or a short delay
    await Promise.all([
      page.click('#loginBtn'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})
    ]);

    // Wait a moment for any XHR/fetch
    await new Promise((r) => setTimeout(r, 1500));

    // Print summary
    console.log('\n=== Console Logs ===');
    logs.console.forEach(l => console.log(l.type, l.text));

    console.log('\n=== Requests ===');
    logs.requests.slice(-20).forEach(r => console.log(r.method, r.url));

    console.log('\n=== Responses (recent) ===');
    logs.responses.slice(-10).forEach(r => {
      console.log(r.status, r.url);
      if (r.body && typeof r.body === 'object') console.log('  JSON body keys:', Object.keys(r.body));
    });

    // Also attempt to read token from localStorage
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    console.log('\n=== LocalStorage token ===');
    console.log(token || '<no token>');

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('E2E ERROR:', err && err.message ? err.message : err);
    await browser.close();
    process.exit(2);
  }
})();
