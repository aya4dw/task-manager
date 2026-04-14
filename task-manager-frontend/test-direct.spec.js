import { test, expect } from '@playwright/test';

test('直接访问 Dashboard', async ({ page }) => {
  console.log('=== 直接访问 Dashboard ===\n');
  
  // 直接访问 Dashboard
  await page.goto('http://100.107.19.52:3004/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const text = await page.locator('body').innerText();
  console.log('页面内容前 500 字符:');
  console.log(text.substring(0, 500));
  
  console.log('\n是否有 Dashboard 内容:');
  console.log('总任务数:', text.includes('总任务数') ? '✅' : '❌');
  console.log('任务统计:', text.includes('任务统计') ? '✅' : '❌');
  console.log('紧急任务:', text.includes('紧急任务') ? '✅' : '❌');
  
  await page.screenshot({ path: '/Users/aya4dw/.openclaw/workspace/test-direct.png', fullPage: true });
});
