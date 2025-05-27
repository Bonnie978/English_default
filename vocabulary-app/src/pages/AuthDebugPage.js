import React from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

const AuthDebugPage = () => {
  const { user, loading, error, login, logout } = useSupabaseAuth();
  const [email, setEmail] = React.useState('admin@admin.com');
  const [password, setPassword] = React.useState('adminadmin');
  const [logs, setLogs] = React.useState([]);
  const logContainerRef = React.useRef(null);

  // 添加日志的函数
  const addLog = React.useCallback((level, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, level, message }]);
  }, []);

  // 重写控制台方法来捕获日志
  React.useEffect(() => {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    // 重写 console 方法
    console.log = (...args) => {
      originalConsole.log(...args);
      addLog('log', args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      addLog('error', args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addLog('warn', args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    console.info = (...args) => {
      originalConsole.info(...args);
      addLog('info', args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    // 添加初始日志
    console.log('AuthDebugPage: 日志系统已启动');

    // 清理函数：恢复原始的 console 方法
    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
    };
  }, [addLog]);

  // 自动滚动到最新日志
  React.useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleLogin = async () => {
    console.log('AuthDebugPage: 开始登录尝试...', { email });
    try {
      const result = await login(email, password);
      console.log('AuthDebugPage: 登录结果:', result);
    } catch (err) {
      console.error('AuthDebugPage: 登录错误:', err);
    }
  };

  const handleLogout = async () => {
    console.log('AuthDebugPage: 开始登出尝试...');
    try {
      const result = await logout();
      console.log('AuthDebugPage: 登出结果:', result);
    } catch (err) {
      console.error('AuthDebugPage: 登出错误:', err);
    }
  };

  const testNavigation = () => {
    console.log('AuthDebugPage: 测试跳转到首页...');
    console.log('AuthDebugPage: 当前认证状态:', { user: !!user, loading, error });
    window.location.href = '/';
  };

  const testSimpleNavigation = () => {
    console.log('AuthDebugPage: 测试简单跳转...');
    console.log('AuthDebugPage: 当前认证状态:', { user: !!user, loading, error });
    // 直接设置 URL 而不是使用路由
    window.history.pushState({}, '', '/');
    window.location.reload();
  };

  const checkAuthState = () => {
    console.log('AuthDebugPage: 检查认证状态...');
    console.log('AuthDebugPage: user:', user);
    console.log('AuthDebugPage: loading:', loading);
    console.log('AuthDebugPage: error:', error);
    console.log('AuthDebugPage: isAuthenticated:', !!user);
  };

  const checkDetailedAuthState = async () => {
    console.log('AuthDebugPage: 检查详细认证状态...');
    try {
      const { authUtils } = await import('../utils/auth');
      const authStatus = await authUtils.checkAuthStatus();
      console.log('AuthDebugPage: 详细认证状态:', authStatus);
    } catch (err) {
      console.error('AuthDebugPage: 检查详细认证状态失败:', err);
    }
  };

  const clearAllAuthState = async () => {
    console.log('AuthDebugPage: 清理所有认证状态...');
    try {
      const { authUtils } = await import('../utils/auth');
      await authUtils.clearAuthState();
      console.log('AuthDebugPage: 认证状态已清理');
    } catch (err) {
      console.error('AuthDebugPage: 清理认证状态失败:', err);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    console.log('AuthDebugPage: 日志已清空');
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'error': return '#ef4444';
      case 'warn': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#e5e7eb';
    }
  };

  const containerStyle = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  const sectionStyle = {
    marginBottom: '2rem',
    padding: '1rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#f9fafb'
  };

  const titleStyle = {
    color: '#1f2937',
    marginBottom: '2rem'
  };

  const sectionTitleStyle = {
    marginTop: 0,
    color: '#374151'
  };

  const inputStyle = {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    marginRight: '1rem'
  };

  const buttonStyle = {
    padding: '0.5rem 1rem',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  const logContainerStyle = {
    height: '400px',
    overflowY: 'auto',
    backgroundColor: '#1f2937',
    borderRadius: '8px',
    padding: '1rem',
    fontFamily: 'Courier New, monospace',
    fontSize: '12px',
    lineHeight: '1.4'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>认证调试页面</h1>
      
      {/* 当前状态区域 */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>当前状态</h2>
        <p>Loading: {loading ? 'true' : 'false'}</p>
        <p>User: {user ? `${user.email} (${user.id})` : 'null'}</p>
        <p>Error: {error || 'null'}</p>
        <p>认证状态: {user ? '已登录' : '未登录'}</p>
      </div>

      {/* 登录测试区域 */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>登录测试</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱"
            style={inputStyle}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            style={inputStyle}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              ...buttonStyle,
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            登录
          </button>
        </div>
      </div>

      {/* 登出测试区域 */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>测试区域</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleLogout}
            disabled={loading}
            style={{
              ...buttonStyle,
              backgroundColor: loading ? '#9ca3af' : '#ef4444',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            登出
          </button>
          <button
            onClick={testNavigation}
            disabled={loading}
            style={{
              ...buttonStyle,
              backgroundColor: loading ? '#9ca3af' : '#10b981',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            测试跳转到首页
          </button>
          <button
            onClick={testSimpleNavigation}
            disabled={loading}
            style={{
              ...buttonStyle,
              backgroundColor: loading ? '#9ca3af' : '#8b5cf6',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            简单跳转测试
          </button>
          <button
            onClick={checkAuthState}
            style={{
              ...buttonStyle,
              backgroundColor: '#f59e0b'
            }}
          >
            检查认证状态
          </button>
          <button
            onClick={checkDetailedAuthState}
            style={{
              ...buttonStyle,
              backgroundColor: '#f59e0b'
            }}
          >
            检查详细认证状态
          </button>
          <button
            onClick={clearAllAuthState}
            style={{
              ...buttonStyle,
              backgroundColor: '#f59e0b'
            }}
          >
            清理所有认证状态
          </button>
        </div>
      </div>

      {/* 实时日志区域 */}
      <div style={sectionStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1rem' 
        }}>
          <h2 style={{ margin: 0, color: '#374151' }}>实时日志</h2>
          <button
            onClick={clearLogs}
            style={{
              ...buttonStyle,
              backgroundColor: '#ef4444'
            }}
          >
            清空日志
          </button>
        </div>
        <div ref={logContainerRef} style={logContainerStyle}>
          {logs.length === 0 ? (
            <div style={{ color: '#6b7280' }}>暂无日志...</div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '0.5rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  color: getLogColor(log.level)
                }}
              >
                <span style={{ color: '#9ca3af', fontWeight: 'bold' }}>
                  [{log.timestamp}]
                </span>
                <span style={{ fontWeight: 'bold' }}>
                  [{log.level.toUpperCase()}]
                </span>
                <span style={{ flex: 1, wordBreak: 'break-word' }}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPage; 