import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { useLearning } from '../../hooks/useLearning';
import { supabase } from '../../config/supabase';
import api from '../../services/api';

const UserStatusDebug: React.FC = () => {
  const { user, isAuthenticated } = useSupabaseAuth();
  const { progress, dailyWords, masteredWordIds, syncProgress } = useLearning();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [progressApiData, setProgressApiData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSessionInfo = async () => {
      try {
        // 检查 Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        setSessionInfo(session);

        // 检查进度API响应
        if (session?.user?.id) {
          const response = await api.get('/api/words-daily');
          setProgressApiData(response.data);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('调试检查失败:', err);
      }
    };

    checkSessionInfo();
  }, [user]);

  const handleSyncProgress = async () => {
    try {
      await syncProgress();
      alert('进度同步成功！');
    } catch (error) {
      alert('进度同步失败：' + error);
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // 生产环境不显示调试信息
  }

  return (
    <DebugContainer>
      <DebugTitle>🔍 用户状态调试</DebugTitle>
      
      <DebugSection>
        <SectionTitle>认证状态</SectionTitle>
        <DebugItem>
          <label>isAuthenticated:</label>
          <span>{isAuthenticated ? '✅ 已认证' : '❌ 未认证'}</span>
        </DebugItem>
        <DebugItem>
          <label>用户ID:</label>
          <span>{user?.id || '❌ 无'}</span>
        </DebugItem>
        <DebugItem>
          <label>用户邮箱:</label>
          <span>{user?.email || '❌ 无'}</span>
        </DebugItem>
        <DebugItem>
          <label>Supabase Session:</label>
          <span>{sessionInfo ? '✅ 存在' : '❌ 无'}</span>
        </DebugItem>
      </DebugSection>

      <DebugSection>
        <SectionTitle>学习进度状态</SectionTitle>
        <DebugItem>
          <label>当前进度:</label>
          <span>{progress.learned}/{progress.total}</span>
        </DebugItem>
        <DebugItem>
          <label>今日单词数:</label>
          <span>{dailyWords.length}</span>
        </DebugItem>
        <DebugItem>
          <label>已掌握单词:</label>
          <span>{masteredWordIds.length}</span>
        </DebugItem>
        <DebugItem>
          <label>API数据状态:</label>
          <span>{progressApiData ? '✅ 获取成功' : '❌ 未获取'}</span>
        </DebugItem>
        <SyncButton onClick={handleSyncProgress}>
          🔄 手动同步进度
        </SyncButton>
      </DebugSection>

      {progressApiData && (
        <DebugSection>
          <SectionTitle>API响应数据</SectionTitle>
          <DebugItem>
            <label>API Success:</label>
            <span>{progressApiData.success ? '✅' : '❌'}</span>
          </DebugItem>
          <DebugItem>
            <label>Stats:</label>
            <pre>{JSON.stringify(progressApiData.stats, null, 2)}</pre>
          </DebugItem>
          <DebugItem>
            <label>数据长度:</label>
            <span>{progressApiData.data?.length || 0}</span>
          </DebugItem>
        </DebugSection>
      )}

      {error && (
        <DebugSection>
          <SectionTitle>错误信息</SectionTitle>
          <ErrorText>{error}</ErrorText>
        </DebugSection>
      )}
    </DebugContainer>
  );
};

const DebugContainer = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  width: 300px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 9999;
  max-height: 80vh;
  overflow-y: auto;
`;

const DebugTitle = styled.h4`
  margin: 0 0 12px 0;
  color: #00ff00;
`;

const DebugSection = styled.div`
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #333;
`;

const SectionTitle = styled.h5`
  margin: 0 0 8px 0;
  color: #ffff00;
`;

const DebugItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  
  label {
    color: #ccc;
    margin-right: 8px;
  }
  
  span {
    color: white;
    font-weight: bold;
    max-width: 150px;
    word-break: break-all;
  }

  pre {
    color: white;
    font-weight: bold;
    max-width: 150px;
    word-break: break-all;
    font-size: 10px;
    background: rgba(255,255,255,0.1);
    padding: 4px;
    border-radius: 2px;
  }
`;

const ErrorText = styled.div`
  color: #ff4444;
  background: rgba(255, 68, 68, 0.2);
  padding: 8px;
  border-radius: 4px;
`;

const SyncButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 8px;

  &:hover {
    background: #0056b3;
  }
`;

export default UserStatusDebug; 