import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Bell, Clock, Sparkles, Heart, BellOff, Volume2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InkBackground } from '@/components/InkBackground';
import { cn } from '@/lib/utils';

const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];

interface Reminder {
  id: string;
  time: string;
  enabled: boolean;
  days: number[];
}

interface ReminderSettings {
  enabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  scheduled: {
    enabled: boolean;
    reminders: Reminder[];
  };
  intelligent: {
    enabled: boolean;
    maxPerDay: number;
    sensitivity: 'low' | 'medium' | 'high';
  };
  caring: {
    enabled: boolean;
    thresholdDays: number;
  };
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  scheduled: {
    enabled: true,
    reminders: [
      { id: '1', time: '09:00', enabled: true, days: [1, 2, 3, 4, 5] },
      { id: '2', time: '21:00', enabled: true, days: [0, 1, 2, 3, 4, 5, 6] },
    ],
  },
  intelligent: {
    enabled: false,
    maxPerDay: 2,
    sensitivity: 'medium',
  },
  caring: {
    enabled: true,
    thresholdDays: 3,
  },
};

export default function ReminderSettingsPage() {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
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
        setSettings(JSON.parse(stored));
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
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('reminder_settings', JSON.stringify(settings));
      // 显示保存成功提示
      setTimeout(() => setSaving(false), 500);
    } catch (error) {
      console.error('Failed to save reminder settings:', error);
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
        <div 
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ 
            borderColor: 'hsl(var(--mountain-green))',
            borderTopColor: 'transparent',
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* 水墨背景 */}
      <InkBackground intensity="light" />
      
      {/* Header */}
      <header 
        className="sticky top-0 z-10 dao-glass"
        style={{ borderBottom: '1px solid hsl(var(--light-ink))' }}
      >
        <div className="content-container py-4">
          <div className="flex items-center gap-3">
            <Link to="/settings">
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-xl hover:bg-[hsl(var(--paper-yellow))]"
              >
                <ArrowLeft className="w-5 h-5" style={{ color: 'hsl(var(--mountain-green))' }} />
              </Button>
            </Link>
            <div>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="content-container py-8 pb-32 relative z-10 space-y-6">
        {/* 通知权限 */}
        <Card className="dao-card animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Volume2 className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              推送通知权限
            </CardTitle>
          </CardHeader>
          <CardContent>
            {permissionStatus === 'granted' ? (
              <div className="flex items-center gap-2 text-[hsl(150,50%,40%)]">
                <Bell className="w-5 h-5" />
                <span>推送通知已开启</span>
              </div>
            ) : permissionStatus === 'denied' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[hsl(350,60%,50%)]">
                  <BellOff className="w-5 h-5" />
                  <span>推送通知已被禁用</span>
                </div>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>
                  请在浏览器设置中手动开启通知权限
                </p>
              </div>
            ) : (
              <Button 
                onClick={requestPermission} 
                variant="outline"
                className="btn-secondary"
              >
                开启推送通知
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 基础设置 */}
        <Card className="dao-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              基础设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base" style={{ color: 'hsl(var(--ink-green))' }}>
                  启用提醒
                </Label>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>
                  关闭后将不会收到任何提醒
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(v) => setSettings({ ...settings, enabled: v })}
              />
            </div>

            <div className="dao-divider" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base" style={{ color: 'hsl(var(--ink-green))' }}>
                  勿扰模式
                </Label>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>
                  在指定时间段内不发送提醒
                </p>
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
              <div className="flex items-center gap-4 pl-4 border-l-2" style={{ borderColor: 'hsl(var(--light-ink))' }}>
                <div className="flex-1">
                  <Label className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>
                    开始时间
                  </Label>
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
                  <Label className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>
                    结束时间
                  </Label>
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

        {/* 定时提醒 */}
        <Card className="dao-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              定时提醒
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base" style={{ color: 'hsl(var(--ink-green))' }}>
                  启用定时提醒
                </Label>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>
                  在指定时间发送提醒
                </p>
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
              <div 
                key={reminder.id} 
                className="space-y-3 p-4 rounded-xl"
                style={{ 
                  background: 'hsl(var(--paper-yellow))',
                  border: '1px solid hsl(var(--light-ink))',
                }}
              >
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
                  <Label className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>
                    重复
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DAY_NAMES.map((name, index) => (
                      <button
                        key={index}
                        onClick={() => toggleDay(reminder.id, index)}
                        className={cn(
                          'w-8 h-8 rounded-full text-sm transition-all',
                          reminder.days.includes(index)
                            ? 'text-white shadow-soft'
                            : 'hover:bg-[hsl(var(--light-ink))]'
                        )}
                        style={{
                          background: reminder.days.includes(index) 
                            ? 'hsl(var(--cinnabar))' 
                            : 'hsl(var(--cloud-white))',
                          color: reminder.days.includes(index) 
                            ? 'white' 
                            : 'hsl(var(--smoke-gray))',
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

        {/* 智能提醒 */}
        <Card className="dao-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              智能提醒
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base" style={{ color: 'hsl(var(--ink-green))' }}>
                  启用智能提醒
                </Label>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>
                  基于您的习惯智能发送提醒
                </p>
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
                  <Label style={{ color: 'hsl(var(--mountain-green))' }}>
                    每日最多提醒次数
                  </Label>
                  <Select
                    value={settings.intelligent.maxPerDay.toString()}
                    onValueChange={(v) => setSettings({
                      ...settings,
                      intelligent: { ...settings.intelligent, maxPerDay: parseInt(v) }
                    })}
                  >
                    <SelectTrigger className="dao-input mt-1">
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
                  <Label style={{ color: 'hsl(var(--mountain-green))' }}>
                    提醒灵敏度
                  </Label>
                  <Select
                    value={settings.intelligent.sensitivity}
                    onValueChange={(v: 'low' | 'medium' | 'high') => setSettings({
                      ...settings,
                      intelligent: { ...settings.intelligent, sensitivity: v }
                    })}
                  >
                    <SelectTrigger className="dao-input mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">低 - 较少打扰</SelectItem>
                      <SelectItem value="medium">中 - 平衡</SelectItem>
                      <SelectItem value="high">高 - 积极提醒</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 温情提醒 */}
        <Card className="dao-card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              温情提醒
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base" style={{ color: 'hsl(var(--ink-green))' }}>
                  启用温情提醒
                </Label>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>
                  长时间未记录时发送关怀提醒
                </p>
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
                <Label style={{ color: 'hsl(var(--mountain-green))' }}>
                  多少天未记录后提醒
                </Label>
                <Select
                  value={settings.caring.thresholdDays.toString()}
                  onValueChange={(v) => setSettings({
                    ...settings,
                    caring: { ...settings.caring, thresholdDays: parseInt(v) }
                  })}
                >
                  <SelectTrigger className="dao-input mt-1">
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

        {/* 保存按钮 */}
        <Button 
          onClick={handleSave} 
          className="w-full btn-primary h-12 text-base animate-fade-in-up"
          style={{ animationDelay: '0.5s' }}
          disabled={saving}
        >
          <Bell className="w-4 h-4 mr-2" />
          {saving ? '保存中...' : '保存设置'}
        </Button>
      </main>
    </div>
  );
}
