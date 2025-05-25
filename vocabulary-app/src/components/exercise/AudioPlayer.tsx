import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface AudioPlayerProps {
  audioUrl?: string;
  onPlayCountUpdate?: (count: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  onPlayCountUpdate
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // 格式化时间显示
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };
  
  // 创建模拟音频数据
  const createMockAudio = () => {
    setDuration(150); // 2分30秒
    setHasAudio(true);
    setIsLoading(false);
    console.log('模拟音频已准备就绪，时长: 2分30秒');
  };
  
  // 处理音频加载
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (audioUrl && !audioUrl.includes('sample-listening.mp3')) {
      const handleLoadStart = () => setIsLoading(true);
      const handleCanPlay = () => {
        setIsLoading(false);
        setHasAudio(true);
      };
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setIsLoading(false);
        setHasAudio(true);
      };
      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      const handleError = () => {
        console.log('音频加载失败，使用模拟音频');
        setIsLoading(false);
        createMockAudio();
      };
      
      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      
      return () => {
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    } else {
      console.log('使用模拟音频数据');
      createMockAudio();
    }
  }, [audioUrl]);
  
  // 模拟播放控制
  const togglePlayPause = async () => {
    if (!hasAudio) return;
    
    try {
      if (isPlaying) {
        setIsPlaying(false);
        if ((window as any).mockAudioInterval) {
          clearInterval((window as any).mockAudioInterval);
          (window as any).mockAudioInterval = null;
        }
      } else {
        setIsPlaying(true);
        
        if (currentTime === 0) {
          const newCount = playCount + 1;
          setPlayCount(newCount);
          onPlayCountUpdate?.(newCount);
        }
        
        startMockPlayback();
      }
    } catch (error) {
      console.error('音频播放失败:', error);
    }
  };
  
  // 模拟播放进度
  const startMockPlayback = () => {
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1;
        if (newTime >= duration) {
          setIsPlaying(false);
          setCurrentTime(0);
          clearInterval(interval);
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    (window as any).mockAudioInterval = interval;
  };
  
  // 停止模拟播放
  useEffect(() => {
    if (!isPlaying && (window as any).mockAudioInterval) {
      clearInterval((window as any).mockAudioInterval);
      (window as any).mockAudioInterval = null;
    }
  }, [isPlaying]);
  
  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if ((window as any).mockAudioInterval) {
        clearInterval((window as any).mockAudioInterval);
        (window as any).mockAudioInterval = null;
      }
    };
  }, []);
  
  // 重新播放
  const handleRestart = () => {
    if (!hasAudio) return;
    
    if ((window as any).mockAudioInterval) {
      clearInterval((window as any).mockAudioInterval);
      (window as any).mockAudioInterval = null;
    }
    
    setCurrentTime(0);
    const newCount = playCount + 1;
    setPlayCount(newCount);
    onPlayCountUpdate?.(newCount);
    
    if (!isPlaying) {
      setIsPlaying(true);
      startMockPlayback();
    }
  };
  
  // 进度条点击跳转
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasAudio || duration === 0) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    setCurrentTime(newTime);
  };
  
  return (
    <Container>
      {/* 隐藏的audio元素 */}
      <audio ref={audioRef} preload="metadata">
        {audioUrl && <source src={audioUrl} type="audio/mpeg" />}
        您的浏览器不支持音频播放
      </audio>
      
      <PlayerContent>
        {/* 播放/暂停按钮 */}
        <PlayButton onClick={togglePlayPause} disabled={isLoading || !hasAudio}>
          {isLoading ? (
            <LoadingSpinner />
          ) : isPlaying ? (
            <svg width="40" height="40" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </PlayButton>
      </PlayerContent>
      
      {/* 进度条和时间 */}
      <ProgressSection>
        <TimeDisplay>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </TimeDisplay>
        <ProgressBar onClick={handleProgressClick}>
          <ProgressTrack />
          <ProgressFill 
            style={{ 
              width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' 
            }} 
          />
        </ProgressBar>
      </ProgressSection>
      
      {/* 控制按钮 */}
      <ControlButtons>
        <ControlButton onClick={handleRestart} disabled={!hasAudio}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          重新播放
        </ControlButton>
        
        <PlayCountDisplay>
          已播放: <PlayCountBadge>{playCount}</PlayCountBadge> 次
        </PlayCountDisplay>
      </ControlButtons>
      
      {/* 提示信息 */}
      <HintText>
        <p>请仔细聆听对话内容，然后回答下面的问题</p>
        <p>你可以随时重新播放音频，但请注意听力考核通常只允许听2-3次</p>
        {!hasAudio && (
          <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>
            注意：当前为演示模式，音频播放器功能正常但无实际声音
          </p>
        )}
      </HintText>
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const PlayerContent = styled.div`
  padding: 1.5rem;
  text-align: center;
`;

const PlayButton = styled.button`
  width: 5rem;
  height: 5rem;
  background-color: #8b5cf6;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.39);
  
  &:hover:not(:disabled) {
    background-color: #7c3aed;
  }
  
  &:disabled {
    background-color: #d1d5db;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProgressSection = styled.div`
  padding: 0 1.5rem 1rem;
`;

const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const ProgressBar = styled.div`
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 100%;
  background-color: #e5e7eb;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #8b5cf6;
  border-radius: 9999px;
  transition: width 0.1s ease;
`;

const ControlButtons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem 1rem;
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  color: #8b5cf6;
  border: 1px solid #c4b5fd;
  background-color: white;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover:not(:disabled) {
    background-color: #f3f4f6;
  }
  
  &:disabled {
    color: #9ca3af;
    border-color: #e5e7eb;
    cursor: not-allowed;
  }
`;

const PlayCountDisplay = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
  gap: 0.25rem;
`;

const PlayCountBadge = styled.span`
  background-color: #ede9fe;
  color: #7c3aed;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
`;

const HintText = styled.div`
  text-align: center;
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  font-size: 0.875rem;
  color: #6b7280;
  
  p {
    margin: 0;
    
    &:first-child {
      margin-bottom: 0.25rem;
    }
  }
`;

export default AudioPlayer; 