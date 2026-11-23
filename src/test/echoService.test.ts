import { describe, it, expect, beforeEach } from 'vitest';
import {
  localDateKey,
  tokenize,
  relevanceScore,
  recallRelated,
  getTodayEcho,
  pruneEchoCache,
} from '@/services/echoService';
import type { JournalEntry } from '@/services/journalService';

function entry(id: string, content: string, tags: string[], daysAgo: number, base: Date): JournalEntry {
  const ts = new Date(base.getTime() - daysAgo * 86400000).toISOString();
  return { id, content, tags, timestamp: ts };
}

describe('echoService 纯函数', () => {
  const base = new Date(2026, 10, 23, 12, 0, 0);

  beforeEach(() => {
    localStorage.clear();
  });

  it('localDateKey 用本地日期且补零', () => {
    expect(localDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('tokenize 抽取中文二元组并带标签', () => {
    const tokens = tokenize({ id: '1', content: '今天很焦虑，焦虑到睡不着', tags: ['焦虑'], timestamp: '' });
    expect(tokens.has('焦虑')).toBe(true);
    expect(tokens.has('今天')).toBe(true);
  });

  it('relevanceScore 标签命中额外加权', () => {
    const target = new Set(['焦虑', '睡', '眠']);
    const withTag = relevanceScore(target, new Set(['焦虑', '睡']), ['焦虑']);
    const withoutTag = relevanceScore(target, new Set(['焦虑', '睡']), []);
    expect(withTag).toBeGreaterThan(withoutTag);
  });

  it('recallRelated 按相关度排序并限制 topK', () => {
    const targets = [entry('t1', '又在拖延了，焦虑', ['焦虑', '拖延'], 0, base)];
    const history = [
      entry('h1', '拖延 焦虑 逃避', ['焦虑', '拖延'], 30, base),
      entry('h2', '焦虑到睡不着', ['焦虑'], 10, base),
      entry('h3', '今天天气很好', ['日常'], 5, base),
    ];
    const related = recallRelated(targets, history, 2);
    expect(related).toHaveLength(2);
    expect(related[0].id).toBe('h1');
    expect(related.some((e) => e.id === 'h3')).toBe(false);
  });

  it('今日缓存按用户与日期隔离，跨天失效', () => {
    const data = { type: 'echo' as const, content: '观察 [note:x]', sourceIds: ['x'] };
    const key = `mirror-ai-echo-v1:u1:${localDateKey(base)}`;
    localStorage.setItem(key, JSON.stringify({ date: localDateKey(base), data, generatedAt: 1 }));
    expect(getTodayEcho('u1', base)).toEqual(data);
    expect(getTodayEcho('u2', base)).toBeNull();
    const tomorrow = new Date(base.getTime() + 86400000);
    expect(getTodayEcho('u1', tomorrow)).toBeNull();
  });

  it('pruneEchoCache 只清过期缓存', () => {
    const today = localDateKey(base);
    localStorage.setItem(`mirror-ai-echo-v1:u1:${today}`, '{}');
    localStorage.setItem('mirror-ai-echo-v1:u1:2026-10-01', '{}');
    pruneEchoCache('u1', base);
    expect(localStorage.getItem(`mirror-ai-echo-v1:u1:${today}`)).not.toBeNull();
    expect(localStorage.getItem('mirror-ai-echo-v1:u1:2026-10-01')).toBeNull();
  });
});
