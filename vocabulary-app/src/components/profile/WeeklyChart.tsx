import React from 'react';
import styled from 'styled-components';

interface WeeklyChartProps {
  weeklyData: {
    day: string;
    words: number;
  }[];
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ weeklyData }) => {
  const maxWords = Math.max(...weeklyData.map(d => d.words));
  const totalWords = weeklyData.reduce((sum, d) => sum + d.words, 0);
  const averageWords = (totalWords / weeklyData.length).toFixed(1);

  return (
    <Container>
      <Header>
        <Title>周学习记录</Title>
        <Stats>
          <StatItem>总计: {totalWords}单词</StatItem>
          <StatItem>平均: {averageWords}单词/天</StatItem>
        </Stats>
      </Header>
      
      <ChartContainer>
        {weeklyData.map((data, index) => (
          <BarContainer key={index}>
            <Bar>
              <BarFill 
                $height={(data.words / maxWords) * 100}
                $words={data.words}
              />
            </Bar>
            <BarLabel>{data.day}</BarLabel>
            <BarValue>{data.words}</BarValue>
          </BarContainer>
        ))}
      </ChartContainer>
    </Container>
  );
};

const Container = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
`;

const StatItem = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ChartContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;
  height: 8rem;
  gap: 0.5rem;
`;

const BarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

const Bar = styled.div`
  width: 100%;
  height: 5rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  position: relative;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const BarFill = styled.div<{ $height: number; $words: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${props => props.$height}%;
  background: ${props => props.$words > 0 
    ? 'linear-gradient(180deg, #3b82f6, #1d4ed8)' 
    : '#e5e7eb'};
  border-radius: 0.25rem;
  transition: height 0.3s ease;
`;

const BarLabel = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const BarValue = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: #111827;
`;

export default WeeklyChart;
