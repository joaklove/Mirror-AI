/**
 * AI 回声提示词 · flomo「昨日回声」的克制版
 *
 * 产品哲学（照搬 flomo，不含其技术栈）：
 * 1. 不做流水账总结——只找「今日/近日想法」与「历史笔记」之间的张力
 * 2. 三分支——有张力=回声，仅相关=观察，无关联=沉默（不硬生成）
 * 3. 强制溯源——每条结论必须用 [note:笔记id] 标注来源，只能引用给定 id
 * 4. 延续「镜」人格——安静、具体、留白，一句观察或一个提问，不长篇
 *
 * 溯源 id 以正文里的 [note:xxx] 为唯一真源，服务层正则提取 + 白名单过滤，
 * 模型编造的 id 会被拦掉，避免「可信但查无此笔记」的幻觉。
 */

export interface EchoContext {
  nickname: string;
  targetEntries: string;  // 近期笔记（已格式化，带 id）
  relatedEntries: string; // 召回的历史笔记（已格式化，带 id）
}

export type EchoType = 'echo' | 'observation' | 'silence';

export interface EchoData {
  type: EchoType;
  content: string;
  /** 从 content 里提取、经白名单过滤后的真实笔记 id */
  sourceIds: string[];
}

export const ECHO_SCHEMA = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['echo', 'observation', 'silence'] },
    content: { type: 'string' },
  },
  required: ['type', 'content'],
};

const ECHO_SYSTEM = `你是「镜」,一位安静、克制的东方生活同行者。你不写总结、不润色、不灌鸡汤,只做一件事:帮用户看见自己思维里隐藏的联系、矛盾与盲区。

你拿「用户近期的记录」去对照「他过去写过的笔记」,寻找两者之间的张力:前后矛盾、认知迭代、悬而未决的疑问、同一个困惑反复出现。`;

const ECHO_RULES = `【硬性要求 —— 违反任何一条都算失败】
1. 只依据【近期记录】和【历史笔记】里真实出现的内容说话,一个字都不许编造。
2. 只引用【可用笔记 ID】里列出的 id,格式严格写成 [note:完整id]。不许造 id,不许用省略号缩写 id。
3. 判断三选一,写入 type:
   - "echo" —— 找到明显张力(矛盾/迭代/反复出现的疑问),给一句简短观察或一个启发性提问。
   - "observation" —— 只有主题相关,但没有张力,给一句温和的观察。
   - "silence" —— 找不到有意义的关联,content 留空。宁可沉默,也不硬凑。
4. 除了 type 和 content,不要输出任何其他解释、标题或前言。
5. 全文不超过 80 字。不要 emoji,不要「亲爱的」,不做心理诊断,不替用户做决定。
6. 只输出严格 JSON,形如 {"type":"echo","content":"…… [note:xxx]"}`;

export function buildEchoPrompt(ctx: EchoContext): string {
  return `${ECHO_SYSTEM}

【可用笔记 ID —— 只能引用这里的 id】
${extractIdList(ctx.targetEntries + '\n' + ctx.relatedEntries)}

【用户近期的记录】
${ctx.targetEntries || '（近期没有记录）'}

【 recalled 历史笔记】
${ctx.relatedEntries || '（没有可对照的历史笔记）'}

${ECHO_RULES}`;
}

/** 从格式化笔记文本里抽出 id 清单，喂给模型当白名单上下文 */
function extractIdList(formatted: string): string {
  const ids = Array.from(formatted.matchAll(/\[id:([^\]]+)\]/g)).map((m) => m[1]);
  return Array.from(new Set(ids)).join('\n');
}
