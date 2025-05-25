import React from 'react';
import styled from 'styled-components';

interface WordCardProps {
  word: {
    id: string;
    spelling: string;
    pronunciation: string;
    partOfSpeech: string;
    definitions: string[];
    examples: string[];
  };
  isMastered: boolean;
  onToggleMastered: () => void;
  onPlayPronunciation?: () => void;
}

const WordCard: React.FC<WordCardProps> = ({
  word,
  isMastered,
  onToggleMastered,
  onPlayPronunciation
}) => {
  return (
    <CardContainer>
      {/* 单词标题栏 */}
      <CardHeader>
        <WordTitle>{word.spelling}</WordTitle>
        <MasteredButton 
          $isMastered={isMastered}
          onClick={onToggleMastered}
          aria-label={isMastered ? "取消标记为已掌握" : "标记为已掌握"}
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </MasteredButton>
      </CardHeader>
      
      {/* 单词内容 */}
      <CardContent>
        <ContentRow>
          <Label>发音:</Label>
          <Value>{word.pronunciation}</Value>
          <PronunciationButton 
            onClick={onPlayPronunciation}
            aria-label="播放发音"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          </PronunciationButton>
        </ContentRow>
        
        <ContentRow>
          <Label>词性:</Label>
          <Value>{word.partOfSpeech}</Value>
        </ContentRow>
        
        <ContentRow>
          <Label>释义:</Label>
          <Value>{word.definitions.join(', ')}</Value>
        </ContentRow>
        
        <Divider />
        
        <ExampleSection>
          <Label>例句:</Label>
          <Example>{word.examples[0]}</Example>
          <MaskedExample>
            {word.examples[0].replace(word.spelling, '_________')}
          </MaskedExample>
        </ExampleSection>
      </CardContent>
    </CardContainer>
  );
};

// 样式组件
const CardContainer = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const CardHeader = styled.div`
  background-color: #3b82f6;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const WordTitle = styled.h2`
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
  margin: 0;
`;

const MasteredButton = styled.button<{ $isMastered: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: ${props => props.$isMastered ? '#fbbf24' : 'white'};
  color: ${props => props.$isMastered ? '#92400e' : '#3b82f6'};
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.$isMastered ? '#f59e0b' : '#f3f4f6'};
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const ContentRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const Label = styled.span`
  color: #4b5563;
  margin-right: 0.5rem;
  font-weight: 500;
`;

const Value = styled.span`
  color: #111827;
`;

const PronunciationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  color: #3b82f6;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 0.5rem;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid #e5e7eb;
  margin: 1.5rem 0;
`;

const ExampleSection = styled.div``;

const Example = styled.p`
  font-style: italic;
  color: #111827;
  margin: 0.5rem 0;
`;

const MaskedExample = styled.p`
  color: #6b7280;
  margin: 0.5rem 0;
`;

export default WordCard; 