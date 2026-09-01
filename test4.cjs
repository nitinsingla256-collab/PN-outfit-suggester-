const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  // Go to Register tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const registerBtn = btns.find(b => b.innerText.includes('Create Account') || b.innerText.includes('Register'));
    if (registerBtn) registerBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  // Fill the "client@pn.outfit" / "client123" which is the fallback
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    
    // Assume 1st is name, 2nd is email, 3rd is pwd
    nativeInputValueSetter.call(inputs[0], 'John Doe');
    inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    
    nativeInputValueSetter.call(inputs[1], 'johndoe' + Date.now() + '@example.com');
    inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    
    nativeInputValueSetter.call(inputs[2], 'password123');
    inputs[2].dispatchEvent(new Event('input', { bubbles: true }));
  });
  
  console.log("Submitting register form...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button[type="submit"]'));
    if (btns.length > 0) btns[0].click();
  });
  
  await new Promise(r => setTimeout(r, 4000));
  
  const content = await page.content();
  console.log("HTML length after register submit:", content.length);
  await browser.close();
})();
