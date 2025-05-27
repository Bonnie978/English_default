import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { AuthUser } from '../config/supabase';

interface SupabaseAuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string; user?: AuthUser | null }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  // 方法别名
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser | null }>;
  register: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string; user?: AuthUser | null }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 获取当前用户
    const getCurrentUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('获取用户信息失败:', err);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();

    // 监听认证状态变化
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      console.log('SupabaseAuthContext: Auth state changed:', !!user);
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user, error } = await authService.signIn({ email, password });
      
      if (error) {
        setError(error);
        setLoading(false);
        return { success: false, error };
      }
      
      // 登录成功后，手动设置用户状态以确保及时更新
      if (user) {
        console.log('SupabaseAuthContext: Login successful, updating user state');
        setUser(user);
        setLoading(false);
      }
      
      return { success: true, user };
    } catch (err) {
      const errorMessage = '登录失败，请稍后重试';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user, error } = await authService.signUp({ email, password, fullName });
      
      if (error) {
        setError(error);
        setLoading(false);
        return { success: false, error };
      }
      
      return { success: true, user };
    } catch (err) {
      const errorMessage = '注册失败，请稍后重试';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      const { error } = await authService.signOut();
      
      if (error) {
        setError(error);
        setLoading(false);
        return { success: false, error };
      }
      
      // 不手动设置用户状态，让 onAuthStateChange 监听器处理
      return { success: true };
    } catch (err) {
      const errorMessage = '登出失败，请稍后重试';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await authService.resetPassword(email);
      
      if (error) {
        setError(error);
        setLoading(false);
        return { success: false, error };
      }
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = '发送重置邮件失败';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
    // 方法别名
    login: signIn,
    register: signUp,
    logout: signOut,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}; 