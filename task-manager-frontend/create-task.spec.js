import { test, expect } from '@playwright/test';

test('测试创建新任务', async ({ page }) => {
  const BASE_URL = 'http://100.107.19.52:3004';
  
  console.log('=== 测试创建新任务 ===\n');
  
  // 监听网络请求
  const createRequests = [];
  const createResponses = [];
  
  page.on('request', req => {
    if (req.method() === 'POST' && req.url().includes('/tasks')) {
      createRequests.push({ url: req.url(), method: req.method() });
      console.log('📤 创建任务请求:', req.url());
    }
  });
  
  page.on('response', async res => {
    if (res.url().includes('/tasks') && res.status() >= 200 && res.status() < 300) {
      const text = await res.text().catch(() => '(error)');
      createResponses.push({ 
        url: res.url(), 
        status: res.status(),
        body: text.substring(0, 500)
      });
      console.log('📥 创建任务响应:', res.status());
      console.log('  内容:', text.substring(0, 300));
    }
  });
  
  // 监听错误
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  
  // 1. 访问看板页面
  console.log('\n1. 访问看板页面');
  await page.goto(`${BASE_URL}/kanban`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: '/Users/aya4dw/.openclaw/workspace/test-create-before.png', fullPage: true });
  console.log('✅ 创建前截图已保存');
  
  // 2. 点击新建任务按钮
  console.log('\n2. 点击新建任务按钮');
  const createBtn = await page.$('button:has-text("新建任务")');
  if (createBtn) {
    await createBtn.click();
    await page.waitForTimeout(2000);
    console.log('✅ 点击新建任务按钮');
  } else {
    console.log('❌ 新建任务按钮不存在');
    return;
  }
  
  // 3. 检查对话框是否打开
  console.log('\n3. 检查对话框');
  const overlay = await page.$('[class*="backdrop"], [class*="overlay"], .fixed.inset-0');
  if (overlay) {
    console.log('✅ 对话框已打开');
    
    await page.screenshot({ path: '/Users/aya4dw/.openclaw/workspace/test-create-dialog.png', fullPage: true });
    console.log('✅ 对话框截图已保存');
    
    // 4. 查找并填写任务标题
    console.log('\n4. 填写任务信息');
    const titleInput = await page.$('input[placeholder*="标题"], input[id*="title"], input[name*="title"], input[type="text"]');
    
    if (titleInput) {
      await titleInput.fill('Andrew 测试任务 - Playwright 创建');
      console.log('✅ 已填写任务标题: "Andrew 测试任务 - Playwright 创建"');
    } else {
      console.log('⚠️ 标题输入框不存在');
    }
    
    // 查找并填写描述
    const descInput = await page.$('textarea[placeholder*="描述"], textarea[id*="desc"], textarea[name*="desc"]');
    if (descInput) {
      await descInput.fill('这是 Andrew 通过 Playwright 自动化测试创建的任务');
      console.log('✅ 已填写任务描述');
    } else {
      console.log('⚠️ 描述输入框不存在');
    }
    
    // 查找优先级选择框
    const prioritySelect = await page.$('select[id*="priority"], select[name*="priority"]');
    if (prioritySelect) {
      await prioritySelect.selectOption('high');
      console.log('✅ 已选择优先级：high');
    } else {
      console.log('⚠️ 优先级选择框不存在');
    }
    
    // 5. 查找并提交
    console.log('\n5. 提交任务');
    const submitBtn = await page.$('button:has-text("创建"), button:has-text("提交"), button[type="submit"]');
    
    if (submitBtn) {
      await submitBtn.click();
      console.log('✅ 已点击提交按钮');
      await page.waitForTimeout(3000);
      
      // 等待 API 响应
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️ 提交按钮不存在');
    }
    
  } else {
    console.log('❌ 对话框未打开');
    return;
  }
  
  // 6. 刷新页面查看结果
  console.log('\n6. 刷新页面查看结果');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: '/Users/aya4dw/.openclaw/workspace/test-create-after.png', fullPage: true });
  console.log('✅ 创建后截图已保存');
  
  // 7. 检查结果
  console.log('\n7. 检查结果');
  
  // 检查任务卡片数量
  const taskCards = await page.$$('div[class*="task-card"], div[class*="card"], [class*="Card"]');
  console.log('任务卡片数量:', taskCards.length);
  
  // 检查是否有新任务
  const taskTitle = await page.$('text=Andrew 测试任务');
  if (taskTitle) {
    console.log('✅ 任务已创建成功!');
  } else {
    console.log('⚠️ 任务可能未显示 (可能需要检查后端响应)');
  }
  
  // 8. 统计信息
  console.log('\n=== 统计信息 ===');
  console.log('创建请求:', createRequests.length);
  createRequests.forEach((r, i) => console.log(`  ${i+1}. ${r.method} ${r.url}`));
  
  console.log('\n创建响应:', createResponses.length);
  createResponses.forEach((r, i) => {
    console.log(`  ${i+1}. ${r.status} ${r.url}`);
    if (r.status === 201 || r.status === 200) {
      console.log('     ✅ 响应成功');
    }
  });
  
  if (errors.length > 0) {
    console.log('\n❌ 错误:');
    errors.forEach(e => console.log('  -', e));
  } else {
    console.log('\n✅ 无错误');
  }
  
  console.log('\n=== 测试完成 ===');
  console.log('截图已保存:');
  console.log('  - test-create-before.png (创建前)');
  console.log('  - test-create-dialog.png (对话框)');
  console.log('  - test-create-after.png (创建后)');
});
