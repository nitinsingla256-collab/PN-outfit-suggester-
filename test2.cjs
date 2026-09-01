const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  console.log("Typing login info...");
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'nitinsingla256@gmail.com');
  await page.type('input[type="password"]', 'client123');
  
  console.log("Clicking sign in...");
  const [response] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);
  
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.content();
  console.log("After login HTML length:", content.length);
  await browser.close();
})();
