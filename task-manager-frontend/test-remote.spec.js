import { test, expect } from '@playwright/test';

test('远程地址测试 100.107.19.52', async ({ page }) => {
  const REMOTE_URL = 'http://100.107.19.52:3004';
  
  console.log(`=== 测试远程地址：${REMOTE_URL} ===\n`);
  
  // 监听控制台日志
  const logs = [];
  const errors = [];
  
  page.on('console', msg => {
    logs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
  });
  
  // 监听网络请求
  const requests = [];
  page.on('request', req => {
    requests.push({
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType()
    });
  });
  
  // 监听响应
  const responses = [];
  page.on('response', async res => {
    try {
      const body = await res.body();
      const text = body.toString();
      responses.push({
        url: res.url(),
        status: res.status(),
        text: text.substring(0, 200)
      });
    } catch (e) {
      responses.push({
        url: res.url(),
        status: res.status(),
        text: '(error reading body)'
      });
    }
  });
  
  try {
    console.log('正在访问远程地址...');
    await page.goto(REMOTE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    console.log('✅ 页面加载成功');
    
    await page.waitForTimeout(3000);
    
    // 截图
    await page.screenshot({ 
      path: '/Users/aya4dw/.openclaw/workspace/test-remote.png', 
      fullPage: true 
    });
    console.log('✅ 截图已保存');
    
    // 检查页面内容
    const title = await page.title();
    console.log('\n=== 页面信息 ===');
    console.log('标题:', title);
    
    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerText.substring(0, 300) : 'null';
    });
    console.log('页面内容:', rootContent);
    
    // 检查 API 请求
    console.log('\n=== API 请求检查 ===');
    const apiRequests = requests.filter(r => r.url.includes('/api/'));
    console.log('API 请求数量:', apiRequests.length);
    
    for (let i = 0; i < apiRequests.length; i++) {
      console.log(`  ${i+1}. ${apiRequests[i].method} ${apiRequests[i].url}`);
    }
    
    // 检查 API 响应
    const apiResponses = responses.filter(r => r.url.includes('/api/'));
    console.log('\nAPI 响应数量:', apiResponses.length);
    
    for (let i = 0; i < apiResponses.length && i < 5; i++) {
      console.log(`  ${i+1}. ${apiResponses[i].status} ${apiResponses[i].url}`);
      if (apiResponses[i].status !== 200) {
        console.log(`     内容：${apiResponses[i].text}`);
      }
    }
    
    // 检查控制台错误
    console.log('\n=== 页面错误 ===');
    if (errors.length === 0) {
      console.log('✅ 无错误');
    } else {
      console.log('❌ 发现错误:');
      errors.forEach(e => console.log('  -', e));
    }
    
    // 检查控制台日志 (只显示相关)
    console.log('\n=== 控制台日志 (前 10 条) ===');
    logs.slice(0, 10).forEach(log => console.log('  ', log));
    
    // 特殊检查 timeout 错误
    const timeoutLogs = logs.filter(l => l.toLowerCase().includes('timeout') || l.toLowerCase().includes('exceeded'));
    if (timeoutLogs.length > 0) {
      console.log('\n⚠️ 发现 timeout 相关日志:');
      timeoutLogs.forEach(log => console.log('  ', log));
    }
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.log('❌ 访问失败:', error.message);
  }
});
