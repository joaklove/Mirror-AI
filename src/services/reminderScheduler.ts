import { ReminderSettings, ScheduledReminder, ReminderLog, DEFAULT_REMINDER_SETTINGS } from '../types/reminder';
import { notificationService } from './notificationService';
import { journalService } from './journalService';

const REMINDER_LOG_KEY = 'reminder_log';

export class ReminderScheduler {
  private scheduledJobs: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private settings: ReminderSettings = DEFAULT_REMINDER_SETTINGS;

  async initialize(customSettings?: Partial<ReminderSettings>): Promise<void> {
    this.settings = { ...DEFAULT_REMINDER_SETTINGS, ...customSettings };
    await notificationService.initialize();
    
    if (this.settings.enabled) {
      this.scheduleAll();
    }
  }

  updateSettings(settings: Partial<ReminderSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.scheduleAll();
  }

  scheduleAll(): void {
    this.clearAll();

    if (!this.settings.enabled) return;

    if (this.settings.scheduled.enabled) {
      this.settings.scheduled.reminders.forEach(reminder => {
        if (reminder.enabled) {
          this.scheduleReminder(reminder);
        }
      });
    }

    if (this.settings.intelligent.enabled) {
      this.scheduleIntelligentCheck();
    }

    if (this.settings.caring.enabled) {
      this.scheduleCaringCheck();
    }
  }

  private scheduleReminder(reminder: ScheduledReminder): void {
    const [hours, minutes] = reminder.time.split(':').map(Number);
    
    const scheduleNext = () => {
      const now = new Date();
      const scheduledTime = new Date(now);
      scheduledTime.setHours(hours, minutes, 0, 0);

      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const delay = scheduledTime.getTime() - now.getTime();

      const jobId = `reminder-${reminder.id}`;
      
      const timeout = setTimeout(async () => {
        const today = scheduledTime.getDay();
        if (reminder.days.includes(today)) {
          if (!this.isInQuietHours()) {
            await notificationService.sendScheduledReminder(
              reminder.time,
              reminder.message || '是时候记录今天的想法了～'
            );
            this.logReminder('scheduled', reminder.message || '定时提醒');
          }
        }
        
        scheduleNext();
      }, delay);

      this.scheduledJobs.set(jobId, timeout);
    };

    scheduleNext();
  }

  private scheduleIntelligentCheck(): void {
    const jobId = 'intelligent-check';
    
    const check = async () => {
      const sentToday = this.getSentTodayCount();
      if (sentToday >= this.settings.intelligent.maxPerDay) {
        const timeout = setTimeout(check, 60 * 60 * 1000);
        this.scheduledJobs.set(jobId, timeout);
        return;
      }

      const shouldRemind = await this.shouldSendIntelligentReminder();
      if (shouldRemind) {
        await notificationService.sendIntelligentReminder(
          '根据您的习惯，现在是记录的好时机～'
        );
        this.logReminder('intelligent', '智能提醒');
      }

      const timeout = setTimeout(check, 60 * 60 * 1000);
      this.scheduledJobs.set(jobId, timeout);
    };

    const timeout = setTimeout(check, 60 * 60 * 1000);
    this.scheduledJobs.set(jobId, timeout);
  }

  private scheduleCaringCheck(): void {
    const jobId = 'caring-check';
    
    const check = async () => {
      const daysSinceLastRecord = await this.getDaysSinceLastRecord();
      if (daysSinceLastRecord >= this.settings.caring.thresholdDays) {
        await notificationService.sendCaringReminder(daysSinceLastRecord);
        this.logReminder('caring', `温情提醒 (${daysSinceLastRecord}天未记录)`);
      }

      const timeout = setTimeout(check, 6 * 60 * 60 * 1000);
      this.scheduledJobs.set(jobId, timeout);
    };

    const timeout = setTimeout(check, 6 * 60 * 60 * 1000);
    this.scheduledJobs.set(jobId, timeout);
  }

  private isInQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    const [startHour, startMin] = this.settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = this.settings.quietHours.end.split(':').map(Number);
    
    const quietStart = startHour * 60 + startMin;
    const quietEnd = endHour * 60 + endMin;

    if (quietStart > quietEnd) {
      return currentTime >= quietStart || currentTime < quietEnd;
    } else {
      return currentTime >= quietStart && currentTime < quietEnd;
    }
  }

  private async shouldSendIntelligentReminder(): Promise<boolean> {
    const random = Math.random();
    const sensitivityMultiplier = {
      low: 0.3,
      medium: 0.5,
      high: 0.8
    };
    
    return random < sensitivityMultiplier[this.settings.intelligent.sensitivity];
  }

  private async getDaysSinceLastRecord(): Promise<number> {
    try {
      const entries = await journalService.getEntries();
      if (!entries || entries.length === 0) return 999;

      const sortedEntries = [...entries].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      const lastEntry = sortedEntries[0];
      const diff = Date.now() - new Date(lastEntry.timestamp).getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }

  private getSentTodayCount(): number {
    const today = new Date().toDateString();
    const data = localStorage.getItem(REMINDER_LOG_KEY);
    if (!data) return 0;

    try {
      const logs = JSON.parse(data) as ReminderLog[];
      return logs.filter(log =>
        new Date(log.sentAt).toDateString() === today
      ).length;
    } catch {
      return 0;
    }
  }

  private logReminder(type: ReminderLog['type'], message: string): void {
    const data = localStorage.getItem(REMINDER_LOG_KEY);
    let logs: ReminderLog[] = [];
    
    if (data) {
      try {
        logs = JSON.parse(data);
      } catch {
        logs = [];
      }
    }

    const newLog: ReminderLog = {
      id: `log-${Date.now()}`,
      type,
      sentAt: new Date().toISOString(),
      message,
      clicked: false
    };

    logs.push(newLog);
    
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    logs = logs.filter(log => new Date(log.sentAt).getTime() > thirtyDaysAgo);
    
    localStorage.setItem(REMINDER_LOG_KEY, JSON.stringify(logs));
  }

  clearAll(): void {
    this.scheduledJobs.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.scheduledJobs.clear();
  }

  getSettings(): ReminderSettings {
    return this.settings;
  }
}

export const reminderScheduler = new ReminderScheduler();
