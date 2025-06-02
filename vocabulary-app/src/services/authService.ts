import { supabase } from '../config/supabase'
import type { AuthUser } from '../config/supabase'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

export interface SignUpData {
  email: string
  password: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResponse {
  user: AuthUser | null
  error: string | null
}

class AuthService {
  // 注册新用户
  async signUp({ email, password, fullName }: SignUpData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) {
        return { user: null, error: error.message }
      }

      return { user: data.user as AuthUser, error: null }
    } catch (error) {
      return { user: null, error: '注册失败，请稍后重试' }
    }
  }

  // 用户登录
  async signIn({ email, password }: SignInData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { user: null, error: error.message }
      }

      return { user: data.user as AuthUser, error: null }
    } catch (error) {
      return { user: null, error: '登录失败，请稍后重试' }
    }
  }

  // 用户登出
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: '登出失败，请稍后重试' }
    }
  }

  // 获取当前用户
  async getCurrentUser(): Promise<AuthUser | null> {
    console.log('🔍 AuthService: getCurrentUser called');
    try {
      // 添加超时处理
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('获取用户信息超时')), 8000)
      );
      
      const { data: { user }, error } = await Promise.race([
        supabase.auth.getUser(),
        timeout
      ]) as any;
      
      console.log('📋 AuthService: getUser result:', {
        hasUser: !!user,
        userEmail: user?.email,
        userId: user?.id,
        hasError: !!error,
        error: error?.message
      });
      return user as AuthUser;
    } catch (error) {
      console.error('❌ AuthService: 获取用户信息失败:', {
        message: (error as Error).message,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }

  // 重置密码
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: '重置密码失败，请稍后重试' }
    }
  }

  // 更新密码
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: '更新密码失败，请稍后重试' }
    }
  }

  // 监听认证状态变化
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    console.log('👂 AuthService: Setting up onAuthStateChange listener');
    return supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log('🔔 AuthService: Auth state change event:', {
        event,
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });
      callback(session?.user as AuthUser || null);
    });
  }

  // 获取当前会话
  async getSession() {
    console.log('🔍 AuthService: getSession called');
    try {
      // 添加超时处理
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('获取会话信息超时')), 8000)
      );
      
      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        timeout
      ]) as any;
      
      console.log('📋 AuthService: getSession result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        hasError: !!error,
        error: error?.message
      });
      return session;
    } catch (error) {
      console.error('❌ AuthService: 获取会话信息失败:', {
        message: (error as Error).message,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }
}

export const authService = new AuthService() 