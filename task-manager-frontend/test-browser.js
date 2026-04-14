const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('正在访问 http://localhost:3004...');
  await page.goto('http://localhost:3004', { waitUntil: 'networkidle', timeout: 10000 });
  
  // 等待一下让页面渲染
  await page.waitForTimeout(3000);
  
  // 截图
  await page.screenshot({ path: '/tmp/frontend-screenshot.png', fullPage: true });
  console.log('截图已保存到 /tmp/frontend-screenshot.png');
  
  // 获取控制台日志
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push(msg.text()));
  page.on('pageerror', err => console.log('页面错误:', err.message));
  
  // 获取页面内容
  const title = await page.title();
  const content = await page.content();
  
  console.log('页面标题:', title);
  console.log('页面内容长度:', content.length);
  
  // 检查是否有 React 根元素
  const rootExists = await page.$('#root');
  console.log('React 根元素存在:', !!rootExists);
  
  // 获取 React 组件内容
  if (rootExists) {
    const rootText = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML : 'null';
    });
    console.log('React 根元素内容:', rootText.substring(0, 500));
  }
  
  // 显示控制台消息
  if (consoleMessages.length > 0) {
    console.log('\n控制台消息:');
    consoleMessages.slice(0, 10).forEach(msg => console.log('  -', msg));
  }
  
  console.log('\n请查看截图 /tmp/frontend-screenshot.png');
  console.log('按任意键关闭浏览器...');
  
  await browser.close();
})();
