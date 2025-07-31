import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useApp } from './AppContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface NotificationSettings {
  email: boolean;
  push: boolean;
  weeklySummary: boolean;
  taskReminders: boolean;
  deadlineAlerts: boolean;
  teamUpdates: boolean;
}

interface Notification {
  id: string;
  type: 'email' | 'push' | 'system';
  category: 'deadline' | 'task' | 'team' | 'summary' | 'project';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

interface NotificationContextType {
  settings: NotificationSettings;
  notifications: Notification[];
  unreadCount: number;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  sendNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
  scheduleDeadlineAlerts: () => void;
  scheduleTaskReminders: () => void;
  sendWeeklySummary: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const defaultSettings: NotificationSettings = {
  email: true,
  push: false,
  weeklySummary: false,
  taskReminders: true,
  deadlineAlerts: true,
  teamUpdates: true,
};

// Counter for unique ID generation
let notificationCounter = 0;

// Function to generate unique notification ID
const generateUniqueNotificationId = () => {
  notificationCounter += 1;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `notification-${timestamp}-${notificationCounter}-${random}`;
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { projects } = useApp();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushSupported, setPushSupported] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);

  // Check if push notifications are supported
  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setPushSupported(true);
    }
  }, []);

  // Initialize settings only once per user
  useEffect(() => {
    if (!user || initialized) return;

    const savedSettings = localStorage.getItem(`notification_settings_${user.id}`);
    let userSettings = defaultSettings;

    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        userSettings = { ...defaultSettings, ...parsedSettings };
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }

    // Check current push permission and sync with settings
    if (pushSupported && 'Notification' in window) {
      const permission = Notification.permission;
      
      if (permission === 'granted' && !userSettings.push) {
        userSettings.push = true;
      } else if (permission === 'denied') {
        userSettings.push = false;
      }
    }

    setSettings(userSettings);
    localStorage.setItem(`notification_settings_${user.id}`, JSON.stringify(userSettings));

    // Load notifications
    const savedNotifications = localStorage.getItem(`notifications_${user.id}`);
    if (savedNotifications) {
      try {
        const parsedNotifications = JSON.parse(savedNotifications);
        const uniqueNotifications = parsedNotifications.filter((notification: Notification, index: number, self: Notification[]) => 
          index === self.findIndex(n => n.id === notification.id)
        );
        
        if (uniqueNotifications.length !== parsedNotifications.length) {
          localStorage.setItem(`notifications_${user.id}`, JSON.stringify(uniqueNotifications));
        }
        
        setNotifications(uniqueNotifications);
        setUnreadCount(uniqueNotifications.filter((n: Notification) => !n.read).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }

    setInitialized(true);
  }, [user?.id, pushSupported, initialized]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    if (!user) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem(`notification_settings_${user.id}`, JSON.stringify(updatedSettings));

    // If push notifications are being enabled, request permission
    if (newSettings.push === true && pushSupported) {
      const granted = await requestPushPermission();
      if (!granted) {
        const revertedSettings = { ...updatedSettings, push: false };
        setSettings(revertedSettings);
        localStorage.setItem(`notification_settings_${user.id}`, JSON.stringify(revertedSettings));
      }
    }
  }, [user, settings, pushSupported]);

  // Request push notification permission
  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!pushSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting push permission:', error);
      return false;
    }
  }, [pushSupported]);

  // Send notification
  const sendNotification = useCallback(async (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    if (!user) return;

    const newNotification: Notification = {
      ...notification,
      id: generateUniqueNotificationId(),
      read: false,
      created_at: new Date().toISOString(),
    };

    // Add to state and ensure no duplicates
    setNotifications(prev => {
      const existingIndex = prev.findIndex(n => n.id === newNotification.id);
      if (existingIndex !== -1) {
        return prev;
      }
      
      const updated = [newNotification, ...prev].slice(0, 50);
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
      return updated;
    });
    
    setUnreadCount(prev => prev + 1);

    // Send push notification if enabled and supported
    if (settings.push && pushSupported && Notification.permission === 'granted') {
      try {
        const pushNotification = new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/favicon.ico',
          tag: newNotification.id,
          requireInteraction: false,
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
          pushNotification.close();
        }, 5000);
      } catch (error) {
        console.error('Error sending push notification:', error);
      }
    }
  }, [user, settings, pushSupported]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
  }, [user, notifications]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
  }, [user, notifications]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    if (!user) return;

    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem(`notifications_${user.id}`);
  }, [user]);

  // Schedule deadline alerts - ONLY SEND REAL NOTIFICATIONS
  const scheduleDeadlineAlerts = useCallback(() => {
    if (!settings.deadlineAlerts || !user || !projects || projects.length === 0) {
      return;
    }

    const now = new Date();
    let alertsSent = 0;

    projects.forEach(project => {
      if (project.status === 'completed') return;

      const dueDateStr = project.due_date || project.deadline;
      if (!dueDateStr) return;

      const dueDate = new Date(dueDateStr);
      const timeDiff = dueDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Alert for projects due tomorrow
      if (daysDiff === 1) {
        sendNotification({
          type: 'push',
          category: 'deadline',
          title: '⏰ Prazo se aproximando',
          message: `O projeto "${project.name}" vence amanhã!`,
          data: { projectId: project.id },
        });
        alertsSent++;
      }
      
      // Alert for projects due in 3 days
      if (daysDiff === 3) {
        sendNotification({
          type: 'push',
          category: 'deadline',
          title: '📅 Prazo em 3 dias',
          message: `O projeto "${project.name}" vence em 3 dias.`,
          data: { projectId: project.id },
        });
        alertsSent++;
      }
      
      // Alert for overdue projects
      if (daysDiff < 0) {
        sendNotification({
          type: 'push',
          category: 'deadline',
          title: '🚨 Projeto em atraso',
          message: `O projeto "${project.name}" está ${Math.abs(daysDiff)} dia(s) atrasado.`,
          data: { projectId: project.id },
        });
        alertsSent++;
      }
    });
  }, [settings.deadlineAlerts, user, projects, sendNotification]);

  // Schedule task reminders - ONLY SEND REAL NOTIFICATIONS  
  const scheduleTaskReminders = useCallback(() => {
    if (!settings.taskReminders || !user || !projects || projects.length === 0) {
      return;
    }

    const today = new Date();
    const upcomingProjects = projects.filter(project => {
      if (project.status === 'completed') return false;
      
      const dueDateStr = project.due_date || project.deadline;
      if (!dueDateStr) return false;
      
      const dueDate = new Date(dueDateStr);
      const timeDiff = dueDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      return daysDiff >= 0 && daysDiff <= 7; // Next 7 days
    });

    if (upcomingProjects.length > 0) {
      sendNotification({
        type: 'push',
        category: 'task',
        title: '📋 Lembretes de Tarefas',
        message: `Você tem ${upcomingProjects.length} projeto(s) com prazo na próxima semana.`,
        data: { projectCount: upcomingProjects.length, projects: upcomingProjects.map(p => p.name) },
      });
    }
  }, [settings.taskReminders, user, projects, sendNotification]);

  // Send weekly summary - ONLY SEND REAL NOTIFICATIONS
  const sendWeeklySummary = useCallback(async () => {
    if (!settings.weeklySummary || !user || !projects || projects.length === 0) {
      return;
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const completedThisWeek = projects.filter(project => {
      if (project.status !== 'completed') return false;
      const completedDate = new Date(project.updated_at || project.created_at);
      return completedDate >= weekAgo;
    });

    const inProgress = projects.filter(project => 
      project.status === 'in_progress' || project.status === 'planning'
    );
    
    const overdue = projects.filter(project => {
      if (project.status === 'completed') return false;
      const dueDateStr = project.due_date || project.deadline;
      if (!dueDateStr) return false;
      const dueDate = new Date(dueDateStr);
      return dueDate < now;
    });

    const totalBudget = projects.reduce((sum, project) => sum + (project.budget || 0), 0);
    const avgProgress = projects.length > 0 
      ? Math.round(projects.reduce((sum, project) => sum + (project.progress || 0), 0) / projects.length)
      : 0;

    const summaryMessage = `📊 Resumo da semana:
• ${completedThisWeek.length} projeto(s) concluído(s)
• ${inProgress.length} em andamento  
• ${overdue.length} atrasado(s)
• ${projects.length} projetos totais
• Progresso médio: ${avgProgress}%
• Orçamento total: R$ ${totalBudget.toLocaleString()}`;

    await sendNotification({
      type: 'email',
      category: 'summary',
      title: '📊 Resumo Semanal - ProjectManager',
      message: summaryMessage,
      data: {
        completed: completedThisWeek.length,
        inProgress: inProgress.length,
        overdue: overdue.length,
        total: projects.length,
        avgProgress,
        totalBudget
      },
    });
  }, [settings.weeklySummary, user, projects, sendNotification]);

  // ✅ REMOVED AUTOMATIC TIMERS - Only manual triggers now
  // No more setInterval causing page refreshes

  // Listen for project updates for team notifications
  useEffect(() => {
    if (!settings.teamUpdates || !user || !initialized) return;

    const handleProjectUpdate = (event: CustomEvent) => {
      const { projectId, action, user: actionUser } = event.detail;
      
      if (actionUser && actionUser.id !== user.id) {
        sendNotification({
          type: 'push',
          category: 'team',
          title: '👥 Atualização da Equipe',
          message: `${actionUser.name} ${action} um projeto.`,
          data: { projectId, actionUser },
        });
      }
    };

    const handleProjectCreated = (event: CustomEvent) => {
      const { project, user: creator } = event.detail;
      
      if (creator && creator.id !== user.id) {
        sendNotification({
          type: 'push',
          category: 'team',
          title: '🆕 Novo Projeto',
          message: `${creator.name} criou o projeto "${project.name}".`,
          data: { projectId: project.id, creator },
        });
      }
    };

    window.addEventListener('projectUpdated', handleProjectUpdate as EventListener);
    window.addEventListener('projectCreated', handleProjectCreated as EventListener);
    
    return () => {
      window.removeEventListener('projectUpdated', handleProjectUpdate as EventListener);
      window.removeEventListener('projectCreated', handleProjectCreated as EventListener);
    };
  }, [settings.teamUpdates, user?.id, initialized, sendNotification]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      intervalRefs.current.forEach(interval => clearInterval(interval));
      intervalRefs.current = [];
    };
  }, []);

  const value: NotificationContextType = {
    settings,
    notifications,
    unreadCount,
    updateSettings,
    sendNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestPushPermission,
    scheduleDeadlineAlerts,
    scheduleTaskReminders,
    sendWeeklySummary,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}