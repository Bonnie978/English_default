import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface HeaderBarProps {
  title: string;
  showBack?: boolean;
  rightContent?: React.ReactNode;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ 
  title, 
  showBack = false, 
  rightContent 
}) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <Header>
      <Container>
        <LeftSection>
          {showBack && (
            <BackButton onClick={handleBack}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </BackButton>
          )}
          <Title>{title}</Title>
        </LeftSection>
        
        {rightContent && (
          <RightSection>
            {rightContent}
          </RightSection>
        )}
      </Container>
    </Header>
  );
};

const Header = styled.header`
  background-color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  
  &:hover {
    color: #374151;
  }
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: bold;
  color: #111827;
  margin: 0;
  margin-left: ${props => props.children ? '1rem' : 0};
`;

export default HeaderBar; 