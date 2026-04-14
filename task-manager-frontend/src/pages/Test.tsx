import React from 'react';

export function Test() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">任务管理系统</h1>
      <p className="text-gray-600">前端测试页面 - 如果看到这句话，React 正常工作</p>
      <div className="mt-4 p-4 bg-blue-100 rounded">
        <p>后端 API: http://localhost:3001</p>
        <p>WebSocket: ws://localhost:3001/ws</p>
      </div>
    </div>
  );
}
