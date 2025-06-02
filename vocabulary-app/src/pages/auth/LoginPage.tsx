import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import styled from 'styled-components';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const { login, error, loading, user } = useSupabaseAuth();
  const navigate = useNavigate();

  console.log('🔄 LoginPage: Component rendered', {
    hasUser: !!user,
    userEmail: user?.email,
    loading,
    isLoggingIn,
    initialCheckDone,
    error,
    currentPath: window.location.pathname,
    timestamp: new Date().toISOString()
  });

  // 只在初始检查完成且用户确实已登录时才重定向
  useEffect(() => {
    console.log('🔄 LoginPage: useEffect triggered', {
      hasUser: !!user,
      userEmail: user?.email,
      loading,
      initialCheckDone,
      timestamp: new Date().toISOString()
    });

    // 等待初始认证状态检查完成
    if (!loading) {
      console.log('✅ LoginPage: Loading finished, setting initialCheckDone to true');
      setInitialCheckDone(true);
      
      // 只有在初始检查完成且用户真的已登录时才重定向
      if (user) {
        console.log('🚀 LoginPage: User found, redirecting to home', {
          userEmail: user.email,
          currentPath: window.location.pathname
        });
        navigate('/', { replace: true });
      } else {
        console.log('👤 LoginPage: No user found, staying on login page');
      }
    } else {
      console.log('⏳ LoginPage: Still loading, waiting...');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔄 LoginPage: handleSubmit triggered');
    e.preventDefault();
    
    // 防止重复提交
    if (isLoggingIn) {
      console.log('⚠️ LoginPage: Already logging in, ignoring submit');
      return;
    }
    
    console.log('🔐 LoginPage: Attempting login with:', { 
      email, 
      hasPassword: !!password,
      timestamp: new Date().toISOString()
    });
    setIsLoggingIn(true);
    
    try {
      const result = await login(email, password);
      console.log('📝 LoginPage: login result:', {
        success: result.success,
        error: result.error,
        hasUser: !!result.user,
        userEmail: result.user?.email
      });
      
      if (result.success) {
        console.log('✅ LoginPage: login successful, will be redirected by useEffect');
        // 不在这里直接跳转，让useEffect处理
      } else {
        console.log('❌ LoginPage: login failed:', result.error);
      }
    } catch (error) {
      console.error('💥 LoginPage: Error during login call:', error);
    } finally {
      console.log('🏁 LoginPage: Setting isLoggingIn to false');
      setIsLoggingIn(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <h1>背词助手</h1>
        <h2>登录</h2>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="email">邮箱</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoggingIn}
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoggingIn}
            />
          </FormGroup>
          <Button type="submit" disabled={loading || isLoggingIn}>
            {isLoggingIn ? '登录中...' : loading ? '加载中...' : '登录'}
          </Button>
        </form>
        <RegisterLink 
          onClick={() => !isLoggingIn && navigate('/register')}
          style={{ 
            opacity: isLoggingIn ? 0.5 : 1,
            pointerEvents: isLoggingIn ? 'none' : 'auto'
          }}
        >
          还没有账号？注册一个
        </RegisterLink>
      </FormCard>
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9fafb;
`;

const FormCard = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 400px;
  
  h1 {
    text-align: center;
    margin-bottom: 1rem;
    color: #3b82f6;
  }
  
  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover {
    background-color: #2563eb;
  }
  
  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #fee2e2;
  border-radius: 0.375rem;
`;

const RegisterLink = styled.p`
  text-align: center;
  margin-top: 1rem;
  color: #3b82f6;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default LoginPage; 