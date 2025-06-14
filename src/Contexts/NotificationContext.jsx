import React, { createContext, useState, useEffect } from 'react';
import { startSignalRConnection } from '../services/signalr';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    startSignalRConnection((newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
