import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  matchPaths?: string[]; // 添加可选的路径匹配数组
}

const BottomNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 导航项配置
  const navItems: NavItem[] = [
    {
      path: '/',
      label: '首页',
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      )
    },
    {
      path: '/wordlist',
      label: '单词',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      path: '/exam',
      label: '练习',
      // 匹配所有练习相关路径，包括错题页面
      matchPaths: ['/exam', '/wrong'],
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      path: '/profile',
      label: '我的',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  // 判断导航项是否活跃
  const isItemActive = (item: NavItem, currentPath: string) => {
    if (item.matchPaths) {
      return item.matchPaths.some(path => currentPath.startsWith(path));
    }
    return currentPath === item.path;
  };
  
  return (
    <NavContainer>
      <div className="max-w-7xl mx-auto px-4">
        <NavItems>
          {navItems.map((item) => (
            <NavButton
              key={item.path}
              $active={isItemActive(item, location.pathname)}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <NavLabel>{item.label}</NavLabel>
            </NavButton>
          ))}
        </NavItems>
      </div>
    </NavContainer>
  );
};

// 样式组件
const NavContainer = styled.footer`
  background-color: white;
  border-top: 1px solid #e5e7eb;
`;

const NavItems = styled.nav`
  display: flex;
  justify-content: space-around;
  padding: 0.75rem 0;
`;

const NavButton = styled.button<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  color: ${props => props.$active ? '#3b82f6' : '#6b7280'};
  
  &:hover {
    color: ${props => props.$active ? '#3b82f6' : '#4b5563'};
  }
`;

const NavLabel = styled.span`
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

export default BottomNavbar; 