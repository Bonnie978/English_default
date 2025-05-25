import React from 'react';
import styled from 'styled-components';

interface UserInfoCardProps {
  user: {
    username: string;
    level: number;
    joinDate: string;
    consecutiveDays: number;
  };
  onEditProfile: () => void;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user, onEditProfile }) => {
  return (
    <Container>
      <UserInfo>
        <Avatar>
          {user.username.charAt(0).toUpperCase()}
        </Avatar>
        <UserDetails>
          <Username>{user.username}</Username>
          <LevelBadge>Lv.{user.level}</LevelBadge>
          <UserStats>
            <StatItem>加入 {user.joinDate}</StatItem>
            <StatItem>连续学习 {user.consecutiveDays} 天</StatItem>
          </UserStats>
        </UserDetails>
      </UserInfo>
      <EditButton onClick={onEditProfile}>
        编辑资料
      </EditButton>
    </Container>
  );
};

const Container = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 1rem;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const Username = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
`;

const LevelBadge = styled.span`
  background-color: #fef3c7;
  color: #d97706;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
  margin-bottom: 0.5rem;
`;

const UserStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const StatItem = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const EditButton = styled.button`
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #f9fafb;
  }
`;

export default UserInfoCard;
