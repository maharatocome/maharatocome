const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, 'output');

async function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1280, height: 800 } });
  const page = await browser.newPage();

  // 1. Home Page (Logged out)
  await page.goto('http://localhost:3000');
  await delay(2000);
  await page.screenshot({ path: path.join(OUT_DIR, 'home_logged_out.png') });

  // 2. Login Page
  await page.goto('http://localhost:3000/auth/login');
  await delay(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'login.png') });

  // Login
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const b of buttons) {
      if (b.textContent.includes('karim@talentdz.dz')) {
        b.click();
        break;
      }
    }
  });
  await delay(500);
  await page.click('#login-submit');
  await delay(2000);

  // 3. Home Page (Logged in)
  await page.screenshot({ path: path.join(OUT_DIR, 'home_logged_in.png') });

  // 4. Create Post
  await page.goto('http://localhost:3000/posts/create');
  await delay(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'create_post.png') });

  // 5. Matching Page
  await page.goto('http://localhost:3000/matching');
  await delay(2000); // Wait for matchings to load
  await page.screenshot({ path: path.join(OUT_DIR, 'matching.png') });

  // 6. Profile Page
  await page.goto('http://localhost:3000/profile/1'); // Trying to hit Karim's profile. We don't have the exact ID.
  // Actually, we can click on the profile link from the home page.
  await page.goto('http://localhost:3000');
  await delay(1000);
  await page.click('.sidebar-left a[href^="/profile/"]');
  await delay(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'profile.png') });

  await browser.close();
})();
