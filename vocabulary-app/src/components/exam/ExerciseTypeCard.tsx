import React from 'react';
import styled from 'styled-components';
import { ExerciseType, ExerciseStatusType } from '../../services/exerciseService';

interface ExerciseTypeCardProps {
  type: ExerciseType;
  status: ExerciseStatusType;
  onStart: () => void;
}

const Card = styled.div<{ $type: ExerciseType }>`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      switch (props.$type) {
        case 'read': return 'linear-gradient(90deg, #3b82f6, #1d4ed8)';
        case 'listen': return 'linear-gradient(90deg, #10b981, #059669)';
        case 'write': return 'linear-gradient(90deg, #f59e0b, #d97706)';
        default: return '#3b82f6';
      }
    }};
  }
`;

const IconContainer = styled.div<{ $type: ExerciseType }>`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  background: ${props => {
    switch (props.$type) {
      case 'read': return 'rgba(59, 130, 246, 0.1)';
      case 'listen': return 'rgba(16, 185, 129, 0.1)';
      case 'write': return 'rgba(245, 158, 11, 0.1)';
      default: return 'rgba(59, 130, 246, 0.1)';
    }
  }};
`;

const Icon = styled.div<{ $type: ExerciseType }>`
  font-size: 24px;
  color: ${props => {
    switch (props.$type) {
      case 'read': return '#3b82f6';
      case 'listen': return '#10b981';
      case 'write': return '#f59e0b';
      default: return '#3b82f6';
    }
  }};
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 20px 0;
`;

const StatusBadge = styled.div<{ $status: ExerciseStatusType }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 16px;
  
  ${props => {
    switch (props.$status) {
      case 'completed':
        return `
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        `;
      case 'failed':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        `;
      default:
        return `
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        `;
    }
  }}
`;

const StartButton = styled.button<{ $type: ExerciseType }>`
  width: 100%;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  background: ${props => {
    switch (props.$type) {
      case 'read': return 'linear-gradient(90deg, #3b82f6, #1d4ed8)';
      case 'listen': return 'linear-gradient(90deg, #10b981, #059669)';
      case 'write': return 'linear-gradient(90deg, #f59e0b, #d97706)';
      default: return 'linear-gradient(90deg, #3b82f6, #1d4ed8)';
    }
  }};
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const getExerciseConfig = (type: ExerciseType) => {
  switch (type) {
    case 'read':
      return {
        title: '阅读理解',
        description: '阅读一篇短文，回答相关问题，巩固单词记忆',
        icon: '📖'
      };
    case 'listen':
      return {
        title: '听力理解',
        description: '听一段对话或短文，回答问题，提升听力技能',
        icon: '🎧'
      };
    case 'write':
      return {
        title: '写作练习',
        description: '根据提示写一段短文，使用学过的单词',
        icon: '✍️'
      };
    default:
      return {
        title: '练习',
        description: '开始练习',
        icon: '📝'
      };
  }
};

const getStatusText = (status: ExerciseStatusType) => {
  switch (status) {
    case 'completed':
      return '已完成';
    case 'failed':
      return '未通过';
    default:
      return '未开始';
  }
};

export const ExerciseTypeCard: React.FC<ExerciseTypeCardProps> = ({ type, status, onStart }) => {
  const config = getExerciseConfig(type);
  const statusText = getStatusText(status);

  return (
    <Card $type={type} onClick={onStart}>
      <IconContainer $type={type}>
        <Icon $type={type}>{config.icon}</Icon>
      </IconContainer>
      
      <Title>{config.title}</Title>
      <Description>{config.description}</Description>
      
      <StatusBadge $status={status}>
        {statusText}
      </StatusBadge>
      
      <StartButton $type={type}>
        {status === 'failed' ? '重新开始' : '开始练习'}
      </StartButton>
    </Card>
  );
}; 