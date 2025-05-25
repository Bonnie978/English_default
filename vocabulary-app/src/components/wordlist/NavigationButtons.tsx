import React from 'react';
import styled from 'styled-components';

interface NavigationButtonsProps {
  onPrevious: () => void;
  onNext: () => void;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrevious,
  onNext,
  isPreviousDisabled,
  isNextDisabled
}) => {
  return (
    <Container>
      <NavButton 
        onClick={onPrevious} 
        disabled={isPreviousDisabled}
      >
        上一个
      </NavButton>
      
      <NavButton 
        onClick={onNext} 
        disabled={isNextDisabled}
      >
        下一个
      </NavButton>
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const NavButton = styled.button`
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background-color: #f9fafb;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default NavigationButtons; 