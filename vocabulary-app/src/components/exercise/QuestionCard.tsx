import React from 'react';
import styled from 'styled-components';

export interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'fill-blank';
  options?: string[];
}

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  selectedAnswer,
  onAnswerSelect
}) => {
  return (
    <CardContainer>
      <QuestionTitle>
        {questionIndex + 1}. {question.question}
      </QuestionTitle>
      
      {question.type === 'multiple-choice' && question.options ? (
        <OptionsContainer>
          {question.options.map((option, optionIndex) => (
            <OptionItem
              key={optionIndex}
              $selected={selectedAnswer === option}
              onClick={() => onAnswerSelect(option)}
            >
              <RadioButton $selected={selectedAnswer === option}>
                {selectedAnswer === option && (
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </RadioButton>
              <OptionText>{option}</OptionText>
            </OptionItem>
          ))}
        </OptionsContainer>
      ) : (
        <FillBlankContainer>
          <FillBlankInput
            type="text"
            placeholder="请输入答案..."
            value={selectedAnswer || ''}
            onChange={(e) => onAnswerSelect(e.target.value)}
          />
        </FillBlankContainer>
      )}
    </CardContainer>
  );
};

// 样式组件
const CardContainer = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const QuestionTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
  padding: 1.5rem;
  padding-bottom: 1rem;
  line-height: 1.5;
`;

const OptionsContainer = styled.div`
  padding: 0 1.5rem 1.5rem;
`;

const OptionItem = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px solid ${props => props.$selected ? '#3b82f6' : '#e5e7eb'};
  background-color: ${props => props.$selected ? '#eff6ff' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.$selected ? '#eff6ff' : '#f9fafb'};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const RadioButton = styled.div<{ $selected: boolean }>`
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  border: 2px solid ${props => props.$selected ? '#3b82f6' : '#d1d5db'};
  background-color: ${props => props.$selected ? '#3b82f6' : 'white'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  flex-shrink: 0;
`;

const OptionText = styled.span`
  color: #374151;
  line-height: 1.5;
`;

const FillBlankContainer = styled.div`
  padding: 0 1.5rem 1.5rem;
`;

const FillBlankInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

export default QuestionCard; 