import { supabase } from '../config/supabase';

/**
 * 认证工具函数
 */
export const authUtils = {
  /**
   * 检查当前认证状态
   */
  async checkAuthStatus() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('检查认证状态失败:', error);
        return { isAuthenticated: false, user: null, error };
      }
      
      const isAuthenticated = !!session?.user;
      console.log('认证状态检查:', {
        isAuthenticated,
        user: session?.user?.email,
        sessionExpiry: session?.expires_at,
        timestamp: new Date().toISOString()
      });
      
      return { 
        isAuthenticated, 
        user: session?.user || null, 
        session,
        error: null 
      };
    } catch (error) {
      console.error('认证状态检查异常:', error);
      return { isAuthenticated: false, user: null, error };
    }
  },

  /**
   * 清理认证状态
   */
  async clearAuthState() {
    try {
      // 清理Supabase session
      await supabase.auth.signOut();
      
      // 清理传统token
      localStorage.removeItem('token');
      
      console.log('认证状态已清理');
    } catch (error) {
      console.error('清理认证状态失败:', error);
    }
  },

  /**
   * 获取当前token
   */
  async getCurrentToken() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('获取token失败:', error);
      return null;
    }
  }
}; 