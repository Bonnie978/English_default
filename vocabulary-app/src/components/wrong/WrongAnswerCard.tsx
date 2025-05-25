import React from 'react';
import styled from 'styled-components';

export interface WrongAnswerData {
  id: string;
  type: 'read' | 'listen' | 'write';
  typeName: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  date: string;
  formattedDate: string;
  reviewed: boolean;
  feedback?: string;
  relatedWords: Array<{
    spelling: string;
    definition?: string;
  }>;
}

interface WrongAnswerCardProps {
  wrongAnswer: WrongAnswerData;
  onRetry: (id: string) => void;
  onMarkAsReviewed: (id: string) => void;
}

const WrongAnswerCard: React.FC<WrongAnswerCardProps> = ({
  wrongAnswer,
  onRetry,
  onMarkAsReviewed
}) => {
  // 获取类型对应的颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'read':
        return { bg: '#eff6ff', text: '#1d4ed8', border: '#3b82f6' };
      case 'listen':
        return { bg: '#f3e8ff', text: '#7c3aed', border: '#8b5cf6' };
      case 'write':
        return { bg: '#ecfdf5', text: '#059669', border: '#10b981' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' };
    }
  };

  const typeColors = getTypeColor(wrongAnswer.type);

  return (
    <CardContainer $borderColor={typeColors.border}>
      <CardContent>
        <CardHeader>
          <HeaderLeft>
            <TypeBadge 
              $bgColor={typeColors.bg} 
              $textColor={typeColors.text}
            >
              {wrongAnswer.typeName}
            </TypeBadge>
            <DateText>{wrongAnswer.formattedDate}</DateText>
            {wrongAnswer.reviewed && (
              <ReviewedBadge>已复习</ReviewedBadge>
            )}
          </HeaderLeft>
          
          <RetryButton
            onClick={() => onRetry(wrongAnswer.id)}
            disabled={wrongAnswer.reviewed}
            $reviewed={wrongAnswer.reviewed}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </RetryButton>
        </CardHeader>

        <QuestionText>{wrongAnswer.question}</QuestionText>

        <AnswersSection>
          <AnswerItem>
            <AnswerLabel>你的答案:</AnswerLabel>
            <UserAnswer>{wrongAnswer.userAnswer}</UserAnswer>
          </AnswerItem>

          <AnswerItem>
            <AnswerLabel>正确答案:</AnswerLabel>
            <CorrectAnswer>{wrongAnswer.correctAnswer}</CorrectAnswer>
          </AnswerItem>

          {wrongAnswer.feedback && (
            <AnswerItem>
              <AnswerLabel>反馈:</AnswerLabel>
              <FeedbackText>{wrongAnswer.feedback}</FeedbackText>
            </AnswerItem>
          )}
        </AnswersSection>

        <RelatedWordsSection>
          <AnswerLabel>相关单词:</AnswerLabel>
          <WordsContainer>
            {wrongAnswer.relatedWords.map((word, index) => (
              <WordBadge key={index}>
                {word.spelling}
              </WordBadge>
            ))}
          </WordsContainer>
        </RelatedWordsSection>

        {!wrongAnswer.reviewed && (
          <ActionSection>
            <MarkReviewedButton onClick={() => onMarkAsReviewed(wrongAnswer.id)}>
              标记为已复习
            </MarkReviewedButton>
          </ActionSection>
        )}
      </CardContent>
    </CardContainer>
  );
};

// 样式组件
const CardContainer = styled.div<{ $borderColor: string }>`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 1rem;
  border-left: 4px solid ${props => props.$borderColor};
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const TypeBadge = styled.span<{ $bgColor: string; $textColor: string }>`
  background-color: ${props => props.$bgColor};
  color: ${props => props.$textColor};
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
`;

const DateText = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ReviewedBadge = styled.span`
  background-color: #f3f4f6;
  color: #374151;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
`;

const RetryButton = styled.button<{ $reviewed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background-color: ${props => props.$reviewed ? '#f3f4f6' : '#dbeafe'};
  color: ${props => props.$reviewed ? '#9ca3af' : '#1d4ed8'};
  border: none;
  cursor: ${props => props.$reviewed ? 'not-allowed' : 'pointer'};
  
  &:hover:not(:disabled) {
    background-color: #bfdbfe;
  }
`;

const QuestionText = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

const AnswersSection = styled.div`
  margin-bottom: 1rem;
`;

const AnswerItem = styled.div`
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const AnswerLabel = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
`;

const UserAnswer = styled.p`
  color: #ef4444;
  font-size: 0.875rem;
  margin: 0;
`;

const CorrectAnswer = styled.p`
  color: #10b981;
  font-size: 0.875rem;
  margin: 0;
`;

const FeedbackText = styled.p`
  color: #374151;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
`;

const RelatedWordsSection = styled.div`
  margin-bottom: 1rem;
`;

const WordsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const WordBadge = styled.span`
  background-color: #dbeafe;
  color: #1d4ed8;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
`;

const ActionSection = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const MarkReviewedButton = styled.button`
  color: #3b82f6;
  font-size: 0.875rem;
  background: none;
  border: none;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default WrongAnswerCard; 