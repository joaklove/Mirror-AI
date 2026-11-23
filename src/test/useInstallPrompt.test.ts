import { describe, it, expect } from 'vitest';
import { detectPlatform, detectStandalone } from '@/hooks/useInstallPrompt';

describe('detectPlatform 平台判断', () => {
  it('iPhone / iPad UA → ios', () => {
    expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('ios');
    expect(detectPlatform('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)')).toBe('ios');
  });

  it('iPadOS 13+ 伪装成 Mac 但可触摸 → ios', () => {
    // iPadOS 桌面版 UA 是 Macintosh，靠 maxTouchPoints>1 识别
    expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)', 'MacIntel', 5)).toBe('ios');
  });

  it('真正的 Mac（无触摸）→ desktop', () => {
    expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)', 'MacIntel', 0)).toBe('desktop');
  });

  it('安卓（含雨见移动版底层 UA）→ android', () => {
    expect(detectPlatform('Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120')).toBe('android');
  });

  it('Windows 桌面 → desktop', () => {
    expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120')).toBe('desktop');
  });

  it('navigator.platform 兜底识别 iPhone', () => {
    expect(detectPlatform('Mozilla/5.0 (compatible)', 'iPhone')).toBe('ios');
  });
});

describe('detectStandalone 安装态判断', () => {
  it('display-mode standalone → true', () => {
    expect(detectStandalone(true, false)).toBe(true);
  });

  it('iOS standalone 属性 → true', () => {
    expect(detectStandalone(false, true)).toBe(true);
  });

  it('普通浏览器 → false', () => {
    expect(detectStandalone(false, false)).toBe(false);
    expect(detectStandalone(false, undefined)).toBe(false);
  });
});
