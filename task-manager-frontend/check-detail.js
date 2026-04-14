import { test, expect } from '@playwright/test';

test('详细检查前端页面', async ({ page }) => {
  console.log('正在访问 http://localhost:3004...\n');
  
  await page.goto('http://localhost:3004', { 
    waitUntil: 'networkidle',
    timeout: 15000 
  });
  
  // 等待 React 渲染
  await page.waitForTimeout(4000);
  
  // 截图
  await page.screenshot({ 
    path: '/Users/aya4dw/.openclaw/workspace/frontend-screenshot.png', 
    fullPage: true 
  });
  console.log('截图已保存到 workspace/frontend-screenshot.png');
  
  // 获取页面信息
  const title = await page.title();
  console.log('\n=== 页面信息 ===');
  console.log('标题:', title);
  
  // 获取 root 元素内容
  const rootContent = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root ? {
      innerText: root.innerText.substring(0, 500),
      childCount: root.children.length,
      firstChildTag: root.children.length > 0 ? root.children[0].tagName : 'none'
    } : 'null';
  });
  
  console.log('Root 元素内容:', rootContent.innerText || '空');
  console.log('Root 子元素数量:', rootContent.childCount);
  console.log('第一个子元素:', rootContent.firstChildTag);
  
  // 检查导航栏
  const navItems = await page.$$('nav a');
  console.log('\n=== 导航栏 ===');
  console.log('导航链接数量:', navItems.length);
  
  for (let i = 0; i < navItems.length; i++) {
    const text = await navItems[i].innerText();
    console.log(`  - ${text}`);
  }
  
  // 检查页面内容
  const h1 = await page.$('h1');
  if (h1) {
    const h1Text = await h1.innerText();
    console.log('\n=== 标题 ===');
    console.log('H1:', h1Text);
  }
  
  // 检查控制台错误
  const consoleLogs = [];
  const errors = [];
  
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
  });
  
  // 等待一下看是否有错误
  await page.waitForTimeout(2000);
  
  if (errors.length > 0) {
    console.log('\n=== 页面错误 ===');
    errors.forEach(e => console.log('  ❌', e));
  } else {
    console.log('\n✅ 没有 JavaScript 错误');
  }
  
  if (consoleLogs.length > 0) {
    console.log('\n=== 控制台日志（前 5 条）===');
    consoleLogs.slice(0, 5).forEach(log => console.log('  ', log));
  }
  
  console.log('\n浏览器已打开，5 秒后关闭...');
  await page.waitForTimeout(5000);
});
