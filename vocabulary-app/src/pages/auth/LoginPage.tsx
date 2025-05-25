import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styled from 'styled-components';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('LoginPage: handleSubmit triggered');
    e.preventDefault();
    
    console.log('LoginPage: Attempting login with:', { email, password });
    
    try {
      await login(email, password);
      console.log('LoginPage: login function called successfully, navigating to /');
      navigate('/');
    } catch (error) {
      console.error('LoginPage: Error during login call:', error);
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
            />
          </FormGroup>
          <Button type="submit" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>
        <RegisterLink onClick={() => navigate('/register')}>
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