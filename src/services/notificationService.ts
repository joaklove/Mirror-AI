import { NotificationOptions } from '../types/reminder';

export class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    this.permission = Notification.permission;

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }

    return true;
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }

  async sendNotification(options: NotificationOptions): Promise<void> {
    if (this.permission !== 'granted') {
      await this.initialize();
    }

    if (this.permission !== 'granted') {
      console.warn('Cannot send notification: permission denied');
      return;
    }

    const { title, body, icon, badge, tag, data, actions } = options;

    if (this.registration) {
      await this.registration.showNotification(title, {
        body,
        icon: icon || '/icons/notification-icon.png',
        badge: badge || '/icons/badge-icon.png',
        tag,
        data,
        actions,
        vibrate: [200, 100, 200],
        requireInteraction: false
      });
    } else {
      new Notification(title, {
        body,
        icon,
        badge,
        tag,
        data
      });
    }
  }

  async sendScheduledReminder(time: string, message: string): Promise<void> {
    await this.sendNotification({
      title: '📝 Mirror AI 提醒您',
      body: message,
      tag: 'scheduled-reminder'
    });
  }

  async sendIntelligentReminder(suggestion: string): Promise<void> {
    await this.sendNotification({
      title: '💡 灵感时刻',
      body: suggestion,
      tag: 'intelligent-reminder'
    });
  }

  async sendCaringReminder(days: number): Promise<void> {
    await this.sendNotification({
      title: '💚 我们在想您',
      body: `已经 ${days} 天没有看到您的记录了～`,
      tag: 'caring-reminder'
    });
  }

  async closeAll(): Promise<void> {
    if (this.registration) {
      const notifications = await this.registration.getNotifications();
      notifications.forEach(n => n.close());
    }
  }

  async getNotifications(): Promise<Notification[]> {
    if (this.registration) {
      return await this.registration.getNotifications();
    }
    return [];
  }
}

export const notificationService = new NotificationService();
