import { test, expect } from '@playwright/test';

test('调试导航问题', async ({ page }) => {
  const errors = [];
  const logs = [];
  
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => logs.push(msg.text()));
  
  console.log('=== 调试导航问题 ===\n');
  
  // 1. 访问看板
  await page.goto('http://100.107.19.52:3004/kanban', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('1. 访问看板完成');
  
  // 2. 点击 Dashboard
  await page.click('a:has-text("仪表盘")');
  await page.waitForTimeout(3000);
  console.log('2. 点击 Dashboard 完成');
  
  // 3. 检查 URL
  const url = page.url();
  console.log('3. 当前 URL:', url);
  
  // 4. 检查 root 元素
  const root = await page.$('#root');
  const rootChildren = await page.$$eval('#root > *', nodes => nodes.length);
  console.log('4. Root 子元素数量:', rootChildren);
  
  // 5. 检查页面内容
  const text = await page.locator('body').innerText();
  console.log('5. 页面内容前 200 字符:');
  console.log(text.substring(0, 200));
  
  // 6. 检查控制台错误
  if (errors.length > 0) {
    console.log('\n6. 错误:');
    errors.forEach(e => console.log('  -', e));
  }
  
  // 7. 强制刷新
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const textAfter = await page.locator('body').innerText();
  console.log('\n7. 刷新后页面内容前 200 字符:');
  console.log(textAfter.substring(0, 200));
  console.log('刷新后是否有 Dashboard:', textAfter.includes('总任务数') ? '✅' : '❌');
});
