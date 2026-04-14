import { test, expect } from '@playwright/test';

test('测试看板页面导航', async ({ page }) => {
  const BASE_URL = 'http://100.107.19.52:3004';
  
  console.log('=== 测试看板页面导航 ===\n');
  
  // 1. 访问看板页面
  await page.goto(`${BASE_URL}/kanban`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: '/Users/aya4dw/.openclaw/workspace/test-nav-kanban.png', fullPage: true });
  console.log('1. 看板页面截图已保存');
  
  // 2. 尝试点击 Dashboard
  console.log('\n2. 尝试点击 Dashboard');
  const dashboardLink = await page.$('a:has-text("仪表盘")');
  console.log('Dashboard 链接存在:', !!dashboardLink);
  
  if (dashboardLink) {
    await dashboardLink.click();
    await page.waitForTimeout(2000);
    
    // 检查 URL 是否变化
    const url = page.url();
    console.log('当前 URL:', url);
    
    await page.screenshot({ path: '/Users/aya4dw/.openclaw/workspace/test-nav-dashboard.png', fullPage: true });
    console.log('Dashboard 截图已保存');
    
    // 检查是否在 Dashboard 页面
    const h1 = await page.$('h1');
    const h1Text = await h1?.innerText();
    console.log('页面标题:', h1Text);
    
    if (url.includes('/kanban')) {
      console.log('❌ URL 仍然在看板页面，导航失败');
    } else {
      console.log('✅ 导航成功');
    }
  } else {
    console.log('❌ Dashboard 链接不存在');
  }
  
  // 获取页面 HTML 结构
  const navHtml = await page.locator('nav').innerHTML();
  console.log('\n=== 导航栏 HTML ===');
  console.log(navHtml.substring(0, 1000));
});
