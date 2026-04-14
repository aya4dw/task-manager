import { test, expect } from '@playwright/test';

test('检查控制台', async ({ page }) => {
  const errors = [];
  const logs = [];
  
  page.on('pageerror', err => {
    errors.push(err.message);
    console.log('❌ ERROR:', err.message);
  });
  
  page.on('console', msg => {
    logs.push(msg.text());
    console.log('📝 LOG:', msg.text());
  });
  
  console.log('=== 检查控制台 ===\n');
  
  // 访问看板
  await page.goto('http://100.107.19.52:3004/kanban', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('\n1. 访问看板完成\n');
  
  // 点击 Dashboard
  console.log('2. 点击 Dashboard...');
  await page.click('a:has-text("仪表盘")');
  await page.waitForTimeout(3000);
  console.log('完成\n');
  
  // 检查
  console.log('3. 检查结果:');
  console.log('   URL:', page.url());
  console.log('   错误数量:', errors.length);
  console.log('   日志数量:', logs.length);
  
  if (errors.length === 0) {
    console.log('✅ 无错误');
  }
  
  const text = await page.locator('body').innerText();
  console.log('   页面类型:', text.includes('任务看板') ? '看板' : text.includes('总任务数') ? 'Dashboard' : '未知');
});
