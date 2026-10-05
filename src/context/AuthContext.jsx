import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredItem, setStoredItem } from '../utils/storage';

const AuthContext = createContext();

const STORAGE_KEY_USER = 'studyflow_auth_user';

const DEFAULT_USER = {
  userId: 'usr_default',
  name: 'Learner',
  email: 'learner@studyflow.local',
  avatar: '🎓',
  lastLoginAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    return getStoredItem(STORAGE_KEY_USER, DEFAULT_USER);
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Keep LocalStorage in sync
  useEffect(() => {
    setStoredItem(STORAGE_KEY_USER, currentUser);
  }, [currentUser]);

  /**
   * Login with email and optional name
   * Generates or uses normalized userId based on email
   */
  const login = async (email, name) => {
    if (!email || !email.trim()) return false;
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && name.trim()) || cleanEmail.split('@')[0];
    const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

    const userObj = {
      userId,
      name: cleanName,
      email: cleanEmail,
      avatar: currentUser?.avatar || '🎓',
      lastLoginAt: new Date().toISOString(),
      createdAt: currentUser?.createdAt || new Date().toISOString(),
    };

    setCurrentUser(userObj);
    return userObj;
  };

  /**
   * Update profile details
   */
  const updateProfile = ({ name, email, avatar }) => {
    setCurrentUser((prev) => {
      const updated = {
        ...prev,
        name: name !== undefined ? name : prev.name,
        email: email !== undefined ? email.toLowerCase() : prev.email,
        avatar: avatar !== undefined ? avatar : prev.avatar,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    });
  };

  /**
   * Switch to another account or guest
   */
  const logout = () => {
    const guestUser = {
      userId: `guest_${Date.now()}`,
      name: 'Guest Learner',
      email: 'guest@studyflow.local',
      avatar: '👤',
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(guestUser);
  };

  const value = {
    currentUser,
    userId: currentUser?.userId || 'default_user',
    isAuthModalOpen,
    setIsAuthModalOpen,
    login,
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
