import { describe, it, expect } from 'vitest';
import { fontScaleToPx, shouldSaveDraft } from '@/hooks/useMobileEnhancements';

describe('fontScaleToPx', () => {
  it('normal 为 16px', () => {
    expect(fontScaleToPx('normal')).toBe(16);
  });

  it('large 为 18px', () => {
    expect(fontScaleToPx('large')).toBe(18);
  });

  it('xlarge 为 20px', () => {
    expect(fontScaleToPx('xlarge')).toBe(20);
  });

  it('档位越大字号越大（严格递增）', () => {
    expect(fontScaleToPx('normal')).toBeLessThan(fontScaleToPx('large'));
    expect(fontScaleToPx('large')).toBeLessThan(fontScaleToPx('xlarge'));
  });
});

describe('shouldSaveDraft', () => {
  it('非空内容应保存', () => {
    expect(shouldSaveDraft('今天的想法')).toBe(true);
  });

  it('纯空白不保存', () => {
    expect(shouldSaveDraft('   \n  ')).toBe(false);
  });

  it('空字符串不保存', () => {
    expect(shouldSaveDraft('')).toBe(false);
  });

  it('含实际字符的混白内容应保存', () => {
    expect(shouldSaveDraft('  有内容  ')).toBe(true);
  });
});
