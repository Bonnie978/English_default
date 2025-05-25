import React from 'react';
import styled from 'styled-components';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'medium', 
  text = '加载中...' 
}) => {
  return (
    <Container>
      <Spinner $size={size} />
      {text && <Text>{text}</Text>}
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const Spinner = styled.div<{ $size: 'small' | 'medium' | 'large' }>`
  width: ${props => {
    switch (props.$size) {
      case 'small': return '1.5rem';
      case 'large': return '3rem';
      default: return '2rem';
    }
  }};
  height: ${props => {
    switch (props.$size) {
      case 'small': return '1.5rem';
      case 'large': return '3rem';
      default: return '2rem';
    }
  }};
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Text = styled.p`
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
`;

export default Loading; 