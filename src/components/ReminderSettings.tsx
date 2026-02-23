import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ReminderSettings as ReminderSettingsType, DEFAULT_REMINDER_SETTINGS, DAY_NAMES, SENSITIVITY_LABELS } from '@/types/reminder';
import { notificationService } from '@/services/notificationService';
import { reminderScheduler } from '@/services/reminderScheduler';
import { Bell, Clock, Sparkles, Heart, BellOff, Volume2 } from 'lucide-react';
import { InkBackground } from '@/components/InkBackground';

export function ReminderSettingsPage() {
  const [settings, setSettings] = useState<ReminderSettingsType>(DEFAULT_REMINDER_SETTINGS);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermission();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = localStorage.getItem('reminder_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
        await reminderScheduler.initialize(parsed);
      } else {
        await reminderScheduler.initialize(settings);
      }
    } catch (error) {
      console.error('Failed to load reminder settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  };

  const requestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('reminder_settings', JSON.stringify(settings));
      reminderScheduler.updateSettings(settings);
    } catch (error) {
      console.error('Failed to save reminder settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (reminderId: string, day: number) => {
    const updated = settings.scheduled.reminders.map(r => {
      if (r.id !== reminderId) return r;
      const days = r.days.includes(day)
        ? r.days.filter(d => d !== day)
        : [...r.days, day].sort();
      return { ...r, days };
    });
    setSettings({
      ...settings,
      scheduled: { ...settings.scheduled, reminders: updated }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'hsl(var(--cinnabar))' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <InkBackground intensity="light" />
      
      <header 
        className="sticky top-0 z-10 dao-glass"
        style={{ borderBottom: '1px solid hsl(var(--light-ink))' }}
      >
        <div className="content-container py-4">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6" style={{ color: 'hsl(var(--cinnabar))' }} />
            <h1 
              className="text-xl font-semibold"
              style={{ 
                fontFamily: 'var(--font-serif)',
                color: 'hsl(var(--ink-green))',
              }}
            >
              提醒设置
            </h1>
          </div>
          <p 
            className="text-sm mt-0.5"
            style={{ color: 'hsl(var(--mountain-green))' }}
          >
            配置你的提醒通知
          </p>
        </div>
      </header>

      <main className="content-container py-8 pb-32 relative z-10 space-y-6">
        <Card className="dao-card animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--ink-green))' }}>
              <Volume2 className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              推送通知权限
            </CardTitle>
          </CardHeader>
          <CardContent>
            {permissionStatus === 'granted' ? (
              <div className="flex items-center gap-2" style={{ color: 'hsl(150,50%,40%)' }}>
                <Bell className="w-5 h-5" />
                <span>推送通知已开启</span>
              </div>
            ) : permissionStatus === 'denied' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2" style={{ color: 'hsl(350,60%,50%)' }}>
                  <BellOff className="w-5 h-5" />
                  <span>推送通知已被禁用</span>
                </div>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>请在浏览器设置中手动开启通知权限</p>
              </div>
            ) : (
              <Button onClick={requestPermission} variant="outline" className="btn-secondary">
                开启推送通知
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="dao-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--ink-green))' }}>
              <Bell className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              基础设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base" style={{ color: 'hsl(var(--ink-green))' }}>启用提醒</Label>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>关闭后将不会收到任何提醒</p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(v) => setSettings({ ...settings, enabled: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base" style={{ color: 'hsl(var(--ink-green))' }}>勿扰模式</Label>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>在指定时间段内不发送提醒</p>
              </div>
              <Switch
                checked={settings.quietHours.enabled}
                onCheckedChange={(v) => setSettings({
                  ...settings,
                  quietHours: { ...settings.quietHours, enabled: v }
                })}
              />
            </div>

            {settings.quietHours.enabled && (
              <div className="flex items-center gap-4 pl-4 rounded-lg p-4" style={{ borderLeft: '2px solid hsl(var(--light-ink))' }}>
                <div className="flex-1">
                  <Label className="text-sm" style={{ color: 'hsl(var(--ink-green))' }}>开始时间</Label>
                  <Input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => setSettings({
                      ...settings,
                      quietHours: { ...settings.quietHours, start: e.target.value }
                    })}
                    className="dao-input mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-sm" style={{ color: 'hsl(var(--ink-green))' }}>结束时间</Label>
                  <Input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => setSettings({
                      ...settings,
                      quietHours: { ...settings.quietHours, end: e.target.value }
                    })}
                    className="dao-input mt-1"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dao-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--ink-green))' }}>
              <Clock className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              定时提醒
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base" style={{ color: 'hsl(var(--ink-green))' }}>启用定时提醒</Label>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>在指定时间发送提醒</p>
              </div>
              <Switch
                checked={settings.scheduled.enabled}
                onCheckedChange={(v) => setSettings({
                  ...settings,
                  scheduled: { ...settings.scheduled, enabled: v }
                })}
              />
            </div>

            {settings.scheduled.enabled && settings.scheduled.reminders.map((reminder) => (
              <div key={reminder.id} className="space-y-3 p-4 rounded-lg dao-card">
                <div className="flex items-center gap-4">
                  <Input
                    type="time"
                    value={reminder.time}
                    onChange={(e) => {
                      const updated = settings.scheduled.reminders.map(r =>
                        r.id === reminder.id ? { ...r, time: e.target.value } : r
                      );
                      setSettings({
                        ...settings,
                        scheduled: { ...settings.scheduled, reminders: updated }
                      });
                    }}
                    className="dao-input w-32"
                  />
                  <Switch
                    checked={reminder.enabled}
                    onCheckedChange={(v) => {
                      const updated = settings.scheduled.reminders.map(r =>
                        r.id === reminder.id ? { ...r, enabled: v } : r
                      );
                      setSettings({
                        ...settings,
                        scheduled: { ...settings.scheduled, reminders: updated }
                      });
                    }}
                  />
                </div>
                <div>
                  <Label className="text-sm" style={{ color: 'hsl(var(--ink-green))' }}>重复</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {DAY_NAMES.map((name, index) => (
                      <button
                        key={index}
                        onClick={() => toggleDay(reminder.id, index)}
                        className="px-2 py-1 text-xs rounded transition-all"
                        style={{
                          background: reminder.days.includes(index) ? 'hsl(var(--cinnabar))' : 'hsl(var(--light-ink))',
                          color: reminder.days.includes(index) ? 'white' : 'hsl(var(--mountain-green))',
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="dao-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--ink-green))' }}>
              <Sparkles className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              智能提醒
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base" style={{ color: 'hsl(var(--ink-green))' }}>启用智能提醒</Label>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>基于您的习惯智能发送提醒</p>
              </div>
              <Switch
                checked={settings.intelligent.enabled}
                onCheckedChange={(v) => setSettings({
                  ...settings,
                  intelligent: { ...settings.intelligent, enabled: v }
                })}
              />
            </div>

            {settings.intelligent.enabled && (
              <>
                <div>
                  <Label style={{ color: 'hsl(var(--ink-green))' }}>每日最多提醒次数</Label>
                  <Select
                    value={settings.intelligent.maxPerDay.toString()}
                    onValueChange={(v) => setSettings({
                      ...settings,
                      intelligent: { ...settings.intelligent, maxPerDay: parseInt(v) }
                    })}
                  >
                    <SelectTrigger className="dao-input w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1次</SelectItem>
                      <SelectItem value="2">2次</SelectItem>
                      <SelectItem value="3">3次</SelectItem>
                      <SelectItem value="5">5次</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label style={{ color: 'hsl(var(--ink-green))' }}>提醒灵敏度</Label>
                  <Select
                    value={settings.intelligent.sensitivity}
                    onValueChange={(v: 'low' | 'medium' | 'high') => setSettings({
                      ...settings,
                      intelligent: { ...settings.intelligent, sensitivity: v }
                    })}
                  >
                    <SelectTrigger className="dao-input w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{SENSITIVITY_LABELS.low}</SelectItem>
                      <SelectItem value="medium">{SENSITIVITY_LABELS.medium}</SelectItem>
                      <SelectItem value="high">{SENSITIVITY_LABELS.high}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="dao-card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--ink-green))' }}>
              <Heart className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              温情提醒
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base" style={{ color: 'hsl(var(--ink-green))' }}>启用温情提醒</Label>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>长时间未记录时发送关怀提醒</p>
              </div>
              <Switch
                checked={settings.caring.enabled}
                onCheckedChange={(v) => setSettings({
                  ...settings,
                  caring: { ...settings.caring, enabled: v }
                })}
              />
            </div>

            {settings.caring.enabled && (
              <div>
                <Label style={{ color: 'hsl(var(--ink-green))' }}>多少天未记录后提醒</Label>
                <Select
                  value={settings.caring.thresholdDays.toString()}
                  onValueChange={(v) => setSettings({
                    ...settings,
                    caring: { ...settings.caring, thresholdDays: parseInt(v) }
                  })}
                >
                  <SelectTrigger className="dao-input w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2天</SelectItem>
                    <SelectItem value="3">3天</SelectItem>
                    <SelectItem value="5">5天</SelectItem>
                    <SelectItem value="7">7天</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="btn-primary w-full" size="lg" disabled={saving}>
          <Bell className="w-4 h-4 mr-2" />
          {saving ? '保存中...' : '保存设置'}
        </Button>
      </main>
    </div>
  );
}
