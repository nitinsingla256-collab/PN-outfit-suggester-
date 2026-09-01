const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  let reloads = 0;
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      reloads++;
      console.log(`Navigated. Reloads: ${reloads}`);
    }
  });
  
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  await page.evaluate(() => {
    localStorage.setItem('pn_auth_token_v1', 'paurvi_tok_524dfffe916b61d3ca1c422b0a9e28ca7862675cb80a03793dc60a622a589358');
  });
  
  await page.reload({ waitUntil: 'networkidle0' });
  
  // Wait a bit to see if it starts looping
  await new Promise(r => setTimeout(r, 5000));
  console.log("Total navigations observed:", reloads);
  await browser.close();
})();
