import { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Smartphone,
  Monitor,
  ExternalLink,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInstallPrompt, type Platform } from '@/hooks/useInstallPrompt';

interface InstallAppDialogProps {
  open: boolean;
  onClose: () => void;
}

/** 各平台的手动添加步骤；小众浏览器（雨见等）没有一键安装时的兜底 */
const MANUAL_STEPS: Record<Platform, { title: string; icon: typeof Smartphone; steps: string[]; note?: string }> = {
  ios: {
    title: 'iPhone / iPad',
    icon: Smartphone,
    steps: [
      '点底部「分享」按钮（方框带向上箭头）',
      '下滑找到「添加到主屏幕」',
      '点右上角「添加」',
    ],
    note: 'iOS 上只有 Safari 支持全屏安装。若你正在雨见等浏览器里、菜单中没有「添加到主屏幕」，请先点「复制网址」，再用 Safari 打开后添加。',
  },
  android: {
    title: '安卓手机',
    icon: Smartphone,
    steps: [
      '点浏览器右上角「⋮」菜单',
      '找「安装应用」或「添加到主屏幕」',
      '确认后桌面出现「心镜」图标',
    ],
    note: '雨见基于 Chromium，通常支持「添加到主屏幕」。若菜单里找不到，点「复制网址」改用系统自带浏览器（如 Chrome）打开后再添加。',
  },
  desktop: {
    title: '电脑',
    icon: Monitor,
    steps: [
      '看地址栏右端有没有「安装」图标（⊕），有就点它',
      '或点浏览器菜单 → 「安装此站点为应用」',
      '确认后会出现独立窗口和桌面图标',
    ],
    note: '推荐用 Chrome 或 Edge。若你的浏览器没有安装选项，可复制网址到 Chrome / Edge 打开。',
  },
};

export function InstallAppDialog({ open, onClose }: InstallAppDialogProps) {
  const { canPrompt, isStandalone, platform, install } = useInstallPrompt();
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);
  const info = MANUAL_STEPS[platform];
  const PlatformIcon = info.icon;

  if (!open) return null;

  const handleInstall = async () => {
    setInstalling(true);
    const ok = await install();
    setInstalling(false);
    if (ok) onClose();
  };

  const handleCopy = async () => {
    const url = window.location.origin;
    let success = false;
    try {
      await navigator.clipboard.writeText(url);
      success = true;
    } catch {
      // 小众浏览器可能无 clipboard API，降级到 execCommand
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        success = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        success = false;
      }
    }
    if (success) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="安装到桌面"
    >
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="dao-card relative w-full max-w-md p-6 animate-fade-in-up">
        {/* 关闭 */}
        <button
          onClick={onClose}
          aria-label="关闭"
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--paper-yellow))] transition-colors"
        >
          <X className="w-4 h-4" style={{ color: 'hsl(var(--smoke-gray))' }} />
        </button>

        {/* 标题 */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'hsl(var(--paper-yellow))' }}
          >
            <Download className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
          </div>
          <div>
            <h2
              className="text-lg font-medium"
              style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--ink-green))' }}
            >
              把心镜装到桌面
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--smoke-gray))' }}>
              像 App 一样，一点即开
            </p>
          </div>
        </div>

        {/* 已安装 */}
        {isStandalone ? (
          <div className="text-center py-6">
            <Check className="w-10 h-10 mx-auto mb-3" style={{ color: 'hsl(var(--mountain-green))' }} />
            <p className="text-sm" style={{ color: 'hsl(var(--ink-green))' }}>
              你已经在使用桌面版了
            </p>
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--smoke-gray))' }}>
              当前正处于安装的独立窗口模式
            </p>
          </div>
        ) : (
          <>
            {/* 一键安装（标准浏览器） */}
            {canPrompt && (
              <Button
                onClick={handleInstall}
                disabled={installing}
                className="btn-primary w-full mb-5"
              >
                <Download className="w-4 h-4 mr-2" />
                {installing ? '正在安装…' : '一键安装到桌面'}
              </Button>
            )}

            {/* 平台图标 + 标题 */}
            <div className="flex items-center gap-2 mb-3">
              <PlatformIcon className="w-4 h-4" style={{ color: 'hsl(var(--cinnabar))' }} />
              <h3 className="text-sm font-medium" style={{ color: 'hsl(var(--ink-green))' }}>
                {canPrompt ? '也可以手动添加' : `在${info.title}上这样添加`}
              </h3>
            </div>

            {/* 步骤 */}
            <ol className="space-y-2.5 mb-4">
              {info.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    style={{ background: 'hsl(var(--paper-yellow))', color: 'hsl(var(--ink-green))' }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: 'hsl(var(--mountain-green))' }}>
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            {/* 提示 */}
            {info.note && (
              <p
                className="text-xs leading-relaxed p-3 rounded-lg mb-4"
                style={{ background: 'hsl(var(--paper-yellow))', color: 'hsl(var(--smoke-gray))' }}
              >
                {info.note}
              </p>
            )}

            {/* 复制网址兜底 */}
            <Button onClick={handleCopy} variant="outline" className="w-full">
              {copied ? (
                <><Check className="w-4 h-4 mr-2" />已复制，去浏览器粘贴打开</>
              ) : (
                <><Copy className="w-4 h-4 mr-2" />复制网址</>
              )}
            </Button>
            <p className="text-[11px] text-center mt-2 flex items-center justify-center gap-1" style={{ color: 'hsl(var(--stone-green))' }}>
              网址：<ExternalLink className="w-3 h-3" />
              {typeof window !== 'undefined' ? window.location.origin : ''}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default InstallAppDialog;
