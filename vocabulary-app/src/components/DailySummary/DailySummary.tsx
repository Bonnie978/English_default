import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import deepseekService from '../../services/deepseekService';

interface LearningData {
  totalWordsLearned: number;
  masteredWords: number;
  streakDays: number;
  todayProgress: {
    learned: number;
    total: number;
  };
  recentMistakes: number;
  correctRate: number;
}

interface DailySummaryData {
  summary: string;
  encouragement: string;
  suggestions: string[];
  achievement: string;
  nextGoal: string;
}

interface DailySummaryProps {
  learningData: LearningData;
  onRefresh?: () => void;
}

const DailySummary: React.FC<DailySummaryProps> = ({ learningData, onRefresh }) => {
  const [summary, setSummary] = useState<DailySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const loadDailySummary = useCallback(async () => {
    try {
      setLoading(true);
      const dailySummary = await deepseekService.getDailySummary(learningData);
      setSummary(dailySummary);
    } catch (error) {
      console.error('加载今日总结失败:', error);
    } finally {
      setLoading(false);
    }
  }, [learningData]);

  useEffect(() => {
    loadDailySummary();
  }, [loadDailySummary]);

  const handleRefresh = () => {
    loadDailySummary();
    onRefresh?.();
  };

  if (loading) {
    return (
      <SummaryCard>
        <CardHeader>
          <CardTitle>
            <TitleIcon>🤖</TitleIcon>
            今日总结
          </CardTitle>
        </CardHeader>
        <LoadingContent>
          <LoadingSpinner />
          <LoadingText>AI正在为您生成专属学习总结...</LoadingText>
        </LoadingContent>
      </SummaryCard>
    );
  }

  if (!summary) {
    return (
      <SummaryCard>
        <CardHeader>
          <CardTitle>
            <TitleIcon>🤖</TitleIcon>
            今日总结
          </CardTitle>
          <RefreshButton onClick={handleRefresh}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </RefreshButton>
        </CardHeader>
        <ErrorContent>
          <ErrorText>无法加载总结内容</ErrorText>
          <RetryButton onClick={handleRefresh}>重试</RetryButton>
        </ErrorContent>
      </SummaryCard>
    );
  }

  return (
    <SummaryCard>
      <CardHeader>
        <CardTitle>
          <TitleIcon>🤖</TitleIcon>
          今日总结
        </CardTitle>
        <RefreshButton onClick={handleRefresh}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </RefreshButton>
      </CardHeader>

      <SummaryContent>
        {/* 成就徽章 */}
        <AchievementBadge>
          {summary.achievement}
        </AchievementBadge>

        {/* 学习总结 */}
        <SummaryText>{summary.summary}</SummaryText>

        {/* 激励内容 */}
        <EncouragementSection>
          <EncouragementIcon>💪</EncouragementIcon>
          <EncouragementText>{summary.encouragement}</EncouragementText>
        </EncouragementSection>

        {/* 展开/收起按钮 */}
        <ExpandButton onClick={() => setExpanded(!expanded)}>
          {expanded ? '收起详情' : '查看更多'}
          <svg 
            className={`h-4 w-4 transform transition-transform ${expanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </ExpandButton>

        {/* 展开内容 */}
        <ExpandedContent $expanded={expanded}>
          {/* 智能建议 */}
          <SuggestionSection>
            <SectionTitle>
              <SectionIcon>💡</SectionIcon>
              智能建议
            </SectionTitle>
            <SuggestionsList>
              {summary.suggestions.map((suggestion, index) => (
                <SuggestionItem key={index}>
                  <SuggestionBullet>•</SuggestionBullet>
                  {suggestion}
                </SuggestionItem>
              ))}
            </SuggestionsList>
          </SuggestionSection>

          {/* 下一个目标 */}
          <NextGoalSection>
            <SectionTitle>
              <SectionIcon>🎯</SectionIcon>
              下一个目标
            </SectionTitle>
            <NextGoalText>{summary.nextGoal}</NextGoalText>
          </NextGoalSection>
        </ExpandedContent>
      </SummaryContent>
    </SummaryCard>
  );
};

// 样式组件
const SummaryCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    pointer-events: none;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const TitleIcon = styled.span`
  font-size: 20px;
`;

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  padding: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SummaryContent = styled.div`
  position: relative;
  z-index: 1;
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  text-align: center;
`;

const ErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  gap: 16px;
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
`;

const RetryButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const AchievementBadge = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 16px;
  backdrop-filter: blur(10px);
`;

const SummaryText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 16px 0;
  opacity: 0.95;
`;

const EncouragementSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  backdrop-filter: blur(10px);
`;

const EncouragementIcon = styled.span`
  font-size: 18px;
  flex-shrink: 0;
`;

const EncouragementText = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  opacity: 0.9;
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: white;
  font-size: 14px;
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.2s;
  margin: 0 auto;
  padding: 8px 16px;
  border-radius: 8px;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ExpandedContent = styled.div<{ $expanded: boolean }>`
  max-height: ${props => props.$expanded ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
  margin-top: ${props => props.$expanded ? '16px' : '0'};
`;

const SuggestionSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
`;

const SectionIcon = styled.span`
  font-size: 16px;
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SuggestionItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.9;
`;

const SuggestionBullet = styled.span`
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
  margin-top: 2px;
`;

const NextGoalSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const NextGoalText = styled.p`
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  opacity: 0.95;
`;

export default DailySummary; 