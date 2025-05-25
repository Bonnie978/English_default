import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import HeaderBar from '../components/common/HeaderBar';
import UserInfoCard from '../components/profile/UserInfoCard';
import LearningStatsCard from '../components/profile/LearningStatsCard';
import WeeklyChart from '../components/profile/WeeklyChart';
import FunctionMenu from '../components/profile/FunctionMenu';
import SettingsSection from '../components/profile/SettingsSection';
import BottomNavbar from '../components/common/BottomNavbar';
import Loading from '../components/common/Loading';
import api from '../services/api';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<'stats' | 'settings'>('stats');
  const [userStats, setUserStats] = useState({
    totalWords: 480,
    accuracy: 85,
    masteredWords: 372,
    studyHours: 128
  });
  const [weeklyData, setWeeklyData] = useState([
    { day: '周一', words: 25 },
    { day: '周二', words: 40 },
    { day: '周三', words: 30 },
    { day: '周四', words: 50 },
    { day: '周五', words: 40 },
    { day: '周六', words: 20 },
    { day: '周日', words: 35 },
  ]);
  const [settings, setSettings] = useState({
    dailyWordCount: 10,
    notifications: true,
    soundEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  // 获取用户统计数据
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 获取学习统计
        const statsResponse = await api.get('/words/stats');
        if (statsResponse.data.success) {
          setUserStats({
            totalWords: statsResponse.data.stats.totalWords || 480,
            accuracy: statsResponse.data.stats.accuracy || 85,
            masteredWords: statsResponse.data.stats.masteredWords || 372,
            studyHours: statsResponse.data.stats.studyHours || 128
          });
        }
        
        // 如果有用户设置，更新设置状态
        if (user?.settings) {
          setSettings({
            dailyWordCount: user.settings.dailyWordCount || 10,
            notifications: user.settings.notifications ?? true,
            soundEnabled: user.settings.soundEnabled ?? true
          });
        }
      } catch (err: any) {
        console.error('获取用户数据失败:', err);
        setError('获取用户数据失败');
        // 使用默认数据
        setUserStats({
          totalWords: 480,
          accuracy: 85,
          masteredWords: 372,
          studyHours: 128
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchUserData();
    }
  }, [user]);
  
  // 处理设置更改
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // 保存设置
  const handleSaveSettings = async () => {
    try {
      // 在实际应用中，这里应该调用API保存设置
      // await api.put('/users/settings', settings);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('设置已保存'); // 在实际应用中应该使用更优雅的提示方式
    } catch (error) {
      console.error('保存设置失败:', error);
      alert('保存设置失败，请重试');
    }
  };
  
  // 处理各种功能点击
  const handleLearningReport = () => {
    alert('学习报告功能将在后续版本中实现');
  };
  
  const handleWordLibrary = () => {
    alert('词库管理功能将在后续版本中实现');
  };
  
  const handleLearningReminder = () => {
    alert('学习提醒设置功能将在后续版本中实现');
  };
  
  const handleHelpFeedback = () => {
    alert('帮助与反馈功能将在后续版本中实现');
  };
  
  const handleEditProfile = () => {
    alert('编辑资料功能将在后续版本中实现');
  };
  
  // 处理登出
  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      logout();
      navigate('/login');
    }
  };
  
  // 渲染右侧内容
  const renderRightContent = () => (
    <ActionButtons>
      <SettingsButton onClick={() => alert('设置功能')}>
        ⚙️
      </SettingsButton>
      <LogoutButton onClick={handleLogout}>
        退出
      </LogoutButton>
    </ActionButtons>
  );
  
  // 加载状态
  if (loading) {
    return (
      <Container>
        <HeaderBar title="我的" rightContent={renderRightContent()} />
        <LoadingContainer>
          <Loading size="large" />
        </LoadingContainer>
        <BottomNavbar />
      </Container>
    );
  }
  
  // 如果没有用户信息，跳转到登录页
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <Container>
      <HeaderBar title="我的" rightContent={renderRightContent()} />
      
      <MainContent>
        {/* 用户信息卡片 */}
        <UserInfoCard 
          user={{
            username: user.username,
            level: 8, // 这里可以根据学习数据计算等级
            joinDate: '2024年1月', // 使用默认值，实际应该从后端获取
            consecutiveDays: userStats.totalWords > 0 ? 32 : 0 // 这里应该从后端获取
          }}
          onEditProfile={handleEditProfile}
        />
        
        {/* 切换标签 */}
        <TabsContainer>
          <TabButton
            $active={activeSection === 'stats'}
            onClick={() => setActiveSection('stats')}
          >
            学习数据
          </TabButton>
          <TabButton
            $active={activeSection === 'settings'}
            onClick={() => setActiveSection('settings')}
          >
            学习设置
          </TabButton>
        </TabsContainer>
        
        {/* 学习数据部分 */}
        {activeSection === 'stats' && (
          <StatsSection>
            {/* 学习统计卡片 */}
            <LearningStatsCard stats={userStats} />
            
            {/* 周学习记录 */}
            <WeeklyChart weeklyData={weeklyData} />
            
            {/* 功能卡片 */}
            <FunctionMenu
              onLearningReport={handleLearningReport}
              onWordLibrary={handleWordLibrary}
              onLearningReminder={handleLearningReminder}
              onHelpFeedback={handleHelpFeedback}
            />
          </StatsSection>
        )}
        
        {/* 设置部分 */}
        {activeSection === 'settings' && (
          <SettingsSection
            settings={settings}
            onSettingChange={handleSettingChange}
            onSaveSettings={handleSaveSettings}
          />
        )}
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

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SettingsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background-color: #f3f4f6;
  color: #6b7280;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

const LogoutButton = styled.button`
  background-color: #ef4444;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #dc2626;
  }
`;

const TabsContainer = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border: 1px solid #e5e7eb;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem;
  text-align: center;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background-color: ${props => props.$active ? '#3b82f6' : 'white'};
  color: ${props => props.$active ? 'white' : '#374151'};
  border-right: 1px solid #e5e7eb;
  
  &:last-child {
    border-right: none;
  }
  
  &:hover {
    background-color: ${props => props.$active ? '#3b82f6' : '#f9fafb'};
  }
`;

const StatsSection = styled.div``;

export default ProfilePage; 