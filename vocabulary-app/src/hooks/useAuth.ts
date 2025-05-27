import { useState, useEffect } from 'react'
import { authService } from '../services/authService'
import type { AuthUser } from '../config/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 获取当前用户
    const getCurrentUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        console.error('获取用户信息失败:', err)
      } finally {
        setLoading(false)
      }
    }

    getCurrentUser()

    // 监听认证状态变化
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { user, error } = await authService.signIn({ email, password })
      
      if (error) {
        setError(error)
        setLoading(false)
        return { success: false, error }
      }
      
      // 不手动设置用户状态，让 onAuthStateChange 监听器处理
      // 也不在这里设置 loading 为 false，让监听器处理
      return { success: true, user }
    } catch (err) {
      const errorMessage = '登录失败，请稍后重试'
      setError(errorMessage)
      setLoading(false)
      return { success: false, error: errorMessage }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { user, error } = await authService.signUp({ email, password, fullName })
      
      if (error) {
        setError(error)
        return { success: false, error }
      }
      
      return { success: true, user }
    } catch (err) {
      const errorMessage = '注册失败，请稍后重试'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    
    try {
      const { error } = await authService.signOut()
      
      if (error) {
        setError(error)
        setLoading(false)
        return { success: false, error }
      }
      
      // 不手动设置用户状态，让 onAuthStateChange 监听器处理
      return { success: true }
    } catch (err) {
      const errorMessage = '登出失败，请稍后重试'
      setError(errorMessage)
      setLoading(false)
      return { success: false, error: errorMessage }
    }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await authService.resetPassword(email)
      
      if (error) {
        setError(error)
        return { success: false, error }
      }
      
      return { success: true }
    } catch (err) {
      const errorMessage = '发送重置邮件失败'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
    // 方法别名，兼容现有代码
    login: signIn,
    register: signUp,
    logout: signOut
  }
} 