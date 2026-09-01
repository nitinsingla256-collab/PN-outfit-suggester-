const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
  
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  await page.evaluate(() => {
    localStorage.setItem('pn_auth_token_v1', 'paurvi_tok_524dfffe916b61d3ca1c422b0a9e28ca7862675cb80a03793dc60a622a589358');
  });
  
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3000));
  
  const content = await page.content();
  console.log("HTML length:", content.length);
  await browser.close();
})();
