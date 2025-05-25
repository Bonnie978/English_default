import React from 'react';
import styled from 'styled-components';

interface ExerciseSummaryProps {
  exerciseType: 'read' | 'listen' | 'write';
  totalQuestions: number;
  correctAnswers: number;
  timeSpent?: string;
  date: string;
}

const ExerciseSummary: React.FC<ExerciseSummaryProps> = ({
  exerciseType,
  totalQuestions,
  correctAnswers,
  timeSpent = '未记录',
  date
}) => {
  const getExerciseTypeName = (type: string) => {
    switch (type) {
      case 'read': return '阅读理解';
      case 'listen': return '听力理解';
      case 'write': return '写作练习';
      default: return '练习';
    }
  };

  return (
    <Container>
      <Header>
        <Title>{getExerciseTypeName(exerciseType)}练习</Title>
        <Date>{date}</Date>
      </Header>
      
      <Content>
        <StatsGrid>
          <StatItem>
            <StatValue>{correctAnswers}</StatValue>
            <StatLabel>正确答题</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{totalQuestions - correctAnswers}</StatValue>
            <StatLabel>错误答题</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{timeSpent}</StatValue>
            <StatLabel>用时</StatLabel>
          </StatItem>
        </StatsGrid>
        
        <SummaryText>
          总题数：{totalQuestions} | 正确率：{Math.round((correctAnswers / totalQuestions) * 100)}%
        </SummaryText>
      </Content>
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const Header = styled.div`
  background-color: #3b82f6;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
`;

const Date = styled.span`
  color: #dbeafe;
  font-size: 0.875rem;
`;

const Content = styled.div`
  padding: 1.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const SummaryText = styled.p`
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
`;

export default ExerciseSummary; 