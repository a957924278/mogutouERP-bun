import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface User {
  id: string;
  name: string;
  tel: string;
  role: 'admin' | 'user';
}

interface LoginForm {
  tel: string;
  password: string;
}

interface RegisterForm {
  name: string;
  tel: string;
  password: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(null);

  // 设置token
  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  };

  // 清除token
  const clearToken = () => {
    token.value = null;
    localStorage.removeItem('token');
    user.value = null;
  };

  // 设置用户信息
  const setUser = (userInfo: User) => {
    user.value = userInfo;
  };

  // 检查是否已登录
  const isAuthenticated = computed(() => !!token.value);

  // 检查是否是管理员
  const isAdmin = computed(() => user.value?.role === 'admin');

  return {
    token,
    user,
    setToken,
    clearToken,
    setUser,
    isAuthenticated,
    isAdmin,
  };
}, {
  persist: {
    key: 'auth-store',
    paths: ['token', 'user'],
  },
});

export type { User, LoginForm, RegisterForm }; 