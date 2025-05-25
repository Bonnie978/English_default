import React from 'react';
import styled from 'styled-components';

interface SettingsSectionProps {
  settings: {
    dailyWordCount: number;
    notifications: boolean;
    soundEnabled: boolean;
  };
  onSettingChange: (key: string, value: any) => void;
  onSaveSettings: () => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  settings,
  onSettingChange,
  onSaveSettings
}) => {
  const handleDailyWordCountChange = (delta: number) => {
    const newCount = Math.max(5, Math.min(20, settings.dailyWordCount + delta));
    onSettingChange('dailyWordCount', newCount);
  };

  return (
    <Container>
      <Header>
        <Title>学习设置</Title>
      </Header>
      
      <SettingsList>
        <SettingItem>
          <SettingMain>
            <SettingTitle>每日学习单词数量</SettingTitle>
            <SettingDescription>设置每天需要学习的新单词数量</SettingDescription>
          </SettingMain>
          <CounterControl>
            <CounterButton onClick={() => handleDailyWordCountChange(-1)}>
              -
            </CounterButton>
            <CounterValue>{settings.dailyWordCount}</CounterValue>
            <CounterButton onClick={() => handleDailyWordCountChange(1)}>
              +
            </CounterButton>
          </CounterControl>
        </SettingItem>
        
        <SettingItem>
          <SettingMain>
            <SettingTitle>学习提醒</SettingTitle>
            <SettingDescription>每天固定时间提醒你进行单词学习</SettingDescription>
          </SettingMain>
          <ToggleSwitch
            $active={settings.notifications}
            onClick={() => onSettingChange('notifications', !settings.notifications)}
          >
            <ToggleThumb $active={settings.notifications} />
          </ToggleSwitch>
        </SettingItem>
        
        <SettingItem>
          <SettingMain>
            <SettingTitle>发音功能</SettingTitle>
            <SettingDescription>学习单词时自动播放发音</SettingDescription>
          </SettingMain>
          <ToggleSwitch
            $active={settings.soundEnabled}
            onClick={() => onSettingChange('soundEnabled', !settings.soundEnabled)}
          >
            <ToggleThumb $active={settings.soundEnabled} />
          </ToggleSwitch>
        </SettingItem>
        
        <SettingItem>
          <SettingMain>
            <SettingTitle>导入单词列表</SettingTitle>
            <SettingDescription>上传自定义单词表，进行个性化学习</SettingDescription>
          </SettingMain>
          <FileButton>选择文件</FileButton>
        </SettingItem>
        
        <SettingItem>
          <SettingMain>
            <SettingTitle>清除缓存数据</SettingTitle>
            <SettingDescription>清除本地存储的临时数据，不影响云端数据</SettingDescription>
          </SettingMain>
          <ActionButton>清除</ActionButton>
        </SettingItem>
        
        <SaveButtonContainer>
          <SaveButton onClick={onSaveSettings}>保存设置</SaveButton>
        </SaveButtonContainer>
      </SettingsList>
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const Title = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
`;

const SettingsList = styled.div`
  padding: 0;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingMain = styled.div`
  flex: 1;
`;

const SettingTitle = styled.h4`
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
  margin: 0 0 0.25rem 0;
`;

const SettingDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const CounterControl = styled.div`
  display: flex;
  align-items: center;
`;

const CounterButton = styled.button`
  background-color: #f3f4f6;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  font-weight: bold;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

const CounterValue = styled.span`
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin: 0 0.75rem;
  min-width: 2rem;
  text-align: center;
`;

const ToggleSwitch = styled.button<{ $active: boolean }>`
  position: relative;
  width: 2.75rem;
  height: 1.5rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.$active ? '#3b82f6' : '#e5e7eb'};
  transition: background-color 0.2s ease;
`;

const ToggleThumb = styled.span<{ $active: boolean }>`
  position: absolute;
  top: 0.125rem;
  left: ${props => props.$active ? '1.375rem' : '0.125rem'};
  width: 1.25rem;
  height: 1.25rem;
  background-color: white;
  border-radius: 50%;
  transition: left 0.2s ease;
`;

const FileButton = styled.button`
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #f9fafb;
  }
`;

const ActionButton = styled.button`
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #f9fafb;
  }
`;

const SaveButtonContainer = styled.div`
  padding: 1rem 1.5rem;
`;

const SaveButton = styled.button`
  width: 100%;
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #2563eb;
  }
`;

export default SettingsSection;
