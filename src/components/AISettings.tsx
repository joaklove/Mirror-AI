import { useEffect, useMemo, useState } from 'react';
import {
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Check,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AI_PROVIDER_PRESETS,
  matchPresetByBaseUrl,
  type AIProviderPreset,
} from '@/lib/aiProviders';
import { settingsService as readSettings } from '@/services/journalService';
import { settingsService as writeSettings } from '@/services/settingsService';
import { cn } from '@/lib/utils';

type TestState =
  | { status: 'idle' }
  | { status: 'testing' }
  | { status: 'ok'; message: string }
  | { status: 'fail'; message: string };

const fieldLabel: React.CSSProperties = {
  color: 'hsl(var(--ink-green))',
  fontFamily: 'var(--font-serif)',
};

const fieldHint: React.CSSProperties = {
  color: 'hsl(var(--smoke-gray))',
};

export default function AISettings() {
  const [presetId, setPresetId] = useState<string>(
    AI_PROVIDER_PRESETS.find((p) => p.recommended)?.id ?? 'openrouter'
  );
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(
    AI_PROVIDER_PRESETS.find((p) => p.recommended)?.baseUrl ?? ''
  );
  const [model, setModel] = useState(
    AI_PROVIDER_PRESETS.find((p) => p.recommended)?.defaultModel ?? ''
  );
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [test, setTest] = useState<TestState>({ status: 'idle' });

  const currentPreset = useMemo(
    () => AI_PROVIDER_PRESETS.find((p) => p.id === presetId) ?? AI_PROVIDER_PRESETS[0],
    [presetId]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await readSettings.getSettings();
        if (!alive) return;
        if (s) {
          setApiKey(s.apiKey ?? '');
          setBaseUrl(s.baseUrl ?? '');
          setModel(s.model ?? '');
          setPresetId(matchPresetByBaseUrl(s.baseUrl).id);
        }
      } catch {
        // 读取失败时保留默认预设，不阻塞页面
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handlePresetChange = (id: string) => {
    setPresetId(id);
    const preset = AI_PROVIDER_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    if (preset.id === 'custom') {
      // 切到自定义：保留当前填写，方便用户在现有基础上改
      return;
    }
    setBaseUrl(preset.baseUrl);
    setModel(preset.defaultModel);
    setTest({ status: 'idle' });
    setSaved(false);
  };

  const handleBaseUrlChange = (value: string) => {
    setBaseUrl(value);
    setPresetId(matchPresetByBaseUrl(value).id);
    setTest({ status: 'idle' });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await writeSettings.updateSettings({
        ai_api_key: apiKey.trim(),
        ai_base_url: baseUrl.trim(),
        ai_model: model.trim(),
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      setTest({ status: 'fail', message: '保存失败，请检查网络或重新登录后再试' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim() || !baseUrl.trim() || !model.trim()) {
      setTest({ status: 'fail', message: '请先填好 API Key、接口地址和模型名' });
      return;
    }
    setTest({ status: 'testing' });
    try {
      const res = await fetch(`${baseUrl.trim().replace(/\/+$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Mirror AI',
        },
        body: JSON.stringify({
          model: model.trim(),
          messages: [{ role: 'user', content: '只回复两个字：收到' }],
          max_tokens: 20,
        }),
      });
      if (res.ok) {
        setTest({ status: 'ok', message: '连接成功，配置可用' });
      } else {
        const text = await res.text().catch(() => '');
        let detail = '';
        try {
          const obj = JSON.parse(text);
          detail = obj?.error?.message ?? '';
        } catch {
          detail = text.slice(0, 120);
        }
        setTest({
          status: 'fail',
          message: `连接失败（${res.status}）：${detail || '请检查 Key、地址和模型名'}`,
        });
      }
    } catch {
      setTest({ status: 'fail', message: '连接失败：网络不通或该接口不允许浏览器直连' });
    }
  };

  return (
    <Card className="dao-card p-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
      <div className="flex items-center gap-3 mb-1">
        <Sparkles className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
        <h2 className="text-base font-medium" style={fieldLabel}>
          AI 模型配置
        </h2>
      </div>
      <p className="text-xs mb-5" style={fieldHint}>
        晨报、即时洞察、标签建议共用这套配置。改完保存即生效，Key 只存在于你自己的账号数据里。
      </p>

      {loading ? (
        <div className="flex items-center gap-2 py-6" style={fieldHint}>
          <Loader2 className="w-4 h-4 animate-spin" />
          正在读取当前配置…
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <label className="block text-sm mb-2" style={fieldLabel}>
              服务商
            </label>
            <select
              value={presetId}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none"
              style={{
                background: 'hsl(var(--cloud-white))',
                borderColor: 'hsl(var(--light-ink))',
                color: 'hsl(var(--ink-green))',
              }}
            >
              {AI_PROVIDER_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="text-xs mt-1.5" style={fieldHint}>
              {currentPreset.note || '手动填写接口地址与模型名，兼容 OpenAI 格式即可'}
            </p>
            {currentPreset.keyUrl && (
              <a
                href={currentPreset.keyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs mt-1 hover:underline"
                style={{ color: 'hsl(var(--cinnabar))' }}
              >
                去申请 API Key <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div>
            <label className="block text-sm mb-2" style={fieldLabel}>
              API Key
            </label>
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTest({ status: 'idle' });
                  setSaved(false);
                }}
                placeholder="粘贴你申请到的 Key"
                className="pr-10"
                style={{
                  background: 'hsl(var(--cloud-white))',
                  borderColor: 'hsl(var(--light-ink))',
                  color: 'hsl(var(--ink-green))',
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'hsl(var(--smoke-gray))' }}
                aria-label={showKey ? '隐藏 Key' : '显示 Key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2" style={fieldLabel}>
                接口地址
              </label>
              <Input
                type="text"
                value={baseUrl}
                onChange={(e) => handleBaseUrlChange(e.target.value)}
                placeholder="https://api.example.com/v1"
                style={{
                  background: 'hsl(var(--cloud-white))',
                  borderColor: 'hsl(var(--light-ink))',
                  color: 'hsl(var(--ink-green))',
                }}
              />
            </div>
            <div>
              <label className="block text-sm mb-2" style={fieldLabel}>
                模型名
              </label>
              <Input
                type="text"
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  setTest({ status: 'idle' });
                  setSaved(false);
                }}
                placeholder="例如 deepseek-chat"
                style={{
                  background: 'hsl(var(--cloud-white))',
                  borderColor: 'hsl(var(--light-ink))',
                  color: 'hsl(var(--ink-green))',
                }}
              />
            </div>
          </div>

          {(test.status === 'ok' || test.status === 'fail') && (
            <div
              className={cn(
                'flex items-start gap-2 text-xs px-3 py-2 rounded-lg',
                test.status === 'ok' && 'text-green-700',
                test.status === 'fail' && 'text-red-700'
              )}
              style={
                test.status === 'ok'
                  ? { background: 'hsla(168,60%,40%,0.1)' }
                  : { background: 'hsla(9,52%,53%,0.08)' }
              }
            >
              {test.status === 'ok' ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{test.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-soft disabled:opacity-60"
              style={{
                background: 'hsl(var(--ink-green))',
                color: 'hsl(var(--cloud-white))',
              }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              {saving ? '保存中…' : '保存配置'}
            </button>
            <button
              type="button"
              onClick={handleTest}
              disabled={test.status === 'testing'}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:shadow-subtle disabled:opacity-60"
              style={{
                background: 'hsl(var(--cloud-white))',
                border: '1px solid hsl(var(--light-ink))',
                color: 'hsl(var(--ink-green))',
              }}
            >
              {test.status === 'testing' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              测试连接
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'hsl(var(--ink-green))' }}>
                <Check className="w-4 h-4" /> 已保存
              </span>
            )}
          </div>

          <p className="text-xs leading-relaxed" style={fieldHint}>
            提示：模型名以厂商后台为准，会随版本更新；填错时「测试连接」会返回具体原因。自定义模式请确保接口兼容
            OpenAI 的 /chat/completions 格式。
          </p>
        </div>
      )}
    </Card>
  );
}
