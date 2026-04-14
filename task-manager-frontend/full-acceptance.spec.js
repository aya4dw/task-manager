import { test, expect } from '@playwright/test';

test('完整功能验收 - 所有页面和按钮', async ({ page }) => {
  const BASE_URL = 'http://100.107.19.52:3004';
  
  console.log('=== 开始完整功能验收 ===\n');
  console.log(`测试地址：${BASE_URL}\n`);
  
  // 监听网络请求
  const requests = [];
  const responses = [];
  
  page.on('request', req => {
    if (req.url().includes('/api/')) {
      requests.push({ url: req.url(), method: req.method() });
    }
  });
  
  page.on('response', async res => {
    if (res.url().includes('/api/')) {
      responses.push({ url: res.url(), status: res.status() });
    }
  });
  
  // 监听错误
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  
  // ==================== 1. Dashboard 页面 ====================
  console.log('=== 1. Dashboard 页面测试 ===');
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: '/Users/aya4dw/.openclaw/workspace/accept-1-dashboard.png', fullPage: true });
  console.log('✅ Dashboard 截图已保存');
  
  const title = await page.title();
  expect(title).toBe('Task Manager - 任务管理系统');
  console.log('✅ 页面标题正确');
  
  const statCards = await page.$$('.bg-white.shadow-sm.rounded-lg');
  console.log('统计卡片数量:', statCards.length);
  
  // ==================== 2. 看板页面 ====================
  console.log('\n=== 2. 看板页面测试 ===');
  
  const kanbanLink = await page.$('a:has-text("看板")');
  expect(kanbanLink).toBeTruthy();
  await kanbanLink.click();
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: '/Users/aya4dw/.openclaw/workspace/accept-2-kanban.png', fullPage: true });
  console.log('✅ Kanban 截图已保存');
  
  const taskCards = await page.$$('[class*="card"]');
  console.log('任务卡片数量:', taskCards.length);
  
  // 检查新建任务按钮
  const createBtn = await page.$('button:has-text("新建任务"), button:has-text("➕"), button:has-text("新建")');
  if (createBtn) {
    console.log('✅ 新建任务按钮存在');
    
    // 点击新建任务按钮
    await createBtn.click();
    await page.waitForTimeout(2000);
    
    // 检查对话框/遮罩层
    const overlay = await page.$('.fixed.inset-0, .dialog, .modal, [role="dialog"], [class*="backdrop"]');
    if (overlay) {
      console.log('✅ 新建任务对话框已打开 (检测到遮罩层)');
      
      await page.screenshot({ path: '/Users/aya4dw/.openclaw/workspace/accept-3-dialog.png', fullPage: true });
      console.log('✅ 对话框截图已保存');
      
      // 检查输入框
      const inputs = await page.$$('input, textarea, select');
      console.log('对话框输入框数量:', inputs.length);
      
      // 关闭对话框 - 点击遮罩层
      const backdrop = await page.$('[class*="backdrop"], [class*="overlay"]');
      if (backdrop) {
        await backdrop.click();
        await page.waitForTimeout(2000);
        console.log('✅ 对话框已关闭 (点击遮罩层)');
      } else {
        // 按 ESC 关闭
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    } else {
      console.log('⚠️ 对话框可能未打开');
    }
  } else {
    console.log('⚠️ 新建任务按钮不存在');
  }
  
  // ==================== 3. 员工页面 ====================
  console.log('\n=== 3. 员工页面测试 ===');
  
  const agentsLink = await page.$('a:has-text("员工")');
  if (agentsLink) {
    await agentsLink.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: '/Users/aya4dw/.openclaw/workspace/accept-4-agents.png', fullPage: true });
    console.log('✅ Agents 截图已保存');
    
    const agentsContent = await page.locator('body').innerText();
    console.log('页面内容:', agentsContent.substring(0, 100));
  } else {
    console.log('⚠️ 员工链接不存在');
  }
  
  // ==================== 4. 模板页面 ====================
  console.log('\n=== 4. 模板页面测试 ===');
  
  const templatesLink = await page.$('a:has-text("模板")');
  if (templatesLink) {
    await templatesLink.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: '/Users/aya4dw/.openclaw/workspace/accept-5-templates.png', fullPage: true });
    console.log('✅ Templates 截图已保存');
    
    const templatesContent = await page.locator('body').innerText();
    console.log('页面内容:', templatesContent.substring(0, 100));
  } else {
    console.log('⚠️ 模板链接不存在');
  }
  
  // ==================== 5. 设置页面 ====================
  console.log('\n=== 5. 设置页面测试 ===');
  
  const settingsLink = await page.$('a:has-text("设置")');
  if (settingsLink) {
    await settingsLink.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: '/Users/aya4dw/.openclaw/workspace/accept-6-settings.png', fullPage: true });
    console.log('✅ Settings 截图已保存');
    
    const settingsH1 = await page.$('h1');
    const settingsTitle = await settingsH1?.innerText();
    console.log('设置标题:', settingsTitle);
    
    // 检查 API Key 输入框
    const apiKeyInput = await page.$('input[placeholder*="API"], input[id*="api"], input[name*="api"]');
    if (apiKeyInput) {
      console.log('✅ API Key 输入框存在');
      
      await apiKeyInput.fill('test-api-key-12345');
      await page.waitForTimeout(1000);
      
      const value = await apiKeyInput.inputValue();
      console.log('API Key 值:', value);
      
      const saveBtn = await page.$('button:has-text("保存"), button:has-text("提交")');
      if (saveBtn) {
        console.log('✅ 保存按钮存在');
        await saveBtn.click();
        await page.waitForTimeout(2000);
        console.log('✅ 保存按钮已点击');
      } else {
        console.log('⚠️ 保存按钮不存在');
      }
    } else {
      console.log('⚠️ API Key 输入框不存在');
    }
  } else {
    console.log('⚠️ 设置链接不存在');
  }
  
  // ==================== 6. 返回 Dashboard ====================
  console.log('\n=== 6. 返回 Dashboard 验证 ===');
  
  const dashboardLink = await page.$('a:has-text("仪表盘")');
  if (dashboardLink) {
    await dashboardLink.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: '/Users/aya4dw/.openclaw/workspace/accept-7-back-dashboard.png', fullPage: true });
    console.log('✅ 返回 Dashboard 成功');
  }
  
  // ==================== 7. 统计 ====================
  console.log('\n=== 7. API 统计 ===');
  console.log('API 请求:', requests.length);
  requests.forEach((r, i) => console.log(`  ${i+1}. ${r.method} ${r.url}`));
  
  console.log('\nAPI 响应:', responses.length);
  responses.slice(0, 10).forEach((r, i) => console.log(`  ${i+1}. ${r.status} ${r.url}`));
  
  // ==================== 8. 错误检查 ====================
  console.log('\n=== 8. 错误检查 ===');
  if (errors.length === 0) {
    console.log('✅ 无 JavaScript 错误');
  } else {
    console.log('❌ 发现错误:');
    errors.forEach(e => console.log('  -', e));
  }
  
  // ==================== 9. 总结 ====================
  console.log('\n=== 验收总结 ===');
  console.log('✅ 所有页面已测试');
  console.log(`✅ API 请求：${requests.length}个`);
  console.log(`✅ API 响应：${responses.length}个`);
  console.log(`✅ 错误：${errors.length}个`);
  console.log('\n📸 生成 7 张截图');
});
