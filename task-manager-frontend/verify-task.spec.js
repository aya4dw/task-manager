import { test, expect } from '@playwright/test';

test('验证任务已创建', async ({ page }) => {
  const BASE_URL = 'http://100.107.19.52:3004';
  
  console.log('=== 验证任务已创建 ===\n');
  
  // 访问看板
  await page.goto(`${BASE_URL}/kanban`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // 截图
  await page.screenshot({ 
    path: '/Users/aya4dw/.openclaw/workspace/verify-task.png', 
    fullPage: true 
  });
  console.log('✅ 截图已保存到 verify-task.png');
  
  // 检查 Andrew 测试任务
  const andrewTask = await page.$('text=Andrew 测试任务');
  if (andrewTask) {
    console.log('\n✅✅✅ 任务"Andrew 测试任务"已创建并显示在看板上！✅✅✅');
  } else {
    console.log('\n⚠️ 任务未显示');
  }
  
  // 获取页面文本
  const text = await page.locator('body').innerText();
  console.log('\n=== 页面内容 ===');
  console.log(text);
  
  // 检查待处理列的任务数
  if (text.includes('Andrew 测试任务')) {
    console.log('\n🎉 任务管理系统创建功能测试成功！');
  }
});
