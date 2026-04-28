import React, { createContext, useContext, useState, useEffect } from 'react';
import { App, message } from 'antd';

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'loading';
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

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { message: messageApi } = App.useApp();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    // antd message를 전역에서 가로채서 이벤트 발생 및 컨텍스트 기반 메시지 출력
    const intercept = (type: string) => {
      return (...args: any[]) => {
        let content = args[0];
        if (typeof args[0] === 'object' && args[0] !== null && 'content' in args[0]) {
          content = args[0].content;
        }
        
        // 로딩 타입은 알림 히스토리에 저장하지 않음
        if (type !== 'loading') {
            window.dispatchEvent(new CustomEvent('app_toast', { 
                detail: { type, content, timestamp: Date.now(), pathname: window.location.pathname } 
            }));
        }
        
        return (messageApi as any)[type](...args);
      };
    };

    message.success = intercept('success') as any;
    message.error = intercept('error') as any;
    message.info = intercept('info') as any;
    message.warning = intercept('warning') as any;
    message.loading = intercept('loading') as any;
  }, [messageApi]);

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
