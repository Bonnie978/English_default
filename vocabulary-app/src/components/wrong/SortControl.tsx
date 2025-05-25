import React from 'react';
import styled from 'styled-components';

export type SortType = 'date' | 'type';

interface SortControlProps {
  sortType: SortType;
  onSortChange: (sort: SortType) => void;
  totalCount: number;
}

const SortControl: React.FC<SortControlProps> = ({
  sortType,
  onSortChange,
  totalCount
}) => {
  const handleToggleSort = () => {
    onSortChange(sortType === 'date' ? 'type' : 'date');
  };

  return (
    <Container>
      <TitleSection>
        <Title>错题列表 ({totalCount})</Title>
      </TitleSection>
      
      <SortSection>
        <SortText>
          {sortType === 'date' ? '按日期排序' : '按类型排序'}
        </SortText>
        <SortButton onClick={handleToggleSort}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </SortButton>
      </SortSection>
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const TitleSection = styled.div``;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
`;

const SortSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SortText = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.25rem;
  background-color: #f3f4f6;
  color: #6b7280;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

export default SortControl; 