const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  await page.evaluate(() => {
    localStorage.setItem('pn_auth_token_v1', 'paurvi_tok_524dfffe916b61d3ca1c422b0a9e28ca7862675cb80a03793dc60a622a589358');
  });
  
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.content();
  const fs = require('fs');
  fs.writeFileSync('page_dump.html', content);
  console.log("HTML dumped to page_dump.html");
  await browser.close();
})();
