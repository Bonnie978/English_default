import React, { useState } from 'react';
import styled from 'styled-components';
import { useLearning } from '../hooks/useLearning';
import { useExercise } from '../hooks/useExercise';
import HeaderBar from '../components/common/HeaderBar';
import BottomNavbar from '../components/common/BottomNavbar';
import AudioPlayer from '../components/exercise/AudioPlayer';
import QuestionCard from '../components/exercise/QuestionCard';
import WriteEditor from '../components/exercise/WriteEditor';
import WritingPrompt from '../components/exercise/WritingPrompt';

const DebugPage: React.FC = () => {
  const { dailyWords } = useLearning();
  const { exercise, generateNewExercise, loading, error } = useExercise();
  const [testAnswer, setTestAnswer] = useState('');
  const [essayContent, setEssayContent] = useState('');
  const [usedWords, setUsedWords] = useState<string[]>([]);

  // 测试数据
  const testQuestion = {
    id: 'test-q1',
    question: 'What is the main topic of the conversation?',
    type: 'multiple-choice' as const,
    options: [
      'Planning a vacation',
      'Discussing work projects', 
      'Starting a fitness regime',
      'Comparing different technologies'
    ]
  };

  const testFillBlankQuestion = {
    id: 'test-q2',
    question: 'According to Mark, what is the most important thing when starting a fitness journey?',
    type: 'fill-blank' as const,
    options: []
  };

  // 测试写作提示数据
  const testWritingPrompt = {
    topic: "The Importance of Persistence in Achieving Goals",
    requirements: "Write a short essay about the importance of persistence in achieving personal or professional goals. Discuss how qualities like diligence and resilience contribute to success.",
    wordCount: "150-200 words",
    instructions: "Use at least 5 of the target vocabulary words in your essay. Be sure to use them correctly in context."
  };

  // 测试目标词汇
  const testTargetWords = [
    "diligent", "collaborate", "perseverance", "implement", "perspective",
    "accomplish", "innovative", "resilient", "enhance", "substantial"
  ];

  return (
    <Container>
      <HeaderBar title="调试页面" showBack />
      
      <MainContent>
        <Section>
          <SectionTitle>🎧 音频播放器测试</SectionTitle>
          <AudioPlayer 
            audioUrl="/api/exercises/audio/sample-listening.mp3"
            onPlayCountUpdate={(count: number) => {
              console.log(`播放次数: ${count}`);
            }}
          />
        </Section>

        <Section>
          <SectionTitle>❓ 问题组件测试</SectionTitle>
          <QuestionCard
            question={testQuestion}
            questionIndex={0}
            selectedAnswer={testAnswer}
            onAnswerSelect={setTestAnswer}
          />
          <QuestionCard
            question={testFillBlankQuestion}
            questionIndex={1}
            selectedAnswer={testAnswer}
            onAnswerSelect={setTestAnswer}
          />
          <p>当前选择的答案: {testAnswer}</p>
        </Section>

        <Section>
          <SectionTitle>✍️ 写作组件测试</SectionTitle>
          <WritingPrompt prompt={testWritingPrompt} />
          <WriteEditor
            value={essayContent}
            onChange={setEssayContent}
            targetWords={testTargetWords}
            onWordUsageChange={setUsedWords}
            minHeight="200px"
          />
          <InfoCard>
            <p><strong>当前字数:</strong> {essayContent.trim().split(/\s+/).filter(word => word).length}</p>
            <p><strong>已使用目标词汇:</strong> {usedWords.join(', ') || '无'}</p>
          </InfoCard>
        </Section>

        <Section>
          <SectionTitle>📊 今日单词状态</SectionTitle>
          <InfoCard>
            <p><strong>今日单词数量:</strong> {dailyWords.length}</p>
            <p><strong>单词列表:</strong></p>
            <ul>
              {dailyWords.slice(0, 5).map(word => (
                <li key={word.id}>{word.spelling} - {word.definitions[0] || '无定义'}</li>
              ))}
              {dailyWords.length > 5 && <li>...还有 {dailyWords.length - 5} 个单词</li>}
            </ul>
          </InfoCard>
        </Section>

        <Section>
          <SectionTitle>🎯 练习生成测试</SectionTitle>
          <ButtonGroup>
            <TestButton onClick={() => generateNewExercise('read')}>
              生成阅读练习
            </TestButton>
            <TestButton onClick={() => generateNewExercise('listen')}>
              生成听力练习
            </TestButton>
            <TestButton onClick={() => generateNewExercise('write')}>
              生成写作练习
            </TestButton>
          </ButtonGroup>
          
          {loading && <p>正在生成练习...</p>}
          {error && <ErrorText>错误: {error}</ErrorText>}
          
          {exercise && (
            <InfoCard>
              <p><strong>练习类型:</strong> {exercise.type}</p>
              <p><strong>练习ID:</strong> {exercise.id}</p>
              <p><strong>问题数量:</strong> {exercise.questions?.length || 0}</p>
              <p><strong>音频URL:</strong> {exercise.audioUrl || '无'}</p>
              <p><strong>目标词汇:</strong> {exercise.targetWords?.join(', ') || '无'}</p>
              <details>
                <summary>查看练习内容</summary>
                <pre style={{ fontSize: '0.875rem', overflow: 'auto' }}>
                  {JSON.stringify(exercise, null, 2)}
                </pre>
              </details>
            </InfoCard>
          )}
        </Section>

        <Section>
          <SectionTitle>🔗 快速导航测试</SectionTitle>
          <ButtonGroup>
            <TestButton onClick={() => window.location.href = '/exam'}>
              练习选择页面
            </TestButton>
            <TestButton onClick={() => window.location.href = '/exam/read'}>
              阅读练习页面
            </TestButton>
            <TestButton onClick={() => window.location.href = '/exam/listen'}>
              听力练习页面
            </TestButton>
            <TestButton onClick={() => window.location.href = '/exam/write'}>
              写作练习页面
            </TestButton>
          </ButtonGroup>
        </Section>
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

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
`;

const InfoCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  
  p {
    margin: 0.5rem 0;
  }
  
  ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  
  li {
    margin: 0.25rem 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const TestButton = styled.button`
  background-color: #3b82f6;
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #2563eb;
  }
`;

const ErrorText = styled.p`
  color: #ef4444;
  font-weight: 500;
`;

export default DebugPage; 