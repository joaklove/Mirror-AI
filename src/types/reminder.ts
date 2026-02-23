export interface ReminderSettings {
  enabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  scheduled: {
    enabled: boolean;
    reminders: ScheduledReminder[];
  };
  intelligent: {
    enabled: boolean;
    maxPerDay: number;
    sensitivity: 'low' | 'medium' | 'high';
  };
  caring: {
    enabled: boolean;
    thresholdDays: number;
    message: string;
  };
}

export interface ScheduledReminder {
  id: string;
  time: string;
  days: number[];
  message?: string;
  enabled: boolean;
}

export interface ReminderLog {
  id: string;
  type: 'scheduled' | 'intelligent' | 'caring';
  sentAt: string;
  message: string;
  clicked: boolean;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00'
  },
  scheduled: {
    enabled: true,
    reminders: [
      {
        id: 'morning',
        time: '09:00',
        days: [1, 2, 3, 4, 5],
        message: '新的一天开始啦，来记录一下今天的心情吧～',
        enabled: true
      },
      {
        id: 'evening',
        time: '21:00',
        days: [1, 2, 3, 4, 5, 6, 0],
        message: '今天过得怎么样？来回顾一下吧～',
        enabled: true
      }
    ]
  },
  intelligent: {
    enabled: false,
    maxPerDay: 3,
    sensitivity: 'medium'
  },
  caring: {
    enabled: true,
    thresholdDays: 3,
    message: '我们一直在想您～'
  }
};

export const DEFAULT_CARING_MESSAGES = [
  '已经 {days} 天没有看到您的记录了，我们一直在想您～',
  '今天过得怎么样？我们很期待看到您的分享～',
  '您的日记里总是充满了智慧和温暖，期待再次与您相遇～',
  '每一天都值得被记录，今天也不例外～'
];

export const SENSITIVITY_LABELS = {
  low: '低 - 减少提醒频率',
  medium: '中 - 平衡提醒频率',
  high: '高 - 及时提醒'
} as const;

export const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
