import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useExercise } from '../hooks/useExercise';
import { evaluateWriting } from '../services/exerciseService';
import HeaderBar from '../components/common/HeaderBar';
import WritingPrompt from '../components/exercise/WritingPrompt';
import WriteEditor from '../components/exercise/WriteEditor';
import BottomNavbar from '../components/common/BottomNavbar';
import Loading from '../components/common/Loading';

const WritePage: React.FC = () => {
  const {
    exercise,
    loading,
    error,
    generateNewExercise
  } = useExercise();
  
  const [essayContent, setEssayContent] = useState('');
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  
  const navigate = useNavigate();
  
  // 页面加载时生成写作练习
  useEffect(() => {
    generateNewExercise('write');
  }, [generateNewExercise]);

  // 更新字数统计
  useEffect(() => {
    const words = essayContent.trim().split(/\s+/);
    const count = essayContent.trim() === '' ? 0 : words.length;
    setWordCount(count);
  }, [essayContent]);

  // 处理写作内容变化
  const handleContentChange = (content: string) => {
    setEssayContent(content);
  };

  // 处理目标词汇使用变化
  const handleWordUsageChange = (words: string[]) => {
    setUsedWords(words);
  };

  // 检查是否满足提交条件
  const canSubmit = () => {
    if (!exercise || !exercise.requirements || !exercise.targetWords) return false;
    
    const meetWordCount = wordCount >= exercise.requirements.minWords;
    const meetTargetWords = usedWords.length >= exercise.requirements.minTargetWords;
    
    return meetWordCount && meetTargetWords && essayContent.trim().length > 0;
  };

  // 提交写作作业
  const handleSubmit = async () => {
    if (!exercise || !canSubmit() || !exercise.targetWords) return;

    try {
      setSubmitting(true);
      
      const result = await evaluateWriting(
        exercise.id,
        essayContent,
        exercise.targetWords
      );

      if (result.success) {
        // 构造结果数据
        const resultData = {
          exerciseType: 'write' as const,
          score: result.score,
          feedback: result.feedback,
          writingFeedback: {
            dimensions: result.results,
            improvement: result.improvements.join(' ')
          },
          essayContent: essayContent,
          usedTargetWords: result.usedTargetWords,
          timeSpent: '25分钟', // 实际应该计算真实时间
          date: new Date().toLocaleDateString('zh-CN')
        };

        // 跳转到结果页面
        navigate('/result', { state: resultData });
      } else {
        throw new Error(result.message || '评分失败');
      }
    } catch (error: any) {
      console.error('提交写作失败:', error);
      alert('提交失败，请重试：' + error.message);
    } finally {
      setSubmitting(false);
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
        <HeaderBar title="写作练习" showBack rightContent={renderRightContent()} />
        <LoadingContainer>
          <Loading size="large" />
          <LoadingText>正在生成写作练习...</LoadingText>
        </LoadingContainer>
        <BottomNavbar />
      </Container>
    );
  }

  // 错误状态
  if (error) {
    return (
      <Container>
        <HeaderBar title="写作练习" showBack />
        <ErrorContainer>
          <ErrorMessage>{error}</ErrorMessage>
          <ErrorButton onClick={() => generateNewExercise('write')}>
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
        <HeaderBar title="写作练习" showBack />
        <EmptyContainer>
          <EmptyMessage>无法加载练习内容</EmptyMessage>
          <ErrorButton onClick={() => generateNewExercise('write')}>
            重新生成
          </ErrorButton>
        </EmptyContainer>
        <BottomNavbar />
      </Container>
    );
  }

  // 检查必要的数据是否存在
  if (!exercise.prompt || !exercise.targetWords || !exercise.requirements) {
    return (
      <Container>
        <HeaderBar title="写作练习" showBack />
        <EmptyContainer>
          <EmptyMessage>练习数据不完整</EmptyMessage>
          <ErrorButton onClick={() => generateNewExercise('write')}>
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
        title="写作练习" 
        showBack 
        rightContent={renderRightContent()} 
      />
      
      <MainContent>
        {/* 写作提示 */}
        <WritingPrompt prompt={exercise.prompt} />
        
        {/* 写作编辑器 */}
        <WriteEditor
          value={essayContent}
          onChange={handleContentChange}
          targetWords={exercise.targetWords}
          onWordUsageChange={handleWordUsageChange}
          minHeight="300px"
        />
        
        {/* 提交状态提示 */}
        <SubmitStatus>
          <StatusRow>
            <StatusItem>
              <StatusLabel>字数要求:</StatusLabel>
              <StatusValue isValid={wordCount >= exercise.requirements.minWords}>
                {wordCount}/{exercise.requirements.minWords}+
                {wordCount >= exercise.requirements.minWords && <CheckIcon>✓</CheckIcon>}
              </StatusValue>
            </StatusItem>
            
            <StatusItem>
              <StatusLabel>目标词汇:</StatusLabel>
              <StatusValue isValid={usedWords.length >= exercise.requirements.minTargetWords}>
                {usedWords.length}/{exercise.requirements.minTargetWords}+
                {usedWords.length >= exercise.requirements.minTargetWords && <CheckIcon>✓</CheckIcon>}
              </StatusValue>
            </StatusItem>
          </StatusRow>
          
          {canSubmit() ? (
            <SuccessMessage>您的文章已符合提交要求</SuccessMessage>
          ) : (
            <RequirementMessage>
              {wordCount < exercise.requirements.minWords && 
                `需要再写 ${exercise.requirements.minWords - wordCount} 个词`}
              {wordCount >= exercise.requirements.minWords && 
                usedWords.length < exercise.requirements.minTargetWords &&
                `请至少使用 ${exercise.requirements.minTargetWords} 个目标词汇（当前已使用 ${usedWords.length} 个）`}
            </RequirementMessage>
          )}
        </SubmitStatus>
        
        {/* 提交按钮 */}
        <SubmitButtonContainer>
          <SubmitButton 
            onClick={handleSubmit}
            disabled={!canSubmit() || submitting}
            isLoading={submitting}
          >
            {submitting ? (
              <>
                <LoadingSpinner />
                评分中...
              </>
            ) : (
              '提交作文'
            )}
          </SubmitButton>
        </SubmitButtonContainer>
        
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
  background-color: #22c55e;
  color: white;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #16a34a;
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
  background-color: #22c55e;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
`;

const SubmitStatus = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const StatusRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusLabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const StatusValue = styled.span<{ isValid: boolean }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.isValid ? '#22c55e' : '#f59e0b'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CheckIcon = styled.span`
  color: #22c55e;
`;

const SuccessMessage = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: #22c55e;
  margin: 0;
`;

const RequirementMessage = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: #f59e0b;
  margin: 0;
`;

const SubmitButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`;

const SubmitButton = styled.button<{ isLoading: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 20rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  background-color: ${props => props.disabled ? '#d1d5db' : '#22c55e'};
  color: ${props => props.disabled ? '#9ca3af' : 'white'};
  
  &:hover:not(:disabled) {
    background-color: #16a34a;
  }
`;

const LoadingSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const BackButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const BackToExamButton = styled.button`
  color: #22c55e;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default WritePage; 