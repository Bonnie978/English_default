import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import HeaderBar from '../components/common/HeaderBar';
import WrongAnswerFilter, { FilterType } from '../components/wrong/WrongAnswerFilter';
import SortControl, { SortType } from '../components/wrong/SortControl';
import WrongAnswerCard from '../components/wrong/WrongAnswerCard';
import BottomNavbar from '../components/common/BottomNavbar';
import Loading from '../components/common/Loading';
import { useWrongAnswers } from '../hooks/useWrongAnswers';

const WrongPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortOrder, setSortOrder] = useState<SortType>('date');
  
  const navigate = useNavigate();
  const { wrongAnswers, loading, error, markAsReviewed } = useWrongAnswers();
  
  // 计算各类型错题数量
  const typeCounts = useMemo(() => {
    const counts = {
      all: wrongAnswers.length,
      read: 0,
      listen: 0,
      write: 0
    };
    
    wrongAnswers.forEach(item => {
      if (item.type === 'read') counts.read++;
      else if (item.type === 'listen') counts.listen++;
      else if (item.type === 'write') counts.write++;
    });
    
    return counts;
  }, [wrongAnswers]);
  
  // 过滤和排序错题
  const filteredAndSortedWrongAnswers = useMemo(() => {
    // 过滤
    let filtered = wrongAnswers;
    if (activeFilter !== 'all') {
      filtered = wrongAnswers.filter(item => item.type === activeFilter);
    }
    
    // 排序
    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return a.type.localeCompare(b.type);
      }
    });
    
    return sorted;
  }, [wrongAnswers, activeFilter, sortOrder]);
  
  // 处理重做错题
  const handleRetry = (id: string) => {
    const wrongAnswer = wrongAnswers.find(item => item.id === id);
    if (wrongAnswer) {
      // 根据错题类型跳转到对应的练习页面
      navigate(`/exam/${wrongAnswer.type}`);
    }
  };
  
  // 处理标记为已复习
  const handleMarkAsReviewed = async (id: string) => {
    try {
      await markAsReviewed(id);
    } catch (error) {
      console.error('标记为已复习失败:', error);
      // 在实际应用中应该显示错误提示
    }
  };
  
  // 渲染右侧内容
  const renderRightContent = () => (
    <ActionButtons>
      <FilterToggleButton onClick={() => {}}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </FilterToggleButton>
    </ActionButtons>
  );
  
  // 加载状态
  if (loading) {
    return (
      <Container>
        <HeaderBar title="错题集" showBack rightContent={renderRightContent()} />
        <LoadingContainer>
          <Loading size="large" />
        </LoadingContainer>
        <BottomNavbar />
      </Container>
    );
  }
  
  // 错误状态
  if (error) {
    return (
      <Container>
        <HeaderBar title="错题集" showBack />
        <ErrorContainer>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={() => window.location.reload()}>
            重试
          </RetryButton>
        </ErrorContainer>
        <BottomNavbar />
      </Container>
    );
  }
  
  return (
    <Container>
      <HeaderBar 
        title="错题集" 
        showBack 
        rightContent={renderRightContent()} 
      />
      
      <MainContent>
        {/* 错题类型筛选 */}
        <WrongAnswerFilter 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={typeCounts}
        />
        
        {/* 排序控制 */}
        <SortControl 
          sortType={sortOrder}
          onSortChange={setSortOrder}
          totalCount={filteredAndSortedWrongAnswers.length}
        />
        
        {/* 错题列表 */}
        {filteredAndSortedWrongAnswers.length > 0 ? (
          <WrongAnswersList>
            {filteredAndSortedWrongAnswers.map(wrongAnswer => (
              <WrongAnswerCard
                key={wrongAnswer.id}
                wrongAnswer={wrongAnswer}
                onRetry={handleRetry}
                onMarkAsReviewed={handleMarkAsReviewed}
              />
            ))}
          </WrongAnswersList>
        ) : (
          <EmptyState>
            <EmptyIcon>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </EmptyIcon>
            <EmptyTitle>没有错题</EmptyTitle>
            <EmptyMessage>当前筛选条件下没有错题记录</EmptyMessage>
          </EmptyState>
        )}
      </MainContent>
      
      <BottomNavbar />
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f9fafb;
`;

const MainContent = styled.main`
  flex: 1;
  max-width: 48rem;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  width: 100%;
`;

const LoadingContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ErrorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  gap: 1rem;
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  text-align: center;
`;

const RetryButton = styled.button`
  background-color: #3b82f6;
  color: white;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #2563eb;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FilterToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background-color: #f3f4f6;
  color: #6b7280;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

const WrongAnswersList = styled.div``;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
`;

const EmptyIcon = styled.div`
  color: #9ca3af;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin: 0 0 0.25rem 0;
`;

const EmptyMessage = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

export default WrongPage; 