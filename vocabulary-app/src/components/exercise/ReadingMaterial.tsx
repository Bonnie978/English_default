import React from 'react';
import styled from 'styled-components';

interface ReadingMaterialProps {
  title?: string;
  content: string;
}

const ReadingMaterial: React.FC<ReadingMaterialProps> = ({ 
  title = "Reading Material", 
  content 
}) => {
  return (
    <Container>
      <Header>
        <Title>{title}</Title>
      </Header>
      <Content>
        {content.split('\n').map((paragraph, index) => (
          <Paragraph key={index}>
            {paragraph}
          </Paragraph>
        ))}
      </Content>
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const Header = styled.div`
  background-color: #3b82f6;
  padding: 1rem 1.5rem;
`;

const Title = styled.h2`
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
`;

const Content = styled.div`
  padding: 1.5rem;
`;

const Paragraph = styled.p`
  color: #374151;
  line-height: 1.7;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export default ReadingMaterial; 