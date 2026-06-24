const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'output');
const videoPath = path.join(OUT_DIR, 'demo_app.mp4');

async function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function showBubble(page, text, selector, position = 'bottom') {
  await page.evaluate((txt, sel, pos) => {
    // Remove existing bubbles
    const existing = document.getElementById('demo-bubble');
    if (existing) existing.remove();

    const target = sel ? document.querySelector(sel) : document.body;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const bubble = document.createElement('div');
    bubble.id = 'demo-bubble';
    bubble.style.position = 'fixed';
    bubble.style.zIndex = '999999';
    bubble.style.backgroundColor = '#4F46E5';
    bubble.style.color = 'white';
    bubble.style.padding = '14px 20px';
    bubble.style.borderRadius = '12px';
    bubble.style.fontSize = '18px';
    bubble.style.fontWeight = '600';
    bubble.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.4)';
    bubble.style.maxWidth = '400px';
    bubble.style.lineHeight = '1.5';
    bubble.style.fontFamily = 'Inter, sans-serif';
    bubble.style.transition = 'all 0.3s ease';
    bubble.style.opacity = '0';
    bubble.innerText = txt;

    document.body.appendChild(bubble);

    // Calculate position
    const bRect = bubble.getBoundingClientRect();
    let top, left;

    if (sel) {
      if (pos === 'bottom') {
        top = rect.bottom + 15;
        left = rect.left + (rect.width / 2) - (bRect.width / 2);
      } else if (pos === 'top') {
        top = rect.top - bRect.height - 15;
        left = rect.left + (rect.width / 2) - (bRect.width / 2);
      } else if (pos === 'right') {
        top = rect.top + (rect.height / 2) - (bRect.height / 2);
        left = rect.right + 15;
      }
    } else {
      // Center on screen
      top = (window.innerHeight / 2) - (bRect.height / 2);
      left = (window.innerWidth / 2) - (bRect.width / 2);
    }

    // Keep inside screen
    left = Math.max(10, Math.min(left, window.innerWidth - bRect.width - 10));
    top = Math.max(10, Math.min(top, window.innerHeight - bRect.height - 10));

    bubble.style.top = top + 'px';
    bubble.style.left = left + 'px';

    // Fade in
    requestAnimationFrame(() => {
      bubble.style.opacity = '1';
      bubble.style.transform = 'translateY(0) scale(1)';
    });
  }, text, selector, position);
  
  await delay(500); // Wait for fade in
}

async function hideBubble(page) {
  await page.evaluate(() => {
    const bubble = document.getElementById('demo-bubble');
    if (bubble) {
      bubble.style.opacity = '0';
      setTimeout(() => bubble.remove(), 300);
    }
  });
  await delay(300);
}

(async () => {
  console.log("Starting browser...");
  const browser = await puppeteer.launch({ 
    headless: 'new', 
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();

  console.log("Initializing recorder...");
  const recorder = new PuppeteerScreenRecorder(page, {
    ffmpeg_Path: ffmpegPath || null,
    fps: 30,
    videoFrame: { width: 1280, height: 800 },
    videoCodec: 'libx264',
    videoPreset: 'ultrafast'
  });

  console.log("Starting recording...");
  await recorder.start(videoPath);

  try {
    // 1. Home Page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await delay(1000);
    await showBubble(page, "Bienvenue sur MAHARAtoCOME. Voici le flux d'annonces publiques.", null);
    await delay(3000);
    await hideBubble(page);

    await showBubble(page, "Vous pouvez voir les offres et recherches disponibles sans compte.", '.feed-grid main', 'top');
    await delay(3000);
    await hideBubble(page);

    // 2. Go to Login
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
    await delay(1000);
    
    await showBubble(page, "Pour accéder aux fonctionnalités avancées, connectons-nous.", '.glass-card h1', 'bottom');
    await delay(2500);
    await hideBubble(page);

    await showBubble(page, "Nous utilisons un compte démo Expert.", 'button', 'right');
    await delay(2000);
    
    // Login steps
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const b of buttons) {
        if (b.textContent.includes('karim@talentdz.dz')) {
          b.click();
          break;
        }
      }
    });
    await delay(1000);
    await hideBubble(page);

    await showBubble(page, "On valide la connexion !", '#login-submit', 'bottom');
    await delay(1500);
    await page.click('#login-submit');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await hideBubble(page);

    // 3. Logged In Home
    await delay(1000);
    await showBubble(page, "Nous voici sur le tableau de bord personnalisé.", '.sidebar-left', 'right');
    await delay(3000);
    await hideBubble(page);

    await showBubble(page, "Le système met en avant les compétences les plus recherchées du marché algérien.", '.sidebar-right', 'left');
    await delay(3000);
    await hideBubble(page);

    // 4. Create Post
    await showBubble(page, "Créer une publication est très intuitif.", 'a[href="/posts/create"]', 'bottom');
    await delay(2000);
    await page.goto('http://localhost:3000/posts/create', { waitUntil: 'networkidle2' });
    await hideBubble(page);

    await showBubble(page, "Vous pouvez choisir de proposer un service...", '.type-toggle', 'bottom');
    await delay(3500);
    await hideBubble(page);

    await page.evaluate(() => {
        const btns = document.querySelectorAll('.type-btn');
        for (const b of btns) if (b.textContent.includes('recherche')) b.click();
    });
    await delay(1000);
    
    await showBubble(page, "... ou de formuler un besoin précis.", '.type-toggle', 'bottom');
    await delay(3500);
    await hideBubble(page);

    await showBubble(page, "La sélection des compétences est requise pour guider notre IA de mise en relation.", null);
    await delay(4000);
    await hideBubble(page);

    // 5. Matching
    await showBubble(page, "Découvrons l'Algorithme de Matching IA.", 'a[href="/matching"]', 'bottom');
    await delay(2000);
    await page.goto('http://localhost:3000/matching', { waitUntil: 'networkidle2' });
    await hideBubble(page);

    await delay(1500);
    await showBubble(page, "Notre IA croise automatiquement les offres et les recherches.", 'h1', 'bottom');
    await delay(3000);
    await hideBubble(page);

    await showBubble(page, "Un score de compatibilité vous indique les meilleures collaborations possibles.", '.score-ring', 'right');
    await delay(3500);
    await hideBubble(page);

    // 5. Profile
    await showBubble(page, "Cliquons sur un profil pour voir le portfolio.", 'article a[href^="/profile/"]', 'bottom');
    await delay(2000);
    
    // Evaluate to click the first profile link
    await page.evaluate(() => {
        const link = document.querySelector('article a[href^="/profile/"]');
        if (link) link.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await hideBubble(page);

    await delay(1500);
    await showBubble(page, "Le profil met en avant l'expérience et les tags de compétences du talent.", '.glass-card', 'bottom');
    await delay(4000);
    await hideBubble(page);

    await showBubble(page, "Merci d'avoir suivi cette démonstration.", null);
    await delay(3000);

  } catch (err) {
    console.error(err);
  } finally {
    console.log("Stopping recording...");
    await recorder.stop();
    await browser.close();
    console.log("Video saved to " + videoPath);
  }
})();
