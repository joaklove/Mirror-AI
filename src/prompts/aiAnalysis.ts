import { EMOTION_ANALYSIS_PROMPT, EMOTION_ANALYSIS_SCHEMA, EmotionAnalysisResult } from './emotionAnalysis';
import { PATTERN_ANALYSIS_PROMPT, PATTERN_ANALYSIS_SCHEMA, PatternAnalysisResult } from './patternAnalysis';
import { TRAUMA_ANALYSIS_PROMPT, TRAUMA_ANALYSIS_SCHEMA, TraumaAnalysisResult } from './traumaAnalysis';

export type AnalysisLevel = 'L1' | 'L2' | 'L3';

export interface JournalEntry {
  id: string;
  content: string;
  timestamp: string;
  emotion?: string;
  tags?: string[];
}

export interface AnalysisOptions {
  level: AnalysisLevel;
  entries: JournalEntry[];
  period?: number;
}

export class AIAnalysisService {
  private defaultModel = 'openai/gpt-4o';

  async analyze(options: AnalysisOptions): Promise<Record<string, unknown>> {
    const { level, entries, period = 7 } = options;

    let prompt: string;
    let schema: object;

    switch (level) {
      case 'L1':
        prompt = this.buildL1Prompt(entries);
        schema = EMOTION_ANALYSIS_SCHEMA;
        break;
      case 'L2':
        prompt = this.buildL2Prompt(entries, period);
        schema = PATTERN_ANALYSIS_SCHEMA;
        break;
      case 'L3':
        prompt = this.buildL3Prompt(entries, period);
        schema = TRAUMA_ANALYSIS_SCHEMA;
        break;
      default:
        throw new Error('Invalid analysis level');
    }

    return this.callAI(prompt, schema);
  }

  private buildL1Prompt(entries: JournalEntry[]): string {
    const content = entries
      .map((e, i) => `【记录 ${i + 1}】\n时间：${new Date(e.timestamp).toLocaleString()}\n内容：${e.content}`)
      .join('\n\n');

    return EMOTION_ANALYSIS_PROMPT.replace('{journalEntries}', content);
  }

  private buildL2Prompt(entries: JournalEntry[], period: number): string {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const content = entries
      .map((e, i) => `【记录 ${i + 1}】\n时间：${new Date(e.timestamp).toLocaleString()}\n内容：${e.content}`)
      .join('\n\n');

    return PATTERN_ANALYSIS_PROMPT
      .replace('{period}', period.toString())
      .replace('{startDate}', startDate.toLocaleDateString())
      .replace('{endDate}', new Date().toLocaleDateString())
      .replace('{journalEntries}', content);
  }

  private buildL3Prompt(entries: JournalEntry[], period: number): string {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const content = entries
      .map((e, i) => `【记录 ${i + 1}】\n时间：${new Date(e.timestamp).toLocaleString()}\n内容：${e.content}`)
      .join('\n\n');

    return TRAUMA_ANALYSIS_PROMPT
      .replace('{period}', period.toString())
      .replace('{startDate}', startDate.toLocaleDateString())
      .replace('{endDate}', new Date().toLocaleDateString())
      .replace('{journalEntries}', content);
  }

  private async callAI(prompt: string, schema: object): Promise<Record<string, unknown>> {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Mirror AI',
      },
      body: JSON.stringify({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: prompt }
        ],
        response_format: {
          type: 'json_object',
          schema: schema
        }
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('AI returned empty content');
    }

    try {
      return JSON.parse(content);
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  setModel(model: string): void {
    this.defaultModel = model;
  }
}

export const aiAnalysisService = new AIAnalysisService();

export { EMOTION_ANALYSIS_PROMPT, EMOTION_ANALYSIS_SCHEMA, EmotionAnalysisResult };
export { PATTERN_ANALYSIS_PROMPT, PATTERN_ANALYSIS_SCHEMA, PatternAnalysisResult };
export { TRAUMA_ANALYSIS_PROMPT, TRAUMA_ANALYSIS_SCHEMA, TraumaAnalysisResult };
