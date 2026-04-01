import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'alert', // 'alert' or 'confirm'
    title: '',
    message: '',
    resolve: null,
  });

  const showAlert = useCallback((message, title = 'Уведомление') => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type: 'alert',
        title,
        message,
        resolve,
      });
    });
  }, []);

  const showConfirm = useCallback((message, title = 'Подтверждение') => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback((result) => {
    const { resolve } = modal;
    setModal((prev) => ({ ...prev, isOpen: false }));
    if (resolve) resolve(result);
  }, [modal]);

  return (
    <NotificationContext.Provider value={{ showAlert, showConfirm, modal, handleClose }}>
      {children}
    </NotificationContext.Provider>
  );
};
