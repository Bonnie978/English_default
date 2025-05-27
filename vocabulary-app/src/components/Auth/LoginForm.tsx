import React, { useState, FormEvent } from 'react'
import { authService } from '../../services/authService'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { user, error } = await authService.signIn({ email, password })
      
      if (error) {
        setError(error)
      } else if (user) {
        console.log('登录成功:', user)
        onSuccess?.()
      }
    } catch (err) {
      setError('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('请先输入邮箱地址')
      return
    }

    setLoading(true)
    try {
      const { error } = await authService.resetPassword(email)
      if (error) {
        setError(error)
      } else {
        alert('密码重置邮件已发送，请检查您的邮箱')
      }
    } catch (err) {
      setError('发送重置邮件失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-form">
      <h2>登录</h2>
      
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">邮箱</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">密码</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '1rem'
          }}
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>

      <div className="form-actions">
        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={loading}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            textDecoration: 'underline',
            marginRight: '1rem'
          }}
        >
          忘记密码？
        </button>

        {onSwitchToRegister && (
          <button
            type="button"
            onClick={onSwitchToRegister}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            还没有账号？注册
          </button>
        )}
      </div>
    </div>
  )
} 