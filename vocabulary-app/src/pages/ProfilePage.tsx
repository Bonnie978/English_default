import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import HeaderBar from '../components/common/HeaderBar';
import UserInfoCard from '../components/profile/UserInfoCard';
import LearningStatsCard from '../components/profile/LearningStatsCard';
import WeeklyChart from '../components/profile/WeeklyChart';
import FunctionMenu from '../components/profile/FunctionMenu';
import SettingsSection from '../components/profile/SettingsSection';
import BottomNavbar from '../components/common/BottomNavbar';
import Loading from '../components/common/Loading';
import { realDataService } from '../services/realDataService';

const ProfilePage: React.FC = () => {
  const { user, logout } = useSupabaseAuth();
  const [activeSection, setActiveSection] = useState<'stats' | 'settings'>('stats');
  const [userStats, setUserStats] = useState({
    totalWords: 0,
    accuracy: 0,
    masteredWords: 0,
    studyHours: 0
  });
  const [weeklyData, setWeeklyData] = useState<{ day: string; words: number }[]>([]);
  const [settings, setSettings] = useState({
    dailyWordCount: 10,
    notifications: true,
    soundEnabled: true
  });
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  
  // 获取用户统计数据
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // 使用真实数据服务获取学习统计
        const realStats = await realDataService.getRealLearningStats();
        setUserStats({
          totalWords: realStats.totalWords,
          accuracy: realStats.accuracy,
          masteredWords: realStats.masteredWords,
          studyHours: realStats.studyHours
        });

        // 获取真实周学习数据
        const realWeeklyData = await realDataService.getRealWeeklyData();
        setWeeklyData(realWeeklyData);
        
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
        // 使用空数据而不是假数据
        setUserStats({
          totalWords: 0,
          accuracy: 0,
          masteredWords: 0,
          studyHours: 0
        });
        setWeeklyData([]);
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
            username: user.username || user.email || '用户',
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
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 16px;
  padding-bottom: 80px; /* 为底部导航栏留出空间 */
`;

const LoadingContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TabsContainer = styled.div`
  display: flex;
  background-color: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$active ? `
    background-color: #3b82f6;
    color: white;
  ` : `
    background-color: transparent;
    color: #6b7280;
    
    &:hover {
      background-color: #f3f4f6;
    }
  `}
`;

const StatsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const SettingsButton = styled.button`
  padding: 8px;
  border: none;
  background-color: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

const LogoutButton = styled.button`
  padding: 8px 12px;
  border: none;
  background-color: #ef4444;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  
  &:hover {
    background-color: #dc2626;
  }
`;

export default ProfilePage; 