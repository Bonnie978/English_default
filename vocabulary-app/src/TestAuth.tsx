import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';

const TestAuth = () => {
  const { user, login, register, logout, loading, error } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [username, setUsername] = useState('testuser');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register(username, email, password);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>认证测试</h1>
      
      {loading ? (
        <p>加载中...</p>
      ) : user ? (
        <div>
          <h2>已登录</h2>
          <p>用户名: {user.username}</p>
          <p>邮箱: {user.email}</p>
          <button onClick={logout}>登出</button>
        </div>
      ) : (
        <div>
          <h2>未登录</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          <form onSubmit={handleLogin} style={{ marginBottom: '20px' }}>
            <h3>登录</h3>
            <div>
              <label>
                邮箱:
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </label>
            </div>
            <div>
              <label>
                密码:
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </label>
            </div>
            <button type="submit">登录</button>
          </form>
          
          <form onSubmit={handleRegister}>
            <h3>注册</h3>
            <div>
              <label>
                用户名:
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                />
              </label>
            </div>
            <div>
              <label>
                邮箱:
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </label>
            </div>
            <div>
              <label>
                密码:
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </label>
            </div>
            <button type="submit">注册</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TestAuth; 