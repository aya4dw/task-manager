import { test, expect } from '@playwright/test';

test('检查对话框结构', async ({ page }) => {
  const BASE_URL = 'http://100.107.19.52:3004';
  
  console.log('=== 检查对话框结构 ===\n');
  
  // 访问看板
  await page.goto(`${BASE_URL}/kanban`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // 点击新建任务
  const createBtn = await page.$('button:has-text("新建任务")');
  if (createBtn) {
    await createBtn.click();
    await page.waitForTimeout(3000);
    
    // 截图
    await page.screenshot({ 
      path: '/Users/aya4dw/.openclaw/workspace/debug-dialog.png', 
      fullPage: true 
    });
    console.log('✅ 对话框截图已保存');
    
    // 获取整个对话框的 HTML
    const dialog = await page.$('[class*="DialogContent"], [role="dialog"], .fixed.inset-0 div:last-child');
    if (dialog) {
      const html = await dialog.innerHTML();
      console.log('\n=== 对话框 HTML (前 2000 字符) ===');
      console.log(html.substring(0, 2000));
    }
    
    // 查找所有输入框
    const inputs = await page.$$('input, textarea, select');
    console.log('\n=== 输入框数量 ===');
    console.log('总输入框:', inputs.length);
    
    for (let i = 0; i < inputs.length; i++) {
      const tagName = await inputs[i].tagName();
      const placeholder = await inputs[i].getAttribute('placeholder');
      const id = await inputs[i].getAttribute('id');
      const name = await inputs[i].getAttribute('name');
      const type = await inputs[i].getAttribute('type');
      
      console.log(`\n输入框 ${i+1}:`);
      console.log('  标签:', tagName);
      console.log('  placeholder:', placeholder);
      console.log('  id:', id);
      console.log('  name:', name);
      console.log('  type:', type);
    }
    
    // 查找所有按钮
    const buttons = await page.$$('button');
    console.log('\n=== 按钮数量 ===');
    console.log('总按钮:', buttons.length);
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].innerText();
      console.log(`  ${i+1}. ${text}`);
    }
    
    // 获取页面可见文本
    const textContent = await page.locator('body').innerText();
    console.log('\n=== 页面可见文本 (前 1000 字符) ===');
    console.log(textContent.substring(0, 1000));
    
  } else {
    console.log('❌ 新建任务按钮不存在');
  }
});
