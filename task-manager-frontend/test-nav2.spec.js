import { test, expect } from '@playwright/test';

test('验证页面内容切换', async ({ page }) => {
  const BASE_URL = 'http://100.107.19.52:3004';
  
  console.log('=== 验证页面内容切换 ===\n');
  
  // 1. 访问看板页面
  await page.goto(`${BASE_URL}/kanban`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const kanbanText = await page.locator('body').innerText();
  console.log('看板页面关键词:', kanbanText.includes('任务看板') ? '✅' : '❌');
  console.log('看板页面关键词:', kanbanText.includes('待处理') ? '✅' : '❌');
  
  // 2. 点击 Dashboard
  await page.click('a:has-text("仪表盘")');
  await page.waitForTimeout(2000);
  
  const dashboardText = await page.locator('body').innerText();
  console.log('\nDashboard URL:', page.url());
  console.log('Dashboard 页面关键词:', dashboardText.includes('总任务数') ? '✅' : '❌');
  console.log('Dashboard 页面关键词:', dashboardText.includes('任务统计') ? '✅' : '❌');
  
  if (dashboardText.includes('任务看板')) {
    console.log('❌ 仍然是看板页面内容！');
  } else {
    console.log('✅ 已切换到 Dashboard');
  }
  
  await page.screenshot({ path: '/Users/aya4dw/.openclaw/workspace/test-final-dashboard.png', fullPage: true });
});
