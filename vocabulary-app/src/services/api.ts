import axios from 'axios';
import { supabase } from '../config/supabase';

// 根据环境设置API地址
const getApiBaseUrl = () => {
  console.log('🔍 API Base URL Debug:', {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    NODE_ENV: process.env.NODE_ENV,
    hasApiUrl: !!process.env.REACT_APP_API_URL
  });
  
  // 开发环境
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Using development URL: http://localhost:3001');
    return 'http://localhost:3001';
  }
  
  // 生产环境 - 强制使用相对路径代理，忽略环境变量
  // 这样可以避免CORS问题，通过Vercel代理到后端
  console.log('🔧 FORCE using production proxy: empty string (ignoring env vars)');
  return '';
};

const finalBaseUrl = getApiBaseUrl();
console.log('🎯 Final API Base URL:', finalBaseUrl);

const api = axios.create({
  baseURL: finalBaseUrl,
  timeout: 25000, // 25秒超时 - 匹配后端DeepSeek API处理时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器添加token
api.interceptors.request.use(
  async (config) => {
    console.log('🌐 API Request:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      timestamp: new Date().toISOString()
    });
    
    try {
      // 优先从Supabase获取token
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        console.log('🔑 API: Using Supabase token', {
          tokenLength: session.access_token.length,
          userEmail: session.user?.email
        });
      } else {
        // 如果没有Supabase token，尝试localStorage（向后兼容）
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 API: Using localStorage token');
        } else {
          console.log('⚠️ API: No token available');
        }
      }
    } catch (error) {
      console.warn('❌ API: Failed to get auth token:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器处理错误
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      dataSize: JSON.stringify(response.data).length,
      timestamp: new Date().toISOString()
    });
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
    
    // 处理401未授权错误，但不强制跳转
    if (error.response && error.response.status === 401) {
      console.warn('🚫 API: 401 Unauthorized - token may be invalid or expired');
      // 清除可能过期的token
      localStorage.removeItem('token');
      // 不强制跳转，让路由保护组件处理认证状态
    }
    return Promise.reject(error);
  }
);

export default api; 