import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const result = await api.login({ username, password });
    if (result.success) {
      setUser(result.user);
      localStorage.setItem('userData', JSON.stringify(result.user));
    }
    return result;
  };

  const register = async (username, email, password) => {
    const result = await api.register({ username, email, password });
    if (result.success) {
      // After successful registration, login to get user data
      const loginResult = await api.login({ username, password });
      if (loginResult.success) {
        setUser(loginResult.user);
        localStorage.setItem('userData', JSON.stringify(loginResult.user));
      }
      return loginResult;
    }
    return result;
  };

  const logout = async () => {
    await api.logout();
    localStorage.removeItem('userData');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};