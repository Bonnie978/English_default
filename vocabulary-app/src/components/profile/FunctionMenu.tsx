import React from 'react';
import styled from 'styled-components';

interface FunctionMenuProps {
  onLearningReport: () => void;
  onWordLibrary: () => void;
  onLearningReminder: () => void;
  onHelpFeedback: () => void;
}

const FunctionMenu: React.FC<FunctionMenuProps> = ({
  onLearningReport,
  onWordLibrary,
  onLearningReminder,
  onHelpFeedback
}) => {
  const menuItems = [
    {
      id: 'report',
      title: '学习报告',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      onClick: onLearningReport
    },
    {
      id: 'library',
      title: '词库管理',
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      onClick: onWordLibrary
    },
    {
      id: 'reminder',
      title: '学习提醒',
      color: '#10b981',
      bgColor: '#d1fae5',
      onClick: onLearningReminder
    },
    {
      id: 'help',
      title: '帮助与反馈',
      color: '#ef4444',
      bgColor: '#fee2e2',
      onClick: onHelpFeedback
    }
  ];

  return (
    <Container>
      {menuItems.map(item => (
        <MenuItem key={item.id} onClick={item.onClick}>
          <MenuIcon style={{ backgroundColor: item.bgColor, color: item.color }}>
            📊
          </MenuIcon>
          <MenuTitle>{item.title}</MenuTitle>
        </MenuItem>
      ))}
    </Container>
  );
};

const Container = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background-color: #e5e7eb;
`;

const MenuItem = styled.button`
  background-color: white;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #f9fafb;
  }
`;

const MenuIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
`;

const MenuTitle = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
`;

export default FunctionMenu;
