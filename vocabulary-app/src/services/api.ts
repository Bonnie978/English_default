import axios from 'axios';
import { supabase } from '../config/supabase';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // 后端API地址
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器添加token
api.interceptors.request.use(
  async (config) => {
    try {
      // 优先从Supabase获取token
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        console.log('API: Using Supabase token');
      } else {
        // 如果没有Supabase token，尝试localStorage（向后兼容）
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('API: Using localStorage token');
        } else {
          console.log('API: No token available');
        }
      }
    } catch (error) {
      console.warn('API: Failed to get auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 处理401未授权错误，但不强制跳转
    if (error.response && error.response.status === 401) {
      console.warn('API: 401 Unauthorized - token may be invalid or expired');
      // 清除可能过期的token
      localStorage.removeItem('token');
      // 不强制跳转，让路由保护组件处理认证状态
    }
    return Promise.reject(error);
  }
);

export default api; 