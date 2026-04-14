import { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

// Settings page for API key configuration
export function Settings() {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('task_manager_api_key') || '';
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('task_manager_api_key', apiKey.trim());
      setMessage('API 密钥已保存');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('请输入有效的 API 密钥');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">设置</h1>

      {/* API Key Configuration */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API 配置</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <Input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="输入 API 密钥"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {showApiKey ? '隐藏' : '显示'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            API 密钥用于身份验证，请妥善保管
          </p>
          <Button onClick={handleSave}>保存</Button>
        </div>

        {message && (
          <p className={`mt-2 text-sm ${message.includes('已保存') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">系统信息</h2>
        
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">版本</dt>
            <dd className="text-sm font-medium text-gray-900">1.0.0</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">后端地址</dt>
            <dd className="text-sm font-medium text-gray-900">http://localhost:3001</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">WebSocket 地址</dt>
            <dd className="text-sm font-medium text-gray-900">ws://localhost:3001/ws</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">当前时间</dt>
            <dd className="text-sm font-medium text-gray-900">
              {new Date().toLocaleString('zh-CN')}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
