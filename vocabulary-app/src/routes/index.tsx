import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// 页面导入
import HomePage from '../pages/HomePage';
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

// 需要认证的路由
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user, loading } = useAuth();
  
  // 添加日志，观察 PrivateRoute 渲染时的状态
  console.log('PrivateRoute rendering:', { loading, user: !!user }); // 只打印 user 是否存在，避免打印敏感信息

  if (loading) {
    console.log('PrivateRoute: Showing loading state'); // 添加日志
    return <div>加载中...</div>;
  }
  
  if (!user) {
    console.log('PrivateRoute: User not found, navigating to /login'); // 添加日志
    return <Navigate to="/login" />;
  }
  
  console.log('PrivateRoute: User found, rendering element'); // 添加日志
  return element; 
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* 公共路由 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
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