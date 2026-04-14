const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3004', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: '/tmp/page-screenshot.png', fullPage: true });
    
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    
    const title = await page.title();
    const hasRoot = await page.$('#root') !== null;
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    console.log('=== 前端检查结果 ===');
    console.log('标题:', title);
    console.log('有#root 元素:', hasRoot);
    console.log('页面文字:', bodyText.substring(0, 200));
    console.log('错误数量:', errors.length);
    if (errors.length > 0) {
      errors.forEach(e => console.log('  -', e));
    }
    console.log('截图:', '/tmp/page-screenshot.png');
  } catch (e) {
    console.log('错误:', e.message);
  }
  
  await browser.close();
})();
