import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { privacyService } from '@/services/privacyService';
import { useAuth } from '@/contexts/AuthContext';
import { PrivacySettings, DEFAULT_PRIVACY_SETTINGS } from '@/types/privacy';
import { Shield, ShieldCheck, Download, Trash2, Server, Brain, Share2, FileText } from 'lucide-react';
import { InkBackground } from '@/components/InkBackground';

export function PrivacySettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loaded = await privacyService.getPrivacySettings();
      setSettings(loaded);
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await privacyService.savePrivacySettings(settings);
      privacyService.setEncryptionEnabled(settings.storage.encryption);
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const blob = await privacyService.exportData(user.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mirror-ai-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!confirm('确定要删除所有数据吗？此操作不可恢复！')) return;
    if (!confirm('最后一次确认：删除后将无法找回任何数据。确定继续吗？')) return;
    
    setDeleting(true);
    try {
      await privacyService.deleteAllData(user.id);
      window.location.href = '/auth';
    } catch (error) {
      console.error('Failed to delete data:', error);
    } finally {
      setDeleting(false);
    }
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
            <Shield className="w-6 h-6" style={{ color: 'hsl(var(--cinnabar))' }} />
            <h1 
              className="text-xl font-semibold"
              style={{ 
                fontFamily: 'var(--font-serif)',
                color: 'hsl(var(--ink-green))',
              }}
            >
              隐私设置
            </h1>
          </div>
          <p 
            className="text-sm mt-0.5"
            style={{ color: 'hsl(var(--mountain-green))' }}
          >
            管理你的数据隐私和安全
          </p>
        </div>
      </header>

      <main className="content-container py-8 pb-32 relative z-10 space-y-6">
        <Card className="dao-card animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--ink-green))' }}>
              <Server className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              数据存储
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: 'hsl(var(--ink-green))' }}>云同步</p>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>将数据同步到云端</p>
              </div>
              <Switch
                checked={settings.storage.cloudSync}
                onCheckedChange={(v) => setSettings({
                  ...settings,
                  storage: { ...settings.storage, cloudSync: v }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: 'hsl(var(--ink-green))' }}>仅本地存储</p>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>数据仅保存在本地设备</p>
              </div>
              <Switch
                checked={settings.storage.localOnly}
                onCheckedChange={(v) => setSettings({
                  ...settings,
                  storage: { ...settings.storage, localOnly: v }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: 'hsl(var(--ink-green))' }}>端到端加密</p>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>数据加密后再同步，保护隐私</p>
              </div>
              <Switch
                checked={settings.storage.encryption}
                onCheckedChange={(v) => setSettings({
                  ...settings,
                  storage: { ...settings.storage, encryption: v }
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="dao-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--ink-green))' }}>
              <Brain className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              AI 分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: 'hsl(var(--ink-green))' }}>启用 AI 分析</p>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>允许 AI 分析您的记录</p>
              </div>
              <Switch
                checked={settings.aiAnalysis.enabled}
                onCheckedChange={(v) => setSettings({
                  ...settings,
                  aiAnalysis: { ...settings.aiAnalysis, enabled: v }
                })}
              />
            </div>

            {settings.aiAnalysis.enabled && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: 'hsl(var(--ink-green))' }}>基础分析 (L1)</p>
                    <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>情绪识别、情感分析</p>
                  </div>
                  <Switch
                    checked={settings.aiAnalysis.basic}
                    onCheckedChange={(v) => setSettings({
                      ...settings,
                      aiAnalysis: { ...settings.aiAnalysis, basic: v }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: 'hsl(var(--ink-green))' }}>进阶分析 (L2)</p>
                    <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>行为模式识别</p>
                  </div>
                  <Switch
                    checked={settings.aiAnalysis.advanced}
                    onCheckedChange={(v) => setSettings({
                      ...settings,
                      aiAnalysis: { ...settings.aiAnalysis, advanced: v }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: 'hsl(var(--ink-green))' }}>深度分析 (L3)</p>
                    <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>心理创伤分析（需额外授权）</p>
                  </div>
                  <Switch
                    checked={settings.aiAnalysis.deep}
                    onCheckedChange={(v) => setSettings({
                      ...settings,
                      aiAnalysis: { ...settings.aiAnalysis, deep: v }
                    })}
                  />
                </div>

                <Alert>
                  <AlertDescription style={{ color: 'hsl(var(--mountain-green))' }}>
                    深度心理分析需要额外授权，每次分析前都会要求确认
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="dao-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--ink-green))' }}>
              <Share2 className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              数据共享
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: 'hsl(var(--ink-green))' }}>匿名洞察分享</p>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>分享匿名化的趋势数据帮助改进产品</p>
              </div>
              <Switch
                checked={settings.sharing.anonymousInsights}
                onCheckedChange={(v) => setSettings({
                  ...settings,
                  sharing: { ...settings.sharing, anonymousInsights: v }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: 'hsl(var(--ink-green))' }}>研究参与</p>
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>参与心理健康研究项目</p>
              </div>
              <Switch
                checked={settings.sharing.researchParticipation}
                onCheckedChange={(v) => setSettings({
                  ...settings,
                  sharing: { ...settings.sharing, researchParticipation: v }
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="dao-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--ink-green))' }}>
              <FileText className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              数据权利
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleExport} 
              variant="outline" 
              className="w-full"
              disabled={exporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? '导出中...' : '导出我的数据'}
            </Button>

            <Alert variant="destructive">
              <AlertDescription className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                删除数据后将无法恢复，请谨慎操作
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleDelete} 
              variant="destructive"
              className="w-full"
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? '删除中...' : '删除所有数据'}
            </Button>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="btn-primary w-full" size="lg" disabled={saving}>
          <ShieldCheck className="w-4 h-4 mr-2" />
          {saving ? '保存中...' : '保存设置'}
        </Button>
      </main>
    </div>
  );
}
