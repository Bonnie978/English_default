import React from 'react';
import styled from 'styled-components';

interface WritingPromptProps {
  prompt: {
    topic: string;
    requirements: string;
    wordCount: string;
    instructions: string;
  };
}

const WritingPrompt: React.FC<WritingPromptProps> = ({ prompt }) => {
  return (
    <Container>
      <Header>
        <HeaderIcon>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </HeaderIcon>
        <HeaderTitle>Writing Prompt</HeaderTitle>
      </Header>

      <Content>
        <Topic>{prompt.topic}</Topic>
        
        <Requirements>
          <p>{prompt.requirements}</p>
          <RequirementDetails>
            目标长度: {prompt.wordCount}
          </RequirementDetails>
        </Requirements>

        <Instructions>
          <InstructionIcon>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </InstructionIcon>
          <InstructionText>{prompt.instructions}</InstructionText>
        </Instructions>
      </Content>
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: #22c55e;
  color: white;
`;

const HeaderIcon = styled.div`
  flex-shrink: 0;
`;

const HeaderTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
`;

const Content = styled.div`
  padding: 1.5rem;
`;

const Topic = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
`;

const Requirements = styled.div`
  margin-bottom: 1rem;
  color: #374151;
  line-height: 1.6;

  p {
    margin: 0 0 0.5rem 0;
  }
`;

const RequirementDetails = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const Instructions = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #dcfce7;
  border-left: 4px solid #22c55e;
  border-radius: 0.375rem;
`;

const InstructionIcon = styled.div`
  flex-shrink: 0;
  color: #15803d;
`;

const InstructionText = styled.p`
  font-size: 0.875rem;
  color: #15803d;
  margin: 0;
  line-height: 1.5;
`;

export default WritingPrompt; 