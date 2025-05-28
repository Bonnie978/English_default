import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  _id: string;
  username: string;
  email: string;
  learningStats: {
    totalWordsLearned: number;
    correctRate: number;
    streakDays: number;
    totalExercises: number;
  };
  settings: {
    dailyWordCount: number;
    preferredExerciseTypes: string[];
    notifications: boolean;
    soundEnabled: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化时检查本地存储中的token
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // 获取当前用户信息
          const response = await api.get('/api/auth/me');
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            throw new Error(response.data.message || '获取用户信息失败');
          }
        } catch (error: any) {
          console.error('获取用户信息失败:', error);
          localStorage.removeItem('token');
          setUser(null);
          throw error;
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // 登录方法
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        
        // 获取用户信息
        const userResponse = await api.get('/api/auth/me');
        if (userResponse.data.success) {
          setUser(userResponse.data.user);
        }
      } else {
        throw new Error(response.data.message || '登录失败');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '登录失败，请重试';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 注册方法
  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/auth/register', { username, email, password });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        
        // 获取用户信息
        const userResponse = await api.get('/api/auth/me');
        if (userResponse.data.success) {
          setUser(userResponse.data.user);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 登出方法
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 