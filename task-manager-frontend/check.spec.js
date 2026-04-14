import { test, expect } from '@playwright/test';

test('详细检查前端页面', async ({ page }) => {
  console.log('正在访问 http://localhost:3004...\n');
  
  await page.goto('http://localhost:3004', { 
    waitUntil: 'networkidle',
    timeout: 15000 
  });
  
  await page.waitForTimeout(4000);
  
  await page.screenshot({ 
    path: '/Users/aya4dw/.openclaw/workspace/frontend-screenshot.png', 
    fullPage: true 
  });
  console.log('截图已保存');
  
  const title = await page.title();
  console.log('\n=== 页面信息 ===');
  console.log('标题:', title);
  
  const rootContent = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root ? {
      innerText: root.innerText.substring(0, 500),
      childCount: root.children.length,
      firstChildTag: root.children.length > 0 ? root.children[0].tagName : 'none'
    } : 'null';
  });
  
  console.log('Root 内容:', rootContent.innerText || '空');
  console.log('子元素数量:', rootContent.childCount);
  
  const navItems = await page.$$('nav a');
  console.log('\n=== 导航栏 ===');
  console.log('导航链接:', navItems.length);
  
  for (let i = 0; i < navItems.length; i++) {
    const text = await navItems[i].innerText();
    console.log('  -', text);
  }
  
  const h1 = await page.$('h1');
  if (h1) {
    const text = await h1.innerText();
    console.log('\n=== 主标题 ===');
    console.log('H1:', text);
  }
  
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  
  await page.waitForTimeout(2000);
  
  if (errors.length > 0) {
    console.log('\n=== 错误 ===');
    errors.forEach(e => console.log('  ❌', e));
  } else {
    console.log('\n✅ 无错误');
  }
  
  console.log('\n浏览器打开中...');
  await page.waitForTimeout(5000);
});
