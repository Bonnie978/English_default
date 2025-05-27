import React from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

const SimpleHomePage = () => {
  const { user, loading, logout } = useSupabaseAuth();

  const handleLogout = async () => {
    console.log('SimpleHomePage: 开始登出...');
    await logout();
  };

  const goToDebug = () => {
    window.location.href = '/auth-debug';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        加载中...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        未登录，正在跳转...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ color: '#1f2937', marginBottom: '2rem' }}>
        🎉 首页 - 登录成功！
      </h1>
      
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f0f9ff', 
        border: '1px solid #0ea5e9',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: '0 0 1rem 0', color: '#0369a1' }}>用户信息</h2>
        <p><strong>邮箱:</strong> {user.email}</p>
        <p><strong>用户ID:</strong> {user.id}</p>
        <p><strong>登录时间:</strong> {new Date().toLocaleString()}</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          登出
        </button>
        
        <button
          onClick={goToDebug}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          返回调试页面
        </button>
      </div>

      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        border: '1px solid #d1d5db',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>测试结果</h3>
        <p style={{ color: '#059669', fontWeight: 'bold' }}>
          ✅ 成功访问首页，没有无限跳转！
        </p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          如果你能看到这个页面，说明认证和路由都工作正常。
        </p>
      </div>
    </div>
  );
};

export default SimpleHomePage; 