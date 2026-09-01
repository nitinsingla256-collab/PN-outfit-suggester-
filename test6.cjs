const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  console.log("Waiting for login form...");
  await page.waitForSelector('input[type="email"]');
  
  // Fill the "client@pn.outfit" / "client123" which is the fallback
  await page.evaluate(() => {
    const email = document.querySelector('input[type="email"]');
    const pwd = document.querySelector('input[type="password"]');
    // React needs native setter to trigger events
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(email, 'client@pn.outfit');
    email.dispatchEvent(new Event('input', { bubbles: true }));
    
    nativeInputValueSetter.call(pwd, 'client123');
    pwd.dispatchEvent(new Event('input', { bubbles: true }));
  });
  
  console.log("Submitting login form...");
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 4000));
  
  const content = await page.content();
  console.log("HTML length after login submit:", content.length);
  await browser.close();
})();
