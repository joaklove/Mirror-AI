import { chat, getAiSettings, parseJson } from './aiClient';
import type { JournalEntry } from './journalService';
import { buildEchoPrompt, type EchoData, type EchoType } from '@/prompts/echo';

/**
 * AI 回声服务 · flomo「昨日回声」的轻量落地
 *
 * 不上向量库：74 条笔记规模下，用「标签重合 + 中文二元组关键词重合」打分召回
 * top-K 历史笔记即可，零基建、零额外 API 成本（复用用户已配的 chat 模型）。
 * 笔记过千后可把 recallRelated 换成 pgvector，其余管线不动。
 *
 * 缓存走 localStorage，按 user_id + 本地日期隔离：当日回声可再生、不入库、不配 RLS。
 */

const CACHE_PREFIX = 'mirror-ai-echo-v1';
const RECALL_TOP_K = 8;
/** 目标批次取最近 N 天内的记录（今天 + 昨天） */
const TARGET_WINDOW_DAYS = 2;
const RELATED_WINDOW_DAYS = 365;

const STOPWORDS = new Set([
  '的', '了', '和', '是', '在', '我', '有', '就', '不', '也', '这', '那', '它',
  '很', '都', '还', '把', '被', '让', '给', '与', '及', '而', '但', '一个',
]);

interface EchoCache {
  date: string;
  data: EchoData;
  generatedAt: number;
}

/** 本地日期 key（YYYY-MM-DD），与「今天」语义一致 */
export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysAgo(timestamp: string, now: Date): number {
  const t = new Date(timestamp).getTime();
  return (now.getTime() - t) / 86400000;
}

/** 中文二元组 + 标签，作为轻量「关键词指纹」 */
export function tokenize(entry: JournalEntry): Set<string> {
  const tokens = new Set<string>(entry.tags || []);
  const clean = (entry.content || '').replace(/[\s\p{P}\p{S}]/gu, '');
  for (let i = 0; i < clean.length - 1; i++) {
    const bigram = clean.slice(i, i + 2);
    if (!STOPWORDS.has(bigram)) tokens.add(bigram);
  }
  return tokens;
}

/** 杰卡德重合度打分：标签命中额外加权，体现「同一个主题反复出现」 */
export function relevanceScore(target: Set<string>, candidate: Set<string>, candidateTags: string[] = []): number {
  if (target.size === 0 || candidate.size === 0) return 0;
  let overlap = 0;
  for (const t of target) if (candidate.has(t)) overlap++;
  const tagBonus = candidateTags.filter((tag) => target.has(tag)).length * 2;
  return overlap + tagBonus;
}

/**
 * 从历史笔记里召回与「目标批次」最相关的 top-K。
 * target 与 history 由调用方按时间切分，这里只管打分排序。
 */
export function recallRelated(
  targets: JournalEntry[],
  history: JournalEntry[],
  topK: number = RECALL_TOP_K
): JournalEntry[] {
  const targetTokens = new Set<string>();
  targets.forEach((e) => tokenize(e).forEach((t) => targetTokens.add(t)));

  return history
    .map((entry) => ({
      entry,
      score: relevanceScore(targetTokens, tokenize(entry), entry.tags || []),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item) => item.entry);
}

/** 把笔记格式化成带 id 的文本，供 prompt 引用 */
function formatForPrompt(entries: JournalEntry[]): string {
  return entries
    .map((e) => {
      const tags = e.tags?.length ? ` [${e.tags.join('、')}]` : '';
      const date = new Date(e.timestamp).toLocaleDateString('zh-CN');
      return `[id:${e.id}](${date}) ${e.content}${tags}`;
    })
    .join('\n');
}

/** 白名单过滤：只保留 content 里出现、且确实属于候选笔记的真实 id */
function filterSourceIds(content: string, allowedIds: Set<string>): string[] {
  const found = Array.from(content.matchAll(/\[note:([^\]]+)\]/g)).map((m) => m[1].trim());
  return Array.from(new Set(found.filter((id) => allowedIds.has(id))));
}

function normalizeResult(raw: string, allowedIds: Set<string>): EchoData | null {
  const obj = parseJson<{ type?: string; content?: string }>(raw);
  if (!obj) return null;
  const content = String(obj.content || '').trim();
  const type: EchoType =
    obj.type === 'echo' || obj.type === 'observation' || obj.type === 'silence'
      ? obj.type
      : 'silence';
  // 沉默分支不允许带正文；有正文但无合法引用则降级为 observation（不丢内容）
  if (type === 'silence' || !content) {
    return { type: 'silence', content: '', sourceIds: [] };
  }
  const sourceIds = filterSourceIds(content, allowedIds);
  if (sourceIds.length === 0) {
    // 模型给了正文却没引用任何真实笔记 → 强约束失效，宁可沉默也不展示幻觉
    return { type: 'silence', content: '', sourceIds: [] };
  }
  return { type, content, sourceIds };
}

function cacheKey(userId: string, dateKey: string): string {
  return `${CACHE_PREFIX}:${userId}:${dateKey}`;
}

/** 读今日缓存；日期不符（跨天）视为无效 */
export function getTodayEcho(userId: string, now: Date = new Date()): EchoData | null {
  try {
    const raw = localStorage.getItem(cacheKey(userId, localDateKey(now)));
    if (!raw) return null;
    const cache = JSON.parse(raw) as EchoCache;
    if (cache.date !== localDateKey(now)) return null;
    return cache.data;
  } catch {
    return null;
  }
}

function saveTodayEcho(userId: string, data: EchoData, now: Date = new Date()): void {
  try {
    const cache: EchoCache = { date: localDateKey(now), data, generatedAt: Date.now() };
    localStorage.setItem(cacheKey(userId, localDateKey(now)), JSON.stringify(cache));
  } catch (error) {
    console.warn('[echo] cache save failed:', error);
  }
}

/** 清掉该用户过期的回声缓存（只保留今天），可安全重复调用 */
export function pruneEchoCache(userId: string, now: Date = new Date()): void {
  try {
    const today = localDateKey(now);
    const prefix = `${CACHE_PREFIX}:${userId}:`;
    const stale: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix) && !key.endsWith(`:${today}`)) stale.push(key);
    }
    stale.forEach((key) => localStorage.removeItem(key));
  } catch {
    // 清理失败不影响主流程
  }
}

export interface GenerateEchoOptions {
  entries: JournalEntry[];
  userId: string;
  nickname: string;
  now?: Date;
  /** 强制重新生成（手动点「再照一次」时传 true），忽略今日缓存 */
  force?: boolean;
}

/** 生成回声：命中今日缓存直接返回；否则召回 + 调用模型 + 过滤 + 缓存 */
export async function generateEcho(options: GenerateEchoOptions): Promise<EchoData | null> {
  const now = options.now || new Date();
  if (!options.force) {
    const cached = getTodayEcho(options.userId, now);
    if (cached) return cached;
  }

  const settings = await getAiSettings();
  if (!settings) return null;

  // 目标 = 最近两天的记录；历史 = 更早一年内，且排除目标自身
  const targets = options.entries.filter(
    (e) => daysAgo(e.timestamp, now) >= 0 && daysAgo(e.timestamp, now) <= TARGET_WINDOW_DAYS
  );
  const history = options.entries.filter((e) => daysAgo(e.timestamp, now) > TARGET_WINDOW_DAYS);
  if (targets.length === 0) return null;

  const related = recallRelated(targets, history);
  const targetText = formatForPrompt(targets);
  const relatedText = formatForPrompt(related);

  const allowedIds = new Set([...targets, ...related].map((e) => e.id));
  const prompt = buildEchoPrompt({
    nickname: options.nickname,
    targetEntries: targetText,
    relatedEntries: relatedText,
  });

  const raw = await chat({
    user: prompt,
    jsonMode: true,
    temperature: 0.8,
    maxTokens: 300,
    settings,
  });
  if (!raw) return null;

  const result = normalizeResult(raw, allowedIds);
  if (!result) return null;
  saveTodayEcho(options.userId, result, now);
  return result;
}
