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
    recordLearningSession,
    masteredWordIds
  } = useLearning();
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const navigate = useNavigate();
  
  // 获取每日单词
  useEffect(() => {
    if ((dailyWords?.length || 0) === 0) {
      fetchDailyWords();
    }
  }, [fetchDailyWords, dailyWords?.length]);
  
  // 处理上一个单词
  const handlePrevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };
  
  // 处理下一个单词
  const handleNextWord = () => {
    if (currentWordIndex < (dailyWords?.length || 0) - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };
  
  // 切换单词掌握状态
  const handleToggleMastered = async () => {
    if ((dailyWords?.length || 0) > 0) {
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
  
  // 完成学习会话并记录进度
  const handleComplete = async () => {
    try {
      setIsCompleting(true);
      
      // 构建学习会话数据：所有看过的单词都记为"正确"（因为已经完成学习）
      // 已掌握的单词标记为正确，未掌握的标记为需要复习
      const learningSession = dailyWords.map(word => ({
        wordId: word.id,
        isCorrect: masteredWordIds.includes(word.id), // 基于用户是否标记为已掌握
        timeSpent: 60 // 估算每个单词60秒学习时间
      }));
      
      // 记录学习会话
      await recordLearningSession(learningSession);
      
      // 显示完成提示
      alert(`🎉 今日学习完成！\n已学习 ${dailyWords.length} 个单词\n掌握 ${masteredWordIds.length} 个单词`);
      
      // 跳转到练习页面
      navigate('/exam');
    } catch (error) {
      console.error('完成学习失败:', error);
      alert('记录学习进度失败，请重试');
    } finally {
      setIsCompleting(false);
    }
  };
  
  // 渲染右侧内容
  const renderRightContent = () => (
    <MasteredCount>
      已掌握: {progress?.learned || 0}/{progress?.total || 0}
    </MasteredCount>
  );
  
  // 加载状态
  if (loading && (dailyWords?.length || 0) === 0) {
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
  if (error && (dailyWords?.length || 0) === 0) {
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
  if (!loading && (dailyWords?.length || 0) === 0) {
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
  const currentWord = dailyWords?.[currentWordIndex];
  const isCurrentWordMastered = masteredWordIds?.includes(currentWord?.id);
  
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
          total={dailyWords?.length || 0} 
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
          isNextDisabled={currentWordIndex === (dailyWords?.length || 0) - 1}
        />
        
        <CompleteButtonContainer>
          <CompleteButton 
            onClick={handleComplete}
            disabled={isCompleting || loading}
          >
            {isCompleting ? '记录学习进度中...' : '完成背诵'}
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
  
  &:hover:not(:disabled) {
    background-color: #2563eb;
  }
  
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

export default WordlistPage; 