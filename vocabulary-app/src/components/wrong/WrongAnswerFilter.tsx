import React from 'react';
import styled from 'styled-components';

export type FilterType = 'all' | 'read' | 'listen' | 'write';

interface WrongAnswerFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    read: number;
    listen: number;
    write: number;
  };
}

const WrongAnswerFilter: React.FC<WrongAnswerFilterProps> = ({
  activeFilter,
  onFilterChange,
  counts
}) => {
  const filterOptions = [
    { key: 'all' as FilterType, label: '全部', count: counts.all },
    { key: 'read' as FilterType, label: '阅读', count: counts.read },
    { key: 'listen' as FilterType, label: '听力', count: counts.listen },
    { key: 'write' as FilterType, label: '写作', count: counts.write }
  ];

  return (
    <Container>
      {filterOptions.map(option => (
        <FilterButton
          key={option.key}
          $active={activeFilter === option.key}
          onClick={() => onFilterChange(option.key)}
        >
          <FilterLabel>{option.label}</FilterLabel>
          <FilterCount>{option.count}</FilterCount>
        </FilterButton>
      ))}
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 1.5rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 1px solid #e5e7eb;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem;
  text-align: center;
  cursor: pointer;
  border: none;
  background-color: ${props => props.$active ? '#eff6ff' : 'white'};
  color: ${props => props.$active ? '#1d4ed8' : '#374151'};
  border-right: 1px solid #e5e7eb;
  
  &:last-child {
    border-right: none;
  }
  
  &:hover:not(:disabled) {
    background-color: ${props => props.$active ? '#eff6ff' : '#f9fafb'};
  }
`;

const FilterLabel = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const FilterCount = styled.div`
  font-size: 1.125rem;
  font-weight: bold;
`;

export default WrongAnswerFilter; 