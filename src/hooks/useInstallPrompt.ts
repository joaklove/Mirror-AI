import { useCallback, useEffect, useState } from 'react';

/**
 * PWA 安装能力检测 · 适配小众浏览器（雨见等）
 *
 * 背景：标准 Chromium 浏览器（Chrome/Edge）会抛 beforeinstallprompt 事件，
 * 网页捕获后可提供「一键安装」。但雨见等小众浏览器可能：
 *   ① 根本不抛这个事件 ② 菜单里没有「安装应用」入口。
 * 因此本 hook 不假设能安装，而是分层：
 *   - canPrompt = true → 走一键安装
 *   - canPrompt = false → UI 需降级为「手动添加步骤引导 + 复制网址」
 *
 * 平台判断用于展示对应机型的步骤：
 *   - iOS：任何浏览器都被迫用 WebKit，只能 Safari「添加到主屏幕」，第三方浏览器无能为力
 *   - Android：雨见内核是 Chromium，可尝试「添加到主屏幕」菜单
 *   - 桌面：拖地址栏安装 / 菜单安装
 *   - standalone：已经是安装态，不必再引导
 */

// beforeinstallprompt 不是标准 TS DOM 类型，这里做最小声明
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type Platform = 'ios' | 'android' | 'desktop';

/** 纯函数：从 UA + 平台串判定设备类型，便于单测 */
export function detectPlatform(
  userAgent: string,
  navigatorPlatform: string = '',
  maxTouchPoints: number = 0
): Platform {
  const ua = userAgent.toLowerCase();
  // iPadOS 13+ 的 Safari UA 伪装成 Mac，但支持触摸 —— 用 touch points 识别
  const isiPadOS = /macintosh/.test(ua) && maxTouchPoints > 1;
  if (/iphone|ipad|ipod/.test(ua) || isiPadOS || /iphone|ipad|ipod/.test(navigatorPlatform.toLowerCase())) {
    return 'ios';
  }
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

/** 纯函数：判断是否已处于安装（独立窗口）态 */
export function detectStandalone(
  displayModeStandalone: boolean,
  iosStandalone?: boolean
): boolean {
  return displayModeStandalone === true || iosStandalone === true;
}

export interface InstallPromptState {
  /** 浏览器抛出了 beforeinstallprompt，可一键安装 */
  canPrompt: boolean;
  /** 已经安装在桌面了 */
  isStandalone: boolean;
  platform: Platform;
  /** 触发一键安装；返回用户是否接受。仅在 canPrompt 时有效 */
  install: () => Promise<boolean>;
}

export function useInstallPrompt(): InstallPromptState {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const displayStandalone = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
    return detectStandalone(displayStandalone, iosStandalone);
  });
  const [platform, setPlatform] = useState<Platform>(() => {
    if (typeof navigator === 'undefined') return 'desktop';
    const nav = navigator as Navigator & { maxTouchPoints?: number };
    return detectPlatform(navigator.userAgent, navigator.platform, nav.maxTouchPoints ?? 0);
  });

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault(); // 阻止浏览器默认安装条，改由我们的按钮触发
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    const onDisplayChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    const mq = window.matchMedia?.('(display-mode: standalone)');
    mq?.addEventListener?.('change', onDisplayChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      mq?.removeEventListener?.('change', onDisplayChange);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferred) return false;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      return choice.outcome === 'accepted';
    } catch {
      return false;
    }
  }, [deferred]);

  return {
    canPrompt: !!deferred,
    isStandalone,
    platform,
    install,
  };
}
