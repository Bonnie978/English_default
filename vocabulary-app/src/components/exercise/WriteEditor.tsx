import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface WriteEditorProps {
  value: string;
  onChange: (value: string) => void;
  targetWords: string[];
  onWordUsageChange?: (usedWords: string[]) => void;
  placeholder?: string;
  minHeight?: string;
}

const WriteEditor: React.FC<WriteEditorProps> = ({
  value,
  onChange,
  targetWords,
  onWordUsageChange,
  placeholder = "请在这里输入你的文章...",
  minHeight = "250px"
}) => {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 检查单词使用情况
  const checkWordUsage = (text: string) => {
    if (!text.trim()) {
      setUsedWords([]);
      onWordUsageChange?.([]);
      return;
    }

    const textLower = text.toLowerCase();
    const foundWords = targetWords.filter(word => {
      // 使用更精确的单词匹配：单词边界检查
      const wordRegex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'i');
      return wordRegex.test(textLower);
    });

    setUsedWords(foundWords);
    onWordUsageChange?.(foundWords);
  };

  // 计算字数和字符数
  const updateCounts = (text: string) => {
    setCharCount(text.length);
    
    // 简单的英文单词计数：按空格分割
    const words = text.trim().split(/\s+/);
    const wordCount = text.trim() === '' ? 0 : words.length;
    setWordCount(wordCount);
  };

  // 处理文本变化
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    updateCounts(newValue);
    checkWordUsage(newValue);
  };

  // 自动调整文本框高度
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(textarea.scrollHeight, parseInt(minHeight)) + 'px';
    }
  };

  // 初始化和文本变化时更新统计
  useEffect(() => {
    updateCounts(value);
    checkWordUsage(value);
    adjustHeight();
  }, [value, targetWords, updateCounts, checkWordUsage, adjustHeight]);

  // 插入目标单词
  const insertWord = (word: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value;
    
    // 在光标位置插入单词
    const beforeCursor = currentValue.substring(0, start);
    const afterCursor = currentValue.substring(end);
    
    // 添加适当的空格
    const needSpaceBefore = beforeCursor.length > 0 && !beforeCursor.endsWith(' ');
    const needSpaceAfter = afterCursor.length > 0 && !afterCursor.startsWith(' ');
    
    const wordToInsert = `${needSpaceBefore ? ' ' : ''}${word}${needSpaceAfter ? ' ' : ''}`;
    const newValue = beforeCursor + wordToInsert + afterCursor;
    
    onChange(newValue);
    
    // 设置新的光标位置
    const newCursorPos = start + wordToInsert.length;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <Container>
      {/* 编辑器工具栏 */}
      <Toolbar>
        <ToolbarLeft>
          <ToolbarButton onClick={() => textareaRef.current?.focus()}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            格式
          </ToolbarButton>
        </ToolbarLeft>
        
        <ToolbarRight>
          <WordCountDisplay>
            <CountItem>
              <CountLabel>单词:</CountLabel>
              <CountValue>{wordCount}</CountValue>
            </CountItem>
            <CountItem>
              <CountLabel>字符:</CountLabel>
              <CountValue>{charCount}</CountValue>
            </CountItem>
          </WordCountDisplay>
        </ToolbarRight>
      </Toolbar>

      {/* 文本编辑区域 */}
      <EditorArea>
        <StyledTextarea
          ref={textareaRef}
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          minHeight={minHeight}
          spellCheck={false}
        />
      </EditorArea>

      {/* 目标词汇快速插入 */}
      <WordSuggestions>
        <SuggestionTitle>快速插入目标词汇:</SuggestionTitle>
        <WordTags>
          {targetWords.map((word, index) => (
            <WordTag
              key={index}
              onClick={() => insertWord(word)}
              isUsed={usedWords.includes(word)}
            >
              {word}
              {usedWords.includes(word) && (
                <UsedIndicator>✓</UsedIndicator>
              )}
            </WordTag>
          ))}
        </WordTags>
      </WordSuggestions>

      {/* 使用统计 */}
      <UsageStats>
        <StatsTitle>词汇使用情况:</StatsTitle>
        <StatsContent>
          已使用 <StatsNumber>{usedWords.length}</StatsNumber> / {targetWords.length} 个目标词汇
          {usedWords.length >= 5 && (
            <StatsSuccess>✓ 已达到最低要求</StatsSuccess>
          )}
        </StatsContent>
      </UsageStats>
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
`;

const ToolbarButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  color: #6b7280;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const WordCountDisplay = styled.div`
  display: flex;
  gap: 1rem;
`;

const CountItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CountLabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const CountValue = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
`;

const EditorArea = styled.div`
  padding: 0.5rem;
`;

const StyledTextarea = styled.textarea<{ minHeight: string }>`
  width: 100%;
  min-height: ${props => props.minHeight};
  padding: 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  color: #111827;
  resize: none;
  outline: none;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  }
`;

const WordSuggestions = styled.div`
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
`;

const SuggestionTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 0 0 0.5rem 0;
`;

const WordTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const WordTag = styled.button<{ isUsed: boolean }>`
  position: relative;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid ${props => props.isUsed ? '#22c55e' : '#d1d5db'};
  background-color: ${props => props.isUsed ? '#dcfce7' : 'white'};
  color: ${props => props.isUsed ? '#15803d' : '#374151'};
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.isUsed ? '#bbf7d0' : '#f3f4f6'};
  }
`;

const UsedIndicator = styled.span`
  margin-left: 0.25rem;
  font-size: 0.75rem;
`;

const UsageStats = styled.div`
  padding: 0.75rem 1rem;
  border-top: 1px solid #e5e7eb;
  background-color: #fefefe;
`;

const StatsTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 0 0 0.25rem 0;
`;

const StatsContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const StatsNumber = styled.span`
  font-weight: 600;
  color: #22c55e;
`;

const StatsSuccess = styled.span`
  color: #22c55e;
  font-weight: 500;
`;

export default WriteEditor; 