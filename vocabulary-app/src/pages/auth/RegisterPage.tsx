import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import styled from 'styled-components';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  
  const { register, error, loading, user } = useSupabaseAuth();
  const navigate = useNavigate();

  // 如果用户已经登录，直接跳转到首页
  useEffect(() => {
    if (user && !loading) {
      console.log('RegisterPage: User already logged in, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  // 表单验证
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!email) {
      errors.email = '邮箱不能为空';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = '请输入有效的邮箱地址';
    }

    if (!password) {
      errors.password = '密码不能为空';
    } else if (password.length < 6) {
      errors.password = '密码至少需要6个字符';
    }

    if (!confirmPassword) {
      errors.confirmPassword = '请确认密码';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }

    if (!fullName.trim()) {
      errors.fullName = '姓名不能为空';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('RegisterPage: handleSubmit triggered');
    e.preventDefault();
    
    // 防止重复提交
    if (isRegistering) {
      console.log('RegisterPage: Already registering, ignoring submit');
      return;
    }

    // 验证表单
    if (!validateForm()) {
      console.log('RegisterPage: Form validation failed');
      return;
    }
    
    console.log('RegisterPage: Attempting registration with:', { email, fullName });
    setIsRegistering(true);
    setFormErrors({});
    
    try {
      const result = await register(email, password, fullName.trim());
      console.log('RegisterPage: registration result:', result);
      
      if (result.success) {
        console.log('RegisterPage: registration successful');
        // 注册成功提示
        alert('注册成功！请查看您的邮箱以验证账户。');
        // 可以选择跳转到登录页面或首页
        navigate('/login', { replace: true });
      } else {
        console.log('RegisterPage: registration failed:', result.error);
      }
    } catch (error) {
      console.error('RegisterPage: Error during registration call:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <h1>背词助手</h1>
        <h2>注册账户</h2>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="fullName">姓名</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isRegistering}
              placeholder="请输入您的姓名"
            />
            {formErrors.fullName && <FieldError>{formErrors.fullName}</FieldError>}
          </FormGroup>

          <FormGroup>
            <label htmlFor="email">邮箱</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isRegistering}
              placeholder="请输入您的邮箱"
            />
            {formErrors.email && <FieldError>{formErrors.email}</FieldError>}
          </FormGroup>

          <FormGroup>
            <label htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isRegistering}
              placeholder="至少6个字符"
            />
            {formErrors.password && <FieldError>{formErrors.password}</FieldError>}
          </FormGroup>

          <FormGroup>
            <label htmlFor="confirmPassword">确认密码</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isRegistering}
              placeholder="请再次输入密码"
            />
            {formErrors.confirmPassword && <FieldError>{formErrors.confirmPassword}</FieldError>}
          </FormGroup>

          <Button type="submit" disabled={loading || isRegistering}>
            {isRegistering ? '注册中...' : loading ? '加载中...' : '注册'}
          </Button>
        </form>
        
        <LoginLink 
          onClick={() => !isRegistering && navigate('/login')}
          style={{ 
            opacity: isRegistering ? 0.5 : 1,
            pointerEvents: isRegistering ? 'none' : 'auto'
          }}
        >
          已有账号？立即登录
        </LoginLink>
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
  padding: 1rem;
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
    font-size: 1.8rem;
  }
  
  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #374151;
    font-size: 1.2rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
    box-sizing: border-box;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    &:disabled {
      background-color: #f9fafb;
      color: #6b7280;
    }
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #059669;
  }
  
  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  border-radius: 0.375rem;
  border: 1px solid #fecaca;
  font-size: 0.9rem;
`;

const FieldError = styled.div`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const LoginLink = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default RegisterPage; 