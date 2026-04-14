import { test, expect } from '@playwright/test';

test('测试 Kanban 页面 API 调用', async ({ page }) => {
  const REMOTE_URL = 'http://100.107.19.52:3004';
  
  console.log(`=== 测试 Kanban 页面 API ===\n`);
  
  // 监听网络请求
  const apiRequests = [];
  const apiResponses = [];
  
  page.on('request', req => {
    if (req.url().includes('/api/')) {
      apiRequests.push({
        url: req.url(),
        method: req.method(),
        timestamp: Date.now()
      });
      console.log('📤 API 请求:', req.method(), req.url());
    }
  });
  
  page.on('response', async res => {
    if (res.url().includes('/api/')) {
      const status = res.status();
      const text = await res.text().catch(() => '(error)');
      apiResponses.push({
        url: res.url(),
        status,
        text: text.substring(0, 200)
      });
      console.log(`📥 API 响应：${status} ${res.url()}`);
      if (status !== 200) {
        console.log('  内容:', text.substring(0, 300));
      }
    }
  });
  
  // 监听错误
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  
  // 访问 Kanban 页面
  await page.goto(`${REMOTE_URL}/kanban`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(5000);
  
  // 等待所有请求完成
  await page.waitForTimeout(2000);
  
  console.log('\n=== 统计 ===');
  console.log('API 请求数量:', apiRequests.length);
  console.log('API 响应数量:', apiResponses.length);
  
  if (apiRequests.length === 0) {
    console.log('\n⚠️ 没有发现 API 请求！');
  }
  
  // 截图
  await page.screenshot({ 
    path: '/Users/aya4dw/.openclaw/workspace/test-kanban.png', 
    fullPage: true 
  });
  console.log('✅ 截图已保存');
  
  if (errors.length > 0) {
    console.log('\n❌ 错误:');
    errors.forEach(e => console.log('  -', e));
  }
});
