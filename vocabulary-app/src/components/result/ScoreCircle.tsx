import React from 'react';
import styled from 'styled-components';

interface ScoreCircleProps {
  score: number;
  size?: number;
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({ 
  score, 
  size = 160 
}) => {
  // 计算圆环的参数
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // 根据分数确定颜色
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow/amber
    return '#ef4444'; // red
  };
  
  const scoreColor = getScoreColor(score);
  
  return (
    <Container $size={size}>
      <SVG width={size} height={size}>
        {/* 背景圆环 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        {/* 得分圆环 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </SVG>
      
      <ScoreText>
        <ScoreNumber>{score}</ScoreNumber>
        <ScoreLabel>分</ScoreLabel>
      </ScoreText>
    </Container>
  );
};

// 样式组件
const Container = styled.div<{ $size: number }>`
  position: relative;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
`;

const Circle = styled.circle`
  transition: stroke-dashoffset 0.8s ease-in-out;
`;

const ScoreText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ScoreNumber = styled.span`
  font-size: 2rem;
  font-weight: bold;
  color: #111827;
`;

const ScoreLabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

export default ScoreCircle; 