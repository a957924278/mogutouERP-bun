import type { LoginForm, RegisterForm, User } from '@/store/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// 请求拦截器
const request = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || error.message || '请求失败');
  }
  
  return response.json();
};

// 用户登录
export const login = async (loginForm: LoginForm) => {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(loginForm),
  });
};

// 用户注册
export const register = async (registerForm: RegisterForm) => {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registerForm),
  });
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<User> => {
  return request('/auth/me');
};

// 更新密码
export const updatePassword = async (oldPassword: string, newPassword: string) => {
  return request('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
};

// 删除用户 (管理员)
export const deleteUser = async (userId: string) => {
  return request(`/auth/users/${userId}`, {
    method: 'DELETE',
  });
}; 