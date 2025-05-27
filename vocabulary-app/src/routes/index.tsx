import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

// 页面导入
import HomePage from '../pages/HomePage';
import SimpleHomePage from '../pages/SimpleHomePage';
import WordlistPage from '../pages/WordlistPage';
import ExamPage from '../pages/ExamPage';
import ReadPage from '../pages/exercise/ReadPage';
import ListenPage from '../pages/ListenPage';
import WritePage from '../pages/WritePage';
import ResultPage from '../pages/ResultPage';
import WrongPage from '../pages/WrongPage';
import ProfilePage from '../pages/ProfilePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DebugPage from '../pages/DebugPage';
import AuthDebugPage from '../pages/AuthDebugPage';

// 需要认证的路由
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user, loading } = useSupabaseAuth();
  
  console.log('PrivateRoute rendering:', { 
    loading, 
    user: !!user, 
    userEmail: user?.email,
    timestamp: new Date().toISOString()
  });

  // 如果正在加载，显示加载状态
  if (loading) {
    console.log('PrivateRoute: Loading state');
    return React.createElement('div', { 
      style: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#6b7280'
      } 
    }, '加载中...');
  }
  
  // 如果没有用户，重定向到登录页
  if (!user) {
    console.log('PrivateRoute: No user, redirecting to login');
    return React.createElement(Navigate, { to: '/login', replace: true });
  }
  
  // 有用户，渲染目标组件
  console.log('PrivateRoute: User found, rendering element');
  return element; 
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* 公共路由 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth-debug" element={<AuthDebugPage />} />
        
        {/* 受保护的路由 */}
        <Route path="/" element={<PrivateRoute element={<HomePage />} />} />
        <Route path="/wordlist" element={<PrivateRoute element={<WordlistPage />} />} />
        <Route path="/exam" element={<PrivateRoute element={<ExamPage />} />} />
        <Route path="/exam/read" element={<PrivateRoute element={<ReadPage />} />} />
        <Route path="/exam/listen" element={<PrivateRoute element={<ListenPage />} />} />
        <Route path="/exam/write" element={<PrivateRoute element={<WritePage />} />} />
        <Route path="/result" element={<PrivateRoute element={<ResultPage />} />} />
        <Route path="/wrong" element={<PrivateRoute element={<WrongPage />} />} />
        <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
        <Route path="/debug" element={<PrivateRoute element={<DebugPage />} />} />
        
        {/* 默认路由 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter; 