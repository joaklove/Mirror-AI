import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 移动端增强特性（C 档）：大字体、离线草稿、下拉刷新、震动反馈。
 * 全部基于浏览器能力，无后端依赖；核心逻辑抽成纯函数便于测试。
 */

const FONT_SCALE_KEY = 'mirror:font-scale';
const DRAFT_KEY_PREFIX = 'mirror:draft:';

export type FontScale = 'normal' | 'large' | 'xlarge';

/** 大字体档位 → 根字号像素。纯函数，便于测试。 */
export function fontScaleToPx(scale: FontScale): number {
  switch (scale) {
    case 'large': return 18;
    case 'xlarge': return 20;
    default: return 16;
  }
}

/** 安全读取本地存储（SSR / 隐私模式下静默降级） */
function safeGet(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, value: string): void {
  try { window.localStorage.setItem(key, value); } catch { /* ignore */ }
}
function safeRemove(key: string): void {
  try { window.localStorage.removeItem(key); } catch { /* ignore */ }
}

/** 大字体模式：持久化到 localStorage，并把根字号写到 documentElement */
export function useFontScale() {
  const [scale, setScaleState] = useState<FontScale>(() => {
    const raw = safeGet(FONT_SCALE_KEY);
    return raw === 'large' || raw === 'xlarge' ? raw : 'normal';
  });

  const apply = useCallback((s: FontScale) => {
    try {
      const root = document.documentElement;
      root.style.fontSize = `${fontScaleToPx(s)}px`;
      root.classList.remove('font-large', 'font-xlarge');
      if (s !== 'normal') root.classList.add(`font-${s}`);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { apply(scale); }, [scale, apply]);

  const setScale = useCallback((s: FontScale) => {
    setScaleState(s);
    safeSet(FONT_SCALE_KEY, s);
  }, []);

  return { scale, setScale };
}

/** 草稿内容是否值得保存：纯函数（去空白后非空） */
export function shouldSaveDraft(text: string): boolean {
  return text.trim().length > 0;
}

/**
 * 离线草稿：输入时自动存 localStorage，页面恢复时读出。
 * save 成功后由调用方 clear()。
 */
export function useDraft(key: string) {
  const storageKey = DRAFT_KEY_PREFIX + key;
  const [draft, setDraftState] = useState<string>(() => safeGet(storageKey) || '');

  const save = useCallback((text: string) => {
    setDraftState(text);
    if (shouldSaveDraft(text)) safeSet(storageKey, text);
    else safeRemove(storageKey);
  }, [storageKey]);

  const clear = useCallback(() => {
    setDraftState('');
    safeRemove(storageKey);
  }, [storageKey]);

  return { draft, save, clear, hasDraft: draft.trim().length > 0 };
}

/** 震动反馈：能力检测 + 短震，纯函数式调用 */
export function haptic(pattern: number | number[] = 12): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch { /* ignore */ }
}

/**
 * 下拉刷新：监听 touch 手势，下拉超过阈值触发 onRefresh。
 * 只在 scrollTop≈0 时响应，避免和普通滚动冲突。
 */
export function usePullToRefresh(onRefresh: () => void | Promise<void>, threshold = 72) {
  const startY = useRef<number | null>(null);
  const [pulling, setPulling] = useState(false);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 4 || (e.touches[0]?.clientY ?? 0) < 0) return;
      startY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        setPulling(true);
        setDistance(Math.min(dy, threshold * 1.5));
      }
    };
    const onTouchEnd = async () => {
      if (distance >= threshold) {
        haptic(10);
        await onRefresh();
      }
      startY.current = null;
      setPulling(false);
      setDistance(0);
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [distance, threshold, onRefresh]);

  return { pulling, distance };
}
