import React from 'react';
import styled from 'styled-components';

interface ActionButtonsProps {
  onViewWrongAnswers: () => void;
  onBackToHome: () => void;
  wrongAnswersCount?: number;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onViewWrongAnswers,
  onBackToHome,
  wrongAnswersCount = 0
}) => {
  return (
    <Container>
      <WrongAnswersButton onClick={onViewWrongAnswers}>
        查看错题集
        {wrongAnswersCount > 0 && (
          <Badge>{wrongAnswersCount}</Badge>
        )}
      </WrongAnswersButton>
      
      <HomeButton onClick={onBackToHome}>
        返回首页
      </HomeButton>
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const WrongAnswersButton = styled.button`
  background-color: white;
  color: #374151;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: #f9fafb;
  }
`;

const HomeButton = styled.button`
  background-color: #3b82f6;
  color: white;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #2563eb;
  }
`;

const Badge = styled.span`
  background-color: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  min-width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default ActionButtons; 