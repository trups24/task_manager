const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Capture console logs
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    console.log('Navigating to login...');
    await page.goto('http://localhost:4200/login', { waitUntil: 'networkidle2' });

    console.log('Logging in...');
    await page.type('input[type="email"]', 'admin@example.com');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    console.log('Waiting for admin dashboard...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('Clicking Add User...');
    // The button might have text 'Add User'
    const buttons = await page.$$('button');
    let addBtn;
    for (let btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Add User')) {
        addBtn = btn;
        break;
      }
    }
    
    if (addBtn) {
      await addBtn.click();
      console.log('Clicked Add User, waiting for modal...');
      await page.waitForTimeout(1000); // Wait for modal animation
      
      console.log('Clicking Create with empty form...');
      const createBtns = await page.$$('.modal-footer button.btn-primary');
      if (createBtns.length > 0) {
        await createBtns[0].click();
        await page.waitForTimeout(500); // Wait for validation update
        
        console.log('Filling out form...');
        await page.type('input[formControlName="username"]', 'testuser99');
        await page.type('input[formControlName="email"]', 'test99@example.com');
        await page.type('input[formControlName="password"]', 'password123');
        
        console.log('Clicking Create with filled form...');
        await createBtns[0].click();
        
        await page.waitForTimeout(2000); // Wait for API response
        console.log('Done.');
      } else {
        console.log('Create button not found.');
      }
    } else {
      console.log('Add User button not found.');
    }

    await browser.close();
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
})();
