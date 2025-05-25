import React from 'react';
import styled from 'styled-components';

interface SubmitButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  text?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  text = "提交答案"
}) => {
  return (
    <Container>
      <Button 
        onClick={onClick} 
        disabled={disabled || loading}
      >
        {loading ? (
          <>
            <Spinner />
            提交中...
          </>
        ) : (
          text
        )}
      </Button>
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
`;

const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  min-width: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    background-color: #2563eb;
  }
  
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default SubmitButton; 