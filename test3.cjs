const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('pn_auth_token_v1', 'local_tok_123');
    localStorage.setItem('pn_local_current_user_v1', JSON.stringify({
      id: 'usr_1', name: 'Test', email: 'test@example.com', role: 'user', preferences: {}
    }));
  });
  
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.content();
  console.log("HTML length after fake login:", content.length);
  await browser.close();
})();
