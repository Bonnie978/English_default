import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLearning } from '../hooks/useLearning';
import HeaderBar from '../components/common/HeaderBar';
import ProgressBar from '../components/common/ProgressBar';
import WordCard from '../components/wordlist/WordCard';
import NavigationButtons from '../components/wordlist/NavigationButtons';
import BottomNavbar from '../components/common/BottomNavbar';
import Loading from '../components/common/Loading';

const WordlistPage: React.FC = () => {
  const { 
    dailyWords, 
    loading, 
    error, 
    progress, 
    fetchDailyWords, 
    markWordAsMastered,
    masteredWordIds
  } = useLearning();
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const navigate = useNavigate();
  
  // 获取每日单词
  useEffect(() => {
    if (dailyWords.length === 0) {
      fetchDailyWords();
    }
  }, [fetchDailyWords, dailyWords.length]);
  
  // 处理上一个单词
  const handlePrevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };
  
  // 处理下一个单词
  const handleNextWord = () => {
    if (currentWordIndex < dailyWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };
  
  // 切换单词掌握状态
  const handleToggleMastered = async () => {
    if (dailyWords.length > 0) {
      const currentWord = dailyWords[currentWordIndex];
      await markWordAsMastered(currentWord.id);
    }
  };
  
  // 播放发音（实际应用中应连接到真实的音频服务）
  const handlePlayPronunciation = () => {
    console.log('Playing pronunciation...');
    // 在实际应用中，这里应该调用音频API或使用HTML5 Audio
    alert('播放发音功能将在后续版本中实现');
  };
  
  // 完成学习并前往练习
  const handleComplete = () => {
    navigate('/exam');
  };
  
  // 渲染右侧内容
  const renderRightContent = () => (
    <MasteredCount>
      已掌握: {progress.learned}/{progress.total}
    </MasteredCount>
  );
  
  // 加载状态
  if (loading && dailyWords.length === 0) {
    return (
      <Container>
        <HeaderBar title="今日单词" showBack rightContent={renderRightContent()} />
        <LoadingContainer>
          <Loading size="large" />
        </LoadingContainer>
      </Container>
    );
  }
  
  // 错误状态
  if (error && dailyWords.length === 0) {
    return (
      <Container>
        <HeaderBar title="今日单词" showBack />
        <ErrorContainer>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={fetchDailyWords}>重试</RetryButton>
        </ErrorContainer>
      </Container>
    );
  }
  
  // 没有数据
  if (!loading && dailyWords.length === 0) {
    return (
      <Container>
        <HeaderBar title="今日单词" showBack />
        <EmptyContainer>
          <EmptyMessage>今日没有需要学习的单词</EmptyMessage>
          <HomeButton onClick={() => navigate('/')}>返回首页</HomeButton>
        </EmptyContainer>
        <BottomNavbar />
      </Container>
    );
  }
  
  // 有单词数据，显示学习界面
  const currentWord = dailyWords[currentWordIndex];
  const isCurrentWordMastered = masteredWordIds.includes(currentWord?.id);
  
  return (
    <Container>
      <HeaderBar 
        title="今日单词" 
        showBack 
        rightContent={renderRightContent()} 
      />
      
      <MainContent>
        <ProgressBar 
          current={currentWordIndex + 1} 
          total={dailyWords.length} 
          label="学习进度" 
        />
        
        <WordCard 
          word={currentWord}
          isMastered={isCurrentWordMastered}
          onToggleMastered={handleToggleMastered}
          onPlayPronunciation={handlePlayPronunciation}
        />
        
        <NavigationButtons 
          onPrevious={handlePrevWord}
          onNext={handleNextWord}
          isPreviousDisabled={currentWordIndex === 0}
          isNextDisabled={currentWordIndex === dailyWords.length - 1}
        />
        
        <CompleteButtonContainer>
          <CompleteButton onClick={handleComplete}>
            完成背诵
          </CompleteButton>
        </CompleteButtonContainer>
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
  max-width: 1280px;
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
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  text-align: center;
  margin-bottom: 1rem;
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

const EmptyContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const EmptyMessage = styled.p`
  color: #6b7280;
  text-align: center;
  margin-bottom: 1rem;
`;

const HomeButton = styled.button`
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

const MasteredCount = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const CompleteButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const CompleteButton = styled.button`
  background-color: #3b82f6;
  color: white;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  
  &:hover {
    background-color: #2563eb;
  }
`;

export default WordlistPage; 