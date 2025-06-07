import { useState, useEffect } from 'react';
import { message } from 'antd';
import { setOnline, setOffline, getUser } from '../api/user';

const useAuthStore = () => {
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      loadUser();
      handleOnlineStatus(true);
    }
  }, [token]);

  const handleOnlineStatus = async (isOnline) => {
    if (!token) return;
    
    try {
      isOnline ? await setOnline(token) : await setOffline(token);
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
    }
  };

  const loadUser = async () => {
    setLoading(true);
    try {
      const userData = await getUser(token);
      setUser(userData);
    } catch (error) {
      console.error('Ошибка загрузки пользователя:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
  };

  const logout = async () => {
    await handleOnlineStatus(false);
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    message.success('Вы успешно вышли');
  };

  return { 
    token,
    user,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
    setToken
  };
};

export default useAuthStore;