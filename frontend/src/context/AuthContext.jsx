import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const customerToken = localStorage.getItem('token');
        const adminToken = localStorage.getItem('adminToken');
        const dbToken = localStorage.getItem('deliveryBoyToken');

        if (customerToken) {
          try {
            const res = await api.get('/auth/me');
            if (res.data.success) {
              setUser(res.data.user);
            }
          } catch (err) {
            localStorage.removeItem('token');
            setUser(null);
          }
        }

        if (adminToken) {
          const storedAdmin = localStorage.getItem('adminUser');
          if (storedAdmin) {
            try {
              setAdmin(JSON.parse(storedAdmin));
            } catch (e) {
              localStorage.removeItem('adminUser');
            }
          }
        }

        if (dbToken) {
          try {
            const res = await api.get('/delivery-boy/me');
            if (res.data.success) {
              setDeliveryBoy(res.data.deliveryBoy);
            }
          } catch (err) {
            localStorage.removeItem('deliveryBoyToken');
            setDeliveryBoy(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Customer Auth
  const customerLogin = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const customerRegister = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const customerLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Admin Auth
  const adminLogin = async (email, password) => {
    const res = await api.post('/admin/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
      setAdmin(res.data.admin);
      return res.data;
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
  };

  // Delivery Boy Auth
  const deliveryBoyLogin = async (email, password) => {
    const res = await api.post('/delivery-boy/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('deliveryBoyToken', res.data.token);
      setDeliveryBoy(res.data.deliveryBoy);
      return res.data;
    }
  };

  const deliveryBoyLogout = () => {
    localStorage.removeItem('deliveryBoyToken');
    setDeliveryBoy(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        deliveryBoy,
        loading,
        customerLogin,
        customerRegister,
        customerLogout,
        adminLogin,
        adminLogout,
        deliveryBoyLogin,
        deliveryBoyLogout,
        setUser,
        setAdmin,
        setDeliveryBoy
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
