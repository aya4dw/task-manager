import { test, expect } from '@playwright/test';

test('检查前端页面', async ({ page }) => {
  console.log('正在访问 http://localhost:3004...');
  
  await page.goto('http://localhost:3004', { 
    waitUntil: 'networkidle',
    timeout: 15000 
  });
  
  // 等待页面渲染
  await page.waitForTimeout(3000);
  
  // 截图
  await page.screenshot({ 
    path: '/tmp/frontend-check.png', 
    fullPage: true 
  });
  console.log('截图已保存到 /tmp/frontend-check.png');
  
  // 获取页面信息
  const title = await page.title();
  const content = await page.content();
  const bodyText = await page.evaluate(() => document.body.innerText);
  
  console.log('\n=== 页面信息 ===');
  console.log('标题:', title);
  console.log('内容长度:', content.length);
  console.log('页面文字:', bodyText.substring(0, 300));
  
  // 检查是否有 React 错误
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  
  if (errors.length > 0) {
    console.log('\n页面错误:');
    errors.forEach(e => console.log('  -', e));
  }
  
  // 等待 10 秒让用户查看浏览器
  console.log('\n浏览器已打开，10 秒后关闭...');
  await page.waitForTimeout(10000);
});
