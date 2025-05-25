import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // 后端API地址
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 