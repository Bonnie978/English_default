import React from 'react';
import styled from 'styled-components';

interface LearningStatsCardProps {
  stats: {
    totalWords: number;
    accuracy: number;
    masteredWords: number;
    studyHours: number;
  };
}

const LearningStatsCard: React.FC<LearningStatsCardProps> = ({ stats }) => {
  const masteredPercentage = Math.round((stats.masteredWords / stats.totalWords) * 100);

  return (
    <Container>
      <StatsGrid>
        <StatItem>
          <StatValue>{stats.totalWords}</StatValue>
          <StatLabel>总学习单词</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{stats.accuracy}%</StatValue>
          <StatLabel>练习正确率</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{stats.studyHours}h</StatValue>
          <StatLabel>练习时长</StatLabel>
        </StatItem>
      </StatsGrid>
      
      <ProgressSection>
        <ProgressHeader>
          <ProgressTitle>已掌握进度</ProgressTitle>
          <ProgressText>{stats.masteredWords}/{stats.totalWords} ({masteredPercentage}%)</ProgressText>
        </ProgressHeader>
        <ProgressBar>
          <ProgressFill $percentage={masteredPercentage} />
        </ProgressBar>
      </ProgressSection>
    </Container>
  );
};

const Container = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ProgressSection = styled.div`
  border-top: 1px solid #f3f4f6;
  padding-top: 1rem;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ProgressTitle = styled.h4`
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
`;

const ProgressText = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 0.5rem;
  background-color: #f3f4f6;
  border-radius: 9999px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  width: ${props => props.$percentage}%;
  transition: width 0.3s ease;
`;

export default LearningStatsCard;
