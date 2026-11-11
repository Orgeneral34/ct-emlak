import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentOffice, setCurrentOffice] = useState(null);
  const [offices, setOffices] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('altin_token') || null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadOfficesForSuperAdmin = async () => {
    try {
      const list = await api.getSuperAdminOffices();
      if (Array.isArray(list)) {
        setOffices(list);
      }
    } catch (e) {
      // ignore if not superadmin
    }
  };

  const loadUsers = async () => {
    try {
      // Clean up legacy localStorage auto-login keys
      localStorage.removeItem('altin_user');
      localStorage.removeItem('hankan_active_user');
      localStorage.removeItem('altin_token');

      const sessionToken = sessionStorage.getItem('altin_session_token');
      const sessionUserStr = sessionStorage.getItem('altin_session_user');

      if (sessionToken && sessionUserStr) {
        try {
          const parsed = JSON.parse(sessionUserStr);
          if (!sessionStorage.getItem('ct_active_office_id') && parsed.officeId) {
            sessionStorage.setItem('ct_active_office_id', parsed.officeId);
          }
          const [data, officeData] = await Promise.all([
            api.getUsers(),
            api.getCurrentOffice().catch(() => null)
          ]);
          setUsers(Array.isArray(data) ? data : []);
          const found = (Array.isArray(data) ? data.find(u => u.id === parsed.id) : null) || parsed;
          if (found) {
            setToken(sessionToken);
            setCurrentUser(found);
            if (officeData && officeData.id) {
              setCurrentOffice(officeData);
              sessionStorage.setItem('ct_active_office_id', officeData.id);
            }
            if (found.isSuperAdmin || found.username === 'halil' || found.id === 'USR-HALIL') {
              loadOfficesForSuperAdmin();
            }
            return;
          }
        } catch (e) {
          // ignore parse error
        }
      } else {
        const data = await api.getUsers().catch(() => []);
        setUsers(Array.isArray(data) ? data : []);
      }

      // No session -> User must type username & password
      setCurrentUser(null);
      setCurrentOffice(null);
      setToken(null);
    } catch (err) {
      console.error('Kullanıcılar yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const res = await api.login(username, password);
    const activeOfficeId = res.office?.id || res.user?.officeId || 'OFC-01';
    sessionStorage.setItem('altin_session_token', res.token);
    sessionStorage.setItem('altin_session_user', JSON.stringify(res.user));
    sessionStorage.setItem('ct_active_office_id', activeOfficeId);
    setToken(res.token);
    setCurrentUser(res.user);
    if (res.office) {
      setCurrentOffice(res.office);
    } else {
      const off = await api.getCurrentOffice().catch(() => null);
      if (off) setCurrentOffice(off);
    }
    const officeUsers = await api.getUsers().catch(() => []);
    setUsers(Array.isArray(officeUsers) ? officeUsers : []);
    if (res.user?.isSuperAdmin || res.user?.username === 'halil' || res.user?.id === 'USR-HALIL') {
      await loadOfficesForSuperAdmin();
    }
    setIsLoginModalOpen(false);
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setCurrentOffice(null);
    setOffices([]);
    sessionStorage.clear();
    localStorage.removeItem('altin_user');
    localStorage.removeItem('hankan_active_user');
    localStorage.removeItem('altin_token');
    setIsLoginModalOpen(false);
  };

  const switchOffice = async (officeId) => {
    if (!officeId) return;
    sessionStorage.setItem('ct_active_office_id', officeId);
    try {
      const [off, officeUsers] = await Promise.all([
        api.getCurrentOffice(),
        api.getUsers()
      ]);
      if (off && off.id) setCurrentOffice(off);
      if (Array.isArray(officeUsers)) setUsers(officeUsers);
      await loadOfficesForSuperAdmin();
    } catch (e) {
      console.error('Ofis değiştirilirken hata:', e);
    }
  };

  const switchUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      sessionStorage.setItem('altin_session_user', JSON.stringify(user));
    }
  };

  const updateCurrentUserProfile = (updates) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      sessionStorage.setItem('altin_session_user', JSON.stringify(next));
      return next;
    });
    setUsers(prev => prev.map(u => u.id === currentUser?.id ? { ...u, ...updates } : u));
  };

  const isSuperAdmin = Boolean(
    currentUser?.isSuperAdmin ||
    currentUser?.username === 'halil' ||
    currentUser?.id === 'USR-HALIL'
  );
  const isBroker = currentUser?.role === 'broker' || isSuperAdmin;

  return (
    <AuthContext.Provider value={{
      users,
      currentUser,
      currentOffice,
      offices,
      token,
      isBroker,
      isSuperAdmin,
      login,
      logout,
      switchUser,
      switchOffice,
      refreshOffices: loadOfficesForSuperAdmin,
      updateCurrentUserProfile,
      refreshUsers: loadUsers,
      loading,
      isLoginModalOpen,
      setIsLoginModalOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
