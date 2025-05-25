import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import HeaderBar from '../components/common/HeaderBar';
import ScoreCircle from '../components/result/ScoreCircle';
import ExerciseSummary from '../components/result/ExerciseSummary';
import QuestionResult, { QuestionResultData } from '../components/result/QuestionResult';
import ActionButtons from '../components/result/ActionButtons';
import BottomNavbar from '../components/common/BottomNavbar';

// 练习结果数据接口
interface ExerciseResultData {
  exerciseType: 'read' | 'listen' | 'write';
  score: number;
  feedback: string;
  results: QuestionResultData[];
  timeSpent?: string;
  date?: string;
}

const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  
  // 从路由状态中获取结果数据
  const resultData: ExerciseResultData = location.state || {
    exerciseType: 'read',
    score: 0,
    feedback: '暂无反馈',
    results: [],
    timeSpent: '未记录',
    date: new Date().toLocaleDateString('zh-CN')
  };
  
  // 如果没有结果数据，重定向到首页
  useEffect(() => {
    if (!location.state) {
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);
  
  // 计算统计数据
  const totalQuestions = resultData.results.length;
  const correctAnswers = resultData.results.filter(r => r.isCorrect).length;
  const wrongAnswers = resultData.results.filter(r => !r.isCorrect);
  
  // 处理查看错题集
  const handleViewWrongAnswers = () => {
    navigate('/wrong');
  };
  
  // 处理返回首页
  const handleBackToHome = () => {
    navigate('/');
  };
  
  // 获取练习类型名称
  const getExerciseTypeName = (type: string) => {
    switch (type) {
      case 'read': return '阅读理解';
      case 'listen': return '听力理解';
      case 'write': return '写作练习';
      default: return '练习';
    }
  };
  
  // 获取所有相关单词
  const getAllRelatedWords = (): string[] => {
    const words = new Set<string>();
    resultData.results.forEach(result => {
      if (result.relatedWords) {
        result.relatedWords.forEach(word => words.add(word));
      }
    });
    return Array.from(words);
  };
  
  return (
    <Container>
      <HeaderBar 
        title="练习结果" 
        showBack 
        rightContent={
          <DateBadge>{resultData.date || new Date().toLocaleDateString('zh-CN')}</DateBadge>
        }
      />
      
      <MainContent>
        {/* 结果概览卡片 */}
        <ResultCard>
          <CardHeader>
            <CardTitle>{getExerciseTypeName(resultData.exerciseType)}练习</CardTitle>
          </CardHeader>
          
          <CardContent>
            {/* 分数圆环 */}
            <ScoreSection>
              <ScoreCircle score={resultData.score} />
            </ScoreSection>
            
            {/* 结果概述 */}
            <FeedbackSection>
              <FeedbackText>{resultData.feedback}</FeedbackText>
              <StatsText>
                用时: {resultData.timeSpent || '未记录'} | 正确: {correctAnswers}/{totalQuestions}
              </StatsText>
            </FeedbackSection>
            
            {/* 选项卡 */}
            <TabsContainer>
              <TabButton
                $active={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
              >
                总览
              </TabButton>
              <TabButton
                $active={activeTab === 'details'}
                onClick={() => setActiveTab('details')}
              >
                详细
              </TabButton>
            </TabsContainer>
            
            {/* 内容区域 */}
            <ContentArea>
              {activeTab === 'overview' && (
                <OverviewContent>
                  {/* 练习总结 */}
                  <ExerciseSummary
                    exerciseType={resultData.exerciseType}
                    totalQuestions={totalQuestions}
                    correctAnswers={correctAnswers}
                    timeSpent={resultData.timeSpent}
                    date={resultData.date || new Date().toLocaleDateString('zh-CN')}
                  />
                  
                  {/* 知识点总结 */}
                  <KnowledgeSection>
                    <KnowledgeTitle>知识点总结</KnowledgeTitle>
                    <KnowledgeText>
                      本次练习涉及的单词: {getAllRelatedWords().join(', ') || '暂无相关单词'}
                    </KnowledgeText>
                  </KnowledgeSection>
                  
                  {/* 操作按钮 */}
                  <ActionButtons
                    onViewWrongAnswers={handleViewWrongAnswers}
                    onBackToHome={handleBackToHome}
                    wrongAnswersCount={wrongAnswers.length}
                  />
                </OverviewContent>
              )}
              
              {activeTab === 'details' && (
                <DetailsContent>
                  {resultData.results.map((result, index) => (
                    <QuestionResult
                      key={result.questionId}
                      result={result}
                      index={index}
                    />
                  ))}
                </DetailsContent>
              )}
            </ContentArea>
          </CardContent>
        </ResultCard>
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

const ResultCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const CardHeader = styled.div`
  background-color: #3b82f6;
  padding: 1rem 1.5rem;
`;

const CardTitle = styled.h2`
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const ScoreSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const FeedbackSection = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const FeedbackText = styled.p`
  font-size: 1.125rem;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const StatsText = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const TabsContainer = styled.div`
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
  display: flex;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  font-weight: 500;
  font-size: 0.875rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-right: 2rem;
  color: ${props => props.$active ? '#3b82f6' : '#6b7280'};
  border-bottom-color: ${props => props.$active ? '#3b82f6' : 'transparent'};
  
  &:hover {
    color: ${props => props.$active ? '#3b82f6' : '#374151'};
  }
`;

const ContentArea = styled.div``;

const OverviewContent = styled.div``;

const DetailsContent = styled.div``;

const KnowledgeSection = styled.div`
  background-color: #eff6ff;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
`;

const KnowledgeTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  color: #1e40af;
  margin: 0 0 0.5rem 0;
`;

const KnowledgeText = styled.p`
  color: #374151;
  margin: 0;
  line-height: 1.5;
`;

const DateBadge = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

export default ResultPage; 