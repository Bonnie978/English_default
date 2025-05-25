import React from 'react';
import styled from 'styled-components';
import { LearningProgress } from '../../services/exerciseService';

interface LearningProgressCardProps {
  progress: LearningProgress;
}

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const PercentageText = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const ProgressBar = styled.div<{ percentage: number }>`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

export const LearningProgressCard: React.FC<LearningProgressCardProps> = ({ progress }) => {
  return (
    <Card>
      <Header>
        <Title>今日学习进度</Title>
        <PercentageText>{progress.progressPercentage}%</PercentageText>
      </Header>
      
      <ProgressBarContainer>
        <ProgressBar percentage={progress.progressPercentage} />
      </ProgressBarContainer>
      
      <StatsContainer>
        <StatItem>
          <StatValue>{progress.todayLearned}</StatValue>
          <StatLabel>今日学习</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatValue>{progress.masteredWords}</StatValue>
          <StatLabel>已掌握</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatValue>{progress.totalWords}</StatValue>
          <StatLabel>总单词数</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatValue>{progress.remainingExercises}</StatValue>
          <StatLabel>剩余练习</StatLabel>
        </StatItem>
      </StatsContainer>
    </Card>
  );
}; 