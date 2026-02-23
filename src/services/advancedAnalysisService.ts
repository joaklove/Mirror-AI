import { settingsService } from './journalService';
import type { JournalEntry } from './journalService';

const ADVANCED_ANALYSIS_PROMPT = `你是一个专业的心理健康分析助手。请分析用户最近的日记记录，给出深入的心理洞察：

用户最近记录（按时间排序）：
{entries}

请从以下几个维度进行分析：

1. 情绪趋势：分析用户情绪的整体走向，是积极还是消极
2. 模式识别：识别反复出现的主题或模式
3. 变化洞察：发现近期的重要变化
4. 关联分析：不同维度之间的关联

请用温暖、专业但不晦涩的语言给出分析结果。`;

export interface AdvancedAnalysisResult {
  emotionalTrend: string;
  patterns: string[];
  changes: string[];
  correlations: string[];
  overallInsight: string;
}

export interface TrendData {
  date: string;
  dimension: string;
  count: number;
  tags: string[];
}

export interface PatternData {
  name: string;
  frequency: number;
  description: string;
}

export const advancedAnalysisService = {
  async generateAdvancedAnalysis(entries: JournalEntry[]): Promise<AdvancedAnalysisResult> {
    if (entries.length < 5) {
      return {
        emotionalTrend: '记录数量不足，无法进行准确的趋势分析',
        patterns: [],
        changes: [],
        correlations: [],
        overallInsight: '继续记录更多内容，以获得更准确的分析结果',
      };
    }

    try {
      const settings = await settingsService.getSettings();
      
      const entriesText = entries.slice(0, 20).map(e => 
        `[${new Date(e.timestamp).toLocaleDateString()}] ${e.content} (标签: ${e.tags?.join(', ') || '无'})`
      ).join('\n\n');

      const prompt = ADVANCED_ANALYSIS_PROMPT.replace('{entries}', entriesText);

      const response = await fetch(`${settings?.baseUrl || 'https://openrouter.ai/api/v1'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings?.apiKey || ''}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Mirror AI',
        },
        body: JSON.stringify({
          model: settings?.model || 'deepseek/deepseek-chat',
          messages: [
            { role: 'system', content: '你是一个专业的心理健康分析助手，给出温暖、专业的分析。' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      const analysis = data.choices?.[0]?.message?.content || '';

      return this.parseAnalysis(analysis);
    } catch (error) {
      console.error('Advanced analysis error:', error);
      return {
        emotionalTrend: '分析暂时不可用',
        patterns: [],
        changes: [],
        correlations: [],
        overallInsight: '请稍后再试',
      };
    }
  },

  parseAnalysis(analysis: string): AdvancedAnalysisResult {
    const sections = {
      emotionalTrend: '',
      patterns: [] as string[],
      changes: [] as string[],
      correlations: [] as string[],
      overallInsight: '',
    };

    const lines = analysis.split('\n');
    let currentSection = 'emotionalTrend';

    for (const line of lines) {
      if (line.includes('情绪趋势')) {
        currentSection = 'emotionalTrend';
      } else if (line.includes('模式') || line.includes('反复')) {
        currentSection = 'patterns';
      } else if (line.includes('变化') || line.includes('洞察')) {
        currentSection = 'changes';
      } else if (line.includes('关联')) {
        currentSection = 'correlations';
      } else if (line.includes('总体') || line.includes('总结')) {
        currentSection = 'overallInsight';
      } else if (line.trim()) {
        const content = line.replace(/^[-•*\d.]\s*/, '').trim();
        if (content) {
          if (currentSection === 'emotionalTrend' || currentSection === 'overallInsight') {
            sections[currentSection] += content + ' ';
          } else {
            sections[currentSection].push(content);
          }
        }
      }
    }

    return {
      emotionalTrend: sections.emotionalTrend.trim() || '分析进行中...',
      patterns: sections.patterns.slice(0, 5),
      changes: sections.changes.slice(0, 3),
      correlations: sections.correlations.slice(0, 3),
      overallInsight: sections.overallInsight.trim() || '继续记录，发现更多自我',
    };
  },

  calculateTrends(entries: JournalEntry[], dimension: string, days: number = 7): TrendData[] {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const filtered = entries.filter(e => {
      const date = new Date(e.timestamp);
      return date >= startDate && (!dimension || e.dimension === dimension);
    });

    const trendMap = new Map<string, TrendData>();

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      trendMap.set(key, { date: key, dimension: dimension || 'all', count: 0, tags: [] });
    }

    filtered.forEach(entry => {
      const key = new Date(entry.timestamp).toISOString().split('T')[0];
      const data = trendMap.get(key);
      if (data) {
        data.count++;
        if (entry.tags) {
          data.tags.push(...entry.tags);
        }
      }
    });

    return Array.from(trendMap.values());
  },

  findPatterns(entries: JournalEntry[]): PatternData[] {
    const tagCounts = new Map<string, number>();
    const dimensionCounts = new Map<string, number>();

    entries.forEach(entry => {
      (entry.tags || []).forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
      if (entry.dimension) {
        dimensionCounts.set(entry.dimension, (dimensionCounts.get(entry.dimension) || 0) + 1);
      }
    });

    const patterns: PatternData[] = [];

    tagCounts.forEach((count, tag) => {
      if (count >= 2) {
        patterns.push({
          name: tag,
          frequency: count,
          description: `经常出现 "${tag}" 相关的记录`,
        });
      }
    });

    return patterns.sort((a, b) => b.frequency - a.frequency).slice(0, 5);
  },

  comparePeriods(entries: JournalEntry[], period1Days: number, period2Days: number): {
    period1: { dimension: string; count: number }[];
    period2: { dimension: string; count: number }[];
    changes: { dimension: string; change: number; percentage: number }[];
  } {
    const now = new Date();
    const p1Start = new Date(now.getTime() - period1Days * 24 * 60 * 60 * 1000);
    const p2Start = new Date(now.getTime() - (period1Days + period2Days) * 24 * 60 * 60 * 1000);

    const p1Entries = entries.filter(e => {
      const date = new Date(e.timestamp);
      return date >= p1Start;
    });

    const p2Entries = entries.filter(e => {
      const date = new Date(e.timestamp);
      return date >= p2Start && date < p1Start;
    });

    const dimensions = ['psychology', 'cognitive', 'efficiency', 'social', 'health', 'finance'];
    const p1Counts = new Map<string, number>();
    const p2Counts = new Map<string, number>();

    dimensions.forEach(d => {
      p1Counts.set(d, 0);
      p2Counts.set(d, 0);
    });

    p1Entries.forEach(e => {
      if (e.dimension) p1Counts.set(e.dimension, (p1Counts.get(e.dimension) || 0) + 1);
    });

    p2Entries.forEach(e => {
      if (e.dimension) p2Counts.set(e.dimension, (p2Counts.get(e.dimension) || 0) + 1);
    });

    const changes = dimensions.map(d => {
      const p1 = p1Counts.get(d) || 0;
      const p2 = p2Counts.get(d) || 0;
      const change = p1 - p2;
      const percentage = p2 > 0 ? ((change / p2) * 100) : (p1 > 0 ? 100 : 0);
      return { dimension: d, change, percentage };
    });

    return {
      period1: dimensions.map(d => ({ dimension: d, count: p1Counts.get(d) || 0 })),
      period2: dimensions.map(d => ({ dimension: d, count: p2Counts.get(d) || 0 })),
      changes: changes.filter(c => Math.abs(c.change) > 0),
    };
  },
};
