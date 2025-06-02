import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface LoginPromptProps {
  message?: string;
  showIcon?: boolean;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ 
  message = '请登录以保存学习进度',
  showIcon = true 
}) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <PromptContainer>
      {showIcon && <Icon>🔐</Icon>}
      <Message>{message}</Message>
      <LoginButton onClick={handleLogin}>
        立即登录
      </LoginButton>
    </PromptContainer>
  );
};

const PromptContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin: 16px;
  color: white;
  text-align: center;
`;

const Icon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const Message = styled.p`
  font-size: 16px;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const LoginButton = styled.button`
  background: white;
  color: #667eea;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #f8f9ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default LoginPrompt; 