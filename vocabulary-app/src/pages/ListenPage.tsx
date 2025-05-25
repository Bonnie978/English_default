import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useExercise } from '../hooks/useExercise';
import HeaderBar from '../components/common/HeaderBar';
import AudioPlayer from '../components/exercise/AudioPlayer';
import QuestionCard from '../components/exercise/QuestionCard';
import SubmitButton from '../components/exercise/SubmitButton';
import BottomNavbar from '../components/common/BottomNavbar';
import Loading from '../components/common/Loading';

const ListenPage: React.FC = () => {
  const {
    exercise,
    answers,
    loading,
    submitting,
    error,
    generateNewExercise,
    updateAnswer,
    submitAnswers,
    isAllAnswered
  } = useExercise();
  
  const navigate = useNavigate();
  
  // 页面加载时生成听力练习
  useEffect(() => {
    generateNewExercise('listen');
  }, [generateNewExercise]);
  
  // 处理提交答案
  const handleSubmit = async () => {
    if (!exercise || !exercise.questions) return;
    
    const result = await submitAnswers();
    if (result && result.success) {
      // 构造详细的结果数据
      const resultData = {
        exerciseType: 'listen' as const,
        score: result.score,
        feedback: result.feedback,
        results: result.results.map((r: any, index: number) => ({
          questionId: r.questionId,
          question: exercise.questions![index].question,
          userAnswer: answers[r.questionId] || '',
          correctAnswer: r.correctAnswer,
          isCorrect: r.isCorrect,
          explanation: r.explanation,
          relatedWords: ['fitness', 'regime', 'cardiovascular'] // 示例单词，实际应该从后端获取
        })),
        timeSpent: '15分钟', // 实际应该计算真实时间
        date: new Date().toLocaleDateString('zh-CN')
      };
      
      // 跳转到结果页面，传递结果数据
      navigate('/result', { state: resultData });
    }
  };
  
  // 返回练习选择
  const handleBackToExam = () => {
    navigate('/exam');
  };
  
  // 渲染右侧内容
  const renderRightContent = () => (
    <TypeBadge>今日单词练习</TypeBadge>
  );
  
  // 加载状态
  if (loading) {
    return (
      <Container>
        <HeaderBar title="听力理解" showBack rightContent={renderRightContent()} />
        <LoadingContainer>
          <Loading size="large" />
          <LoadingText>正在生成听力练习...</LoadingText>
        </LoadingContainer>
        <BottomNavbar />
      </Container>
    );
  }
  
  // 错误状态
  if (error) {
    return (
      <Container>
        <HeaderBar title="听力理解" showBack />
        <ErrorContainer>
          <ErrorMessage>{error}</ErrorMessage>
          <ErrorButton onClick={() => generateNewExercise('listen')}>
            重新生成
          </ErrorButton>
          <BackButton onClick={handleBackToExam}>
            返回练习选择
          </BackButton>
        </ErrorContainer>
        <BottomNavbar />
      </Container>
    );
  }
  
  // 没有练习数据
  if (!exercise) {
    return (
      <Container>
        <HeaderBar title="听力理解" showBack />
        <EmptyContainer>
          <EmptyMessage>无法加载练习内容</EmptyMessage>
          <ErrorButton onClick={() => generateNewExercise('listen')}>
            重新生成
          </ErrorButton>
        </EmptyContainer>
        <BottomNavbar />
      </Container>
    );
  }

  // 检查必要的数据是否存在
  if (!exercise.audioUrl || !exercise.questions) {
    return (
      <Container>
        <HeaderBar title="听力理解" showBack />
        <EmptyContainer>
          <EmptyMessage>练习数据不完整</EmptyMessage>
          <ErrorButton onClick={() => generateNewExercise('listen')}>
            重新生成
          </ErrorButton>
        </EmptyContainer>
        <BottomNavbar />
      </Container>
    );
  }
  
  return (
    <Container>
      <HeaderBar 
        title="听力理解" 
        showBack 
        rightContent={renderRightContent()} 
      />
      
      <MainContent>
        {/* 音频播放器 */}
        <AudioPlayer 
          audioUrl={exercise.audioUrl}
          onPlayCountUpdate={(count: number) => {
            console.log(`音频播放次数: ${count}`);
          }}
        />
        
        {/* 问题列表 */}
        <QuestionsSection>
          <SectionTitle>Questions</SectionTitle>
          {exercise.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              questionIndex={index}
              selectedAnswer={answers[question.id] || null}
              onAnswerSelect={(answer) => updateAnswer(question.id, answer)}
            />
          ))}
        </QuestionsSection>
        
        {/* 提交按钮 */}
        <SubmitButton
          onClick={handleSubmit}
          disabled={!isAllAnswered()}
          loading={submitting}
        />
        
        {/* 返回按钮 */}
        <BackButtonContainer>
          <BackToExamButton onClick={handleBackToExam}>
            返回题目列表
          </BackToExamButton>
        </BackButtonContainer>
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

const LoadingText = styled.p`
  color: #6b7280;
  font-size: 1rem;
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

const EmptyContainer = styled.div`
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
  font-size: 1rem;
`;

const EmptyMessage = styled.p`
  color: #6b7280;
  text-align: center;
  font-size: 1rem;
`;

const ErrorButton = styled.button`
  background-color: #8b5cf6;
  color: white;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #7c3aed;
  }
`;

const BackButton = styled.button`
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

const TypeBadge = styled.span`
  background-color: #8b5cf6;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
`;

const QuestionsSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem 0;
`;

const BackButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const BackToExamButton = styled.button`
  color: #8b5cf6;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default ListenPage; 