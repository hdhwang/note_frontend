import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  content: React.ReactNode;
  timestamp: number;
  read: boolean;
  pathname: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// antd message를 전역에서 가로채서 이벤트 발생
let intercepted = false;
const setupMessageInterceptor = () => {
  if (intercepted) return;
  intercepted = true;
  
  const originalSuccess = message.success;
  const originalError = message.error;
  const originalInfo = message.info;
  const originalWarning = message.warning;

  const intercept = (type: string, originalFn: any) => {
    return (...args: any[]) => {
      let content = args[0];
      if (typeof args[0] === 'object' && args[0] !== null && 'content' in args[0]) {
        content = args[0].content;
      }
      window.dispatchEvent(new CustomEvent('app_toast', { 
        detail: { type, content, timestamp: Date.now(), pathname: window.location.pathname } 
      }));
      return originalFn(...args);
    };
  };

  message.success = intercept('success', originalSuccess) as any;
  message.error = intercept('error', originalError) as any;
  message.info = intercept('info', originalInfo) as any;
  message.warning = intercept('warning', originalWarning) as any;
};

setupMessageInterceptor();

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      setNotifications(prev => [
        {
          id: Math.random().toString(36).substr(2, 9),
          type: customEvent.detail.type,
          content: customEvent.detail.content,
          timestamp: customEvent.detail.timestamp,
          read: false,
          pathname: customEvent.detail.pathname || '/'
        },
        ...prev
      ].slice(0, 50)); // 최근 50개 유지
    };
    window.addEventListener('app_toast', handleToast);
    return () => window.removeEventListener('app_toast', handleToast);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('Must be used within NotificationProvider');
  return context;
};
