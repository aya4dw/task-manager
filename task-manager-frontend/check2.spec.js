import { test, expect } from '@playwright/test';

test('检查 React 渲染', async ({ page }) => {
  const errors = [];
  const logs = [];
  
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => logs.push(msg.text()));
  
  await page.goto('http://localhost:3004', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(5000);
  
  // 检查 HTML 结构
  const html = await page.content();
  console.log('HTML 长度:', html.length);
  console.log('有 root 元素:', html.includes('<div id="root"></div>') || html.includes('<div id="root">'));
  
  // 检查 root 元素
  const root = await page.$('#root');
  if (root) {
    const innerHTML = await root.innerHTML();
    console.log('\nRoot innerHTML (前 500 字符):');
    console.log(innerHTML.substring(0, 500));
  }
  
  // 检查 body
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('\nBody 文本 (前 200 字符):');
  console.log(bodyText.substring(0, 200));
  
  // 检查是否有 React 元素
  const reactRoots = await page.$$('[data-reactroot]');
  console.log('\nReact 根元素数量:', reactRoots.length);
  
  // 输出错误
  if (errors.length > 0) {
    console.log('\n页面错误:');
    errors.forEach(e => console.log('  ❌', e));
  }
  
  // 输出日志
  if (logs.length > 0) {
    console.log('\n控制台日志:');
    logs.forEach(l => console.log('  ', l));
  }
  
  // 截图
  await page.screenshot({ path: '/Users/aya4dw/.openclaw/workspace/screenshot2.png', fullPage: true });
  console.log('\n截图已保存');
  
  await page.waitForTimeout(3000);
});
