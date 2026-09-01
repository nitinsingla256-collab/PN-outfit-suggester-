import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Disable local storage
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(window, 'localStorage', {
      get: function() { throw new DOMException("Access is denied for this document.", "SecurityError"); }
    });
    Object.defineProperty(window, 'sessionStorage', {
      get: function() { throw new DOMException("Access is denied for this document.", "SecurityError"); }
    });
  });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  console.log("Page loaded!");
  
  const content = await page.$eval('#root', el => el.innerHTML);
  console.log("Root length:", content.length);
  if (content.length < 500) {
      console.log(content);
  }
  
  await browser.close();
})();
