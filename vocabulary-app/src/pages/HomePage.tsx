import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useLearning } from '../hooks/useLearning';
import api from '../services/api';
import BottomNavbar from '../components/common/BottomNavbar';
import Loading from '../components/common/Loading';

// 接口定义
interface LearningStats {
  totalWordsLearned: number;
  masteredWords: number;
  streakDays: number;
  totalExercises: number;
}

const HomePage: React.FC = () => {
  const { user, loading } = useSupabaseAuth();
  const { progress, loading: dailyWordsLoading } = useLearning();
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // 获取学习统计数据
  const fetchStats = useCallback(async () => {
    // 如果用户未登录，不调用API
    if (!user) {
      console.log('HomePage: User not logged in, skipping stats fetch');
      setStatsLoading(false);
      setError('请先登录以查看学习统计');
      return;
    }

    try {
      setStatsLoading(true);
      setError(null);
      console.log('HomePage: Fetching stats...');
      const response = await api.get('/words/stats');
      if (response.data.success) {
        setStats(response.data.stats);
        console.log('HomePage: Stats fetched successfully');
      } else {
        throw new Error(response.data.message || '无法获取统计数据');
      }
    } catch (error: any) {
      console.error('HomePage: Error fetching stats:', error);
      
      if (error.response?.status === 401) {
        // 如果是认证错误，显示友好提示
        setError('请先登录以查看学习统计');
      } else {
        setError(error.message || '获取统计数据失败，请稍后再试');
      }
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('HomePage: useEffect triggered, user:', !!user, 'loading:', loading);
    if (!loading) {
      fetchStats();
    }
  }, [loading, fetchStats, user]);
  
  // 页面交互方法
  const handleStartLearning = () => {
    navigate('/wordlist');
  };
  
  const handleViewWrongAnswers = () => {
    navigate('/wrong');
  };
  
  // 返回加载状态
  if (statsLoading) {
    return (
      <LoadingContainer>
        <Loading size="large" />
      </LoadingContainer>
    );
  }
  
  return (
    <Container>
      {/* 顶部导航栏 */}
      <Header>
        <HeaderContent>
          <AppName>背词助手</AppName>
          <ProfileButton onClick={() => navigate('/profile')}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </ProfileButton>
        </HeaderContent>
      </Header>

      {/* 主要内容区 */}
      <Main>
        <ContentWrapper>
          <WelcomeSection>
            <WelcomeTitle>欢迎使用背词助手</WelcomeTitle>
            <WelcomeSubtitle>高效记忆单词，提升英语能力</WelcomeSubtitle>
          </WelcomeSection>

          {/* 添加错误提示 */}
          {error && (
            <ErrorMessage>
              <p>{error}</p>
              <button onClick={fetchStats}>重试</button>
            </ErrorMessage>
          )}

          {/* 学习统计卡片 */}
          <StatsCard>
            <CardTitle>学习统计</CardTitle>
            <StatsGrid>
              <StatItem>
                <StatLabel>已学单词</StatLabel>
                <StatValue>{stats?.totalWordsLearned || 0}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>正确率</StatLabel>
                <StatValue>{user?.learningStats?.correctRate ?? 0}%</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>连续学习</StatLabel>
                <StatValue>{stats?.streakDays || 0}天</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>掌握单词</StatLabel>
                <StatValue>{stats?.masteredWords || 0}</StatValue>
              </StatItem>
            </StatsGrid>
          </StatsCard>

          {/* 学习卡片 */}
          <ActionCardsGrid>
            {/* 开始学习卡片 */}
            <ActionCard>
              <ActionCardContent>
                <ActionTextContainer>
                  <CardTitle>今日学习</CardTitle>
                  <ActionDescription>开始今天的单词学习，提升你的词汇量</ActionDescription>
                  <ActionButton onClick={handleStartLearning}>
                    开始学习
                  </ActionButton>
                </ActionTextContainer>
                <ActionIcon $bgColor="#DBEAFE">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </ActionIcon>
              </ActionCardContent>
              <ProgressSection>
                <ProgressInfo>
                  <ProgressLabel>今日进度</ProgressLabel>
                  <ProgressValue>
                    {dailyWordsLoading ? '加载中...' : `${progress.learned}/${progress.total}`}
                  </ProgressValue>
                </ProgressInfo>
                <ProgressBar>
                  <ProgressFill 
                    style={{ 
                      width: dailyWordsLoading || !progress.total ? '0%' : `${(progress.learned / progress.total) * 100}%`
                    }}
                  />
                </ProgressBar>
              </ProgressSection>
            </ActionCard>

            {/* 错题练习卡片 */}
            <ActionCard>
              <ActionCardContent>
                <ActionTextContainer>
                  <CardTitle>错题练习</CardTitle>
                  <ActionDescription>复习之前的错题，强化记忆并提高正确率</ActionDescription>
                  <SecondaryButton onClick={handleViewWrongAnswers}>
                    查看错题
                  </SecondaryButton>
                </ActionTextContainer>
                <ActionIcon $bgColor="#FEE2E2">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </ActionIcon>
              </ActionCardContent>
              <MistakeStatsSection>
                <ProgressInfo>
                  <ProgressLabel>累计错题</ProgressLabel>
                  <ProgressValue>24题</ProgressValue>
                </ProgressInfo>
                <TypeGrid>
                  <TypeItem>
                    <TypeLabel>阅读</TypeLabel>
                    <TypeValue>8</TypeValue>
                  </TypeItem>
                  <TypeItem>
                    <TypeLabel>听力</TypeLabel>
                    <TypeValue>10</TypeValue>
                  </TypeItem>
                  <TypeItem>
                    <TypeLabel>写作</TypeLabel>
                    <TypeValue>6</TypeValue>
                  </TypeItem>
                </TypeGrid>
              </MistakeStatsSection>
            </ActionCard>
          </ActionCardsGrid>
        </ContentWrapper>
      </Main>

      {/* 使用提取的底部导航栏组件 */}
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 1.2rem;
  color: #4b5563;
`;

const Header = styled.header`
  background-color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
  @media (min-width: 640px) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  @media (min-width: 1024px) {
    padding-left: 2rem;
    padding-right: 2rem;
  }
`;

const AppName = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2563eb;
`;

const ProfileButton = styled.button`
  background-color: #f3f4f6;
  padding: 0.5rem;
  border-radius: 9999px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #e5e7eb;
  }
  
  .h-6 { height: 1.5rem; }
  .w-6 { width: 1.5rem; }
`;

const Main = styled.main`
  flex: 1;
`;

const ContentWrapper = styled.div`
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding: 2rem 1rem;
  @media (min-width: 640px) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  @media (min-width: 1024px) {
    padding-left: 2rem;
    padding-right: 2rem;
  }
`;

const WelcomeSection = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const WelcomeTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const WelcomeSubtitle = styled.p`
  color: #4b5563;
`;

const ErrorMessage = styled.div`
  background-color: #fee2e2;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  p {
    color: #ef4444;
    font-size: 0.875rem;
  }
  
  button {
    background-color: #ef4444;
    color: white;
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    border: none;
    cursor: pointer;
    
    &:hover {
      background-color: #dc2626;
    }
  }
`;

const CardTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 1rem;
`;

const StatsCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  padding: 1.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatItem = styled.div`
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
`;

const StatLabel = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.p`
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
`;

const ActionCardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ActionCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
`;

const ActionCardContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1;
`;

const ActionTextContainer = styled.div`
  // Takes up space left by icon
`;

const ActionDescription = styled.p`
  color: #6b7280;
  margin-bottom: 1rem;
`;

const ActionIcon = styled.div<{ $bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border-radius: 50%;
  background-color: ${props => props.$bgColor};
  margin-left: 1rem;
  flex-shrink: 0;

  .h-8 { height: 2rem; }
  .w-8 { width: 2rem; }
  .text-blue-600 { color: #2563eb; }
  .text-red-600 { color: #dc2626; }
`;

const ActionButton = styled.button`
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

const SecondaryButton = styled.button`
  background-color: white;
  color: #6b7280;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  cursor: pointer;
  
  &:hover {
    background-color: #f9fafb;
  }
`;

const ProgressSection = styled.div`
  margin-top: 1.5rem;
`;

const MistakeStatsSection = styled.div`
  margin-top: 1.5rem;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
`;

const ProgressLabel = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ProgressValue = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
`;

const ProgressBar = styled.div`
  width: 100%;
  background-color: #e5e7eb;
  border-radius: 9999px;
  height: 0.5rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  background-color: #3b82f6;
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease-in-out;
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const TypeItem = styled.div`
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  padding: 0.5rem;
  text-align: center;
`;

const TypeLabel = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
`;

const TypeValue = styled.p`
  font-weight: 500;
  color: #111827;
  margin-top: 0.125rem;
`;

export default HomePage;