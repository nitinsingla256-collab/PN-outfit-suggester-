import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';

(async () => {
  console.log("Starting server in production...");
  const server = spawn('npm', ['run', 'start'], { detached: true, env: { ...process.env, NODE_ENV: 'production' } });
  
  // wait a bit for server to start
  await new Promise(r => setTimeout(r, 3000));
  
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  console.log("Navigating to localhost:3000...");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  console.log("Waiting a bit...");
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.content();
  console.log("BODY HTML length:", content.length);
  const rootContent = await page.evaluate(() => document.getElementById('root').innerHTML);
  console.log("ROOT HTML length:", rootContent.length);
  
  await browser.close();
  try { process.kill(-server.pid); } catch(e){}
  process.exit(0);
})();
