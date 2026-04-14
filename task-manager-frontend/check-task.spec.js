import { test, expect } from '@playwright/test';

test('检查新创建的任务', async ({ page }) => {
  const BASE_URL = 'http://100.107.19.52:3004';
  
  console.log('=== 检查新创建的任务 ===\n');
  
  // 访问看板
  await page.goto(`${BASE_URL}/kanban`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // 截图
  await page.screenshot({ 
    path: '/Users/aya4dw/.openclaw/workspace/test-task-created.png', 
    fullPage: true 
  });
  console.log('✅ 截图已保存');
  
  // 检查任务卡片
  const taskCards = await page.$$('div[class*="task-card"], div[class*="Card"]');
  console.log('\n任务卡片数量:', taskCards.length);
  
  // 检查是否有 Andrew 测试任务
  const andrewTask = await page.$('text=Andrew 测试任务');
  if (andrewTask) {
    console.log('✅ 找到任务：Andrew 测试任务');
    
    // 获取任务的详细信息
    const taskContent = await page.locator('text=Andrew 测试任务').textContent();
    console.log('任务内容:', taskContent);
  } else {
    console.log('⚠️ 任务未显示');
  }
  
  // 获取看板列的状态
  const columns = await page.$$('div[class*="Column"]');
  console.log('\n看板列数量:', columns.length);
  
  // 检查待处理列的任务数量
  const todoCount = await page.$('text=待处理');
  if (todoCount) {
    const todoSection = await page.locator('text=待处理').closest('div');
    const todoText = await todoSection?.innerText();
    console.log('待处理列内容:', todoText.substring(0, 200));
  }
  
  // 获取页面全部文本
  const fullText = await page.locator('body').innerText();
  console.log('\n=== 页面全部文本 ===');
  console.log(fullText);
});
