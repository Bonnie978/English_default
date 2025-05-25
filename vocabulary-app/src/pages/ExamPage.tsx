import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ExerciseTypeCard } from '../components/exam/ExerciseTypeCard';
import { LearningProgressCard } from '../components/exam/LearningProgressCard';
import { exerciseService, ExerciseStatus, LearningProgress } from '../services/exerciseService';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  color: white;
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
`;

const ProgressSection = styled.div`
  margin-bottom: 40px;
`;

const ExerciseSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  margin-bottom: 20px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  color: #ff6b6b;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
`;

const LoadingMessage = styled.div`
  color: white;
  text-align: center;
  font-size: 1.1rem;
  padding: 40px;
`;

const ExamPage: React.FC = () => {
  const navigate = useNavigate();
  const [exerciseStatus, setExerciseStatus] = useState<ExerciseStatus | null>(null);
  const [learningProgress, setLearningProgress] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 获取练习状态和学习进度
      const [statusData, progressData] = await Promise.all([
        exerciseService.getExerciseStatus(),
        exerciseService.getLearningProgress()
      ]);
      
      setExerciseStatus(statusData);
      setLearningProgress(progressData);
    } catch (err) {
      console.error('加载数据失败:', err);
      setError('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExercise = async (type: 'read' | 'listen' | 'write') => {
    try {
      console.log(`开始${type}练习`);
      // 直接导航到对应的练习页面，练习生成将在具体页面中进行
      switch (type) {
        case 'read':
          navigate('/exam/read');
          break;
        case 'listen':
          navigate('/exam/listen');
          break;
        case 'write':
          navigate('/exam/write');
          break;
      }
    } catch (err) {
      console.error('开始练习失败:', err);
      setError('开始练习失败，请稍后重试');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>正在加载练习数据...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={handleBack}>
        ← 返回首页
      </BackButton>

      <Header>
        <Title>练习选择</Title>
        <Subtitle>选择您想要进行的练习类型</Subtitle>
      </Header>

      {error && (
        <ErrorMessage>
          {error}
          <button 
            onClick={loadData}
            style={{ 
              marginLeft: '10px', 
              background: 'none', 
              border: '1px solid currentColor', 
              color: 'inherit',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            重试
          </button>
        </ErrorMessage>
      )}

      {learningProgress && (
        <ProgressSection>
          <LearningProgressCard progress={learningProgress} />
        </ProgressSection>
      )}

      {exerciseStatus && (
        <ExerciseSection>
          <ExerciseTypeCard
            type="read"
            status={exerciseStatus.read}
            onStart={() => handleStartExercise('read')}
          />
          <ExerciseTypeCard
            type="listen"
            status={exerciseStatus.listen}
            onStart={() => handleStartExercise('listen')}
          />
          <ExerciseTypeCard
            type="write"
            status={exerciseStatus.write}
            onStart={() => handleStartExercise('write')}
          />
        </ExerciseSection>
      )}
    </Container>
  );
};

export default ExamPage; 