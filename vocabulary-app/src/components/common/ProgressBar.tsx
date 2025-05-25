import React from 'react';
import styled from 'styled-components';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, label }) => {
  const percentage = Math.min(100, Math.max(0, (current / Math.max(1, total)) * 100));
  
  return (
    <Container>
      <Header>
        <Label>{label || '进度'}</Label>
        <Counter>{current}/{total}</Counter>
      </Header>
      <Track>
        <Fill style={{ width: `${percentage}%` }} />
      </Track>
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  margin-bottom: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const Label = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
`;

const Counter = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #3b82f6;
`;

const Track = styled.div`
  width: 100%;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
`;

const Fill = styled.div`
  height: 100%;
  background-color: #3b82f6;
  border-radius: 9999px;
  transition: width 0.3s ease;
`;

export default ProgressBar; 