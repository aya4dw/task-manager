import { test, expect } from '@playwright/test';

test('检查 Dashboard 页面内容', async ({ page }) => {
  const BASE_URL = 'http://100.107.19.52:3004';
  
  console.log('=== 检查 Dashboard 页面内容 ===\n');
  
  // 直接访问 Dashboard
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: '/Users/aya4dw/.openclaw/workspace/test-dashboard-full.png', fullPage: true });
  console.log('✅ Dashboard 截图已保存');
  
  // 获取页面内容
  const text = await page.locator('body').innerText();
  console.log('\n=== 页面内容 ===');
  console.log(text);
  
  // 检查是否有 Dashboard 特有的内容
  if (text.includes('总任务数') || text.includes('待处理') || text.includes('统计')) {
    console.log('\n✅ Dashboard 内容正常显示');
  } else {
    console.log('\n⚠️ Dashboard 内容可能未显示');
  }
  
  // 检查 URL
  const url = page.url();
  console.log('\nURL:', url);
  
  // 检查导航栏高亮
  const activeLink = await page.$('a.bg-primary-50');
  console.log('当前激活的导航:', activeLink ? '存在' : '不存在');
});
