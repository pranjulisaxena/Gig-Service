import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: nextToken, user: nextUser } = res.data;
    localStorage.setItem('token', nextToken);
    setToken(nextToken);
    setUser(nextUser);
    toast.success(`Welcome back, ${nextUser.name}!`);
    return nextUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: nextToken, user: nextUser } = res.data;
    localStorage.setItem('token', nextToken);
    setToken(nextToken);
    setUser(nextUser);
    toast.success('Account created successfully!');
    return nextUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out');
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    setUser(res.data.user);
    toast.success('Profile updated');
    return res.data.user;
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, updateProfile, fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
