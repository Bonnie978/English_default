import React from 'react';
import styled from 'styled-components';

export interface QuestionResultData {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  relatedWords?: string[];
}

interface QuestionResultProps {
  result: QuestionResultData;
  index: number;
}

const QuestionResult: React.FC<QuestionResultProps> = ({ 
  result, 
  index 
}) => {
  return (
    <CardContainer $isCorrect={result.isCorrect}>
      <CardHeader $isCorrect={result.isCorrect}>
        <QuestionNumber>问题 {index + 1}</QuestionNumber>
        <StatusBadge $isCorrect={result.isCorrect}>
          {result.isCorrect ? (
            <>
              <CheckIcon>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </CheckIcon>
              正确
            </>
          ) : (
            <>
              <CrossIcon>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </CrossIcon>
              错误
            </>
          )}
        </StatusBadge>
      </CardHeader>
      
      <CardContent>
        <QuestionText>{result.question}</QuestionText>
        
        <AnswerSection>
          <AnswerLabel>你的答案:</AnswerLabel>
          <UserAnswer $isCorrect={result.isCorrect}>
            {result.userAnswer}
          </UserAnswer>
        </AnswerSection>
        
        {!result.isCorrect && (
          <AnswerSection>
            <AnswerLabel>正确答案:</AnswerLabel>
            <CorrectAnswer>{result.correctAnswer}</CorrectAnswer>
          </AnswerSection>
        )}
        
        <ExplanationSection>
          <ExplanationText>{result.explanation}</ExplanationText>
        </ExplanationSection>
        
        {result.relatedWords && result.relatedWords.length > 0 && (
          <WordsSection>
            <AnswerLabel>相关单词:</AnswerLabel>
            <WordsContainer>
              {result.relatedWords.map((word, wordIndex) => (
                <WordBadge key={wordIndex}>{word}</WordBadge>
              ))}
            </WordsContainer>
          </WordsSection>
        )}
      </CardContent>
    </CardContainer>
  );
};

// 样式组件
const CardContainer = styled.div<{ $isCorrect: boolean }>`
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 1.5rem;
  border-left: 4px solid ${props => props.$isCorrect ? '#10b981' : '#ef4444'};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
`;

const CardHeader = styled.div<{ $isCorrect: boolean }>`
  background-color: ${props => props.$isCorrect ? '#ecfdf5' : '#fee2e2'};
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const QuestionNumber = styled.span`
  font-weight: 500;
  color: #111827;
`;

const StatusBadge = styled.span<{ $isCorrect: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background-color: ${props => props.$isCorrect ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.$isCorrect ? '#10b981' : '#ef4444'};
`;

const CheckIcon = styled.span`
  color: #10b981;
`;

const CrossIcon = styled.span`
  color: #ef4444;
`;

const CardContent = styled.div`
  background-color: white;
  padding: 1.5rem;
`;

const QuestionText = styled.p`
  color: #111827;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const AnswerSection = styled.div`
  margin-bottom: 0.75rem;
`;

const AnswerLabel = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const UserAnswer = styled.p<{ $isCorrect: boolean }>`
  color: ${props => props.$isCorrect ? '#10b981' : '#ef4444'};
  font-weight: 500;
`;

const CorrectAnswer = styled.p`
  color: #10b981;
  font-weight: 500;
`;

const ExplanationSection = styled.div`
  background-color: #f9fafb;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
`;

const ExplanationText = styled.p`
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
`;

const WordsSection = styled.div`
  margin-top: 0.75rem;
`;

const WordsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const WordBadge = styled.span`
  background-color: #dbeafe;
  color: #3b82f6;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
`;

export default QuestionResult; 