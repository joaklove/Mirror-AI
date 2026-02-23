import { supabase } from '@/integrations/supabase/client';
import { quickAnalysisService } from './quickAnalysisService';
import { dataIntegrationService } from './dataIntegrationService';

// 行为模式类型定义
export interface BehaviorPattern {
  id: string;
  user_id: string;
  pattern_type: string;
  description: string;
  frequency: number;
  impact: 'positive' | 'negative' | 'neutral';
  examples: string[];
  created_at: string;
  updated_at: string;
}

// 情绪记录类型定义
export interface EmotionRecord {
  id: string;
  user_id: string;
  emotion: string;
  intensity: number; // 1-10
  trigger: string;
  context: string;
  timestamp: string;
  created_at: string;
}

// 优势类型定义
export interface Strength {
  id: string;
  user_id: string;
  name: string;
  description: string;
  evidence: string[];
  confidence: number; // 0-100
  created_at: string;
  updated_at: string;
}

// 盲点类型定义
export interface BlindSpot {
  id: string;
  user_id: string;
  name: string;
  description: string;
  impact: string;
  improvement_suggestions: string[];
  created_at: string;
  updated_at: string;
}

// 成长建议类型定义
export interface GrowthSuggestion {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  actionable_steps: string[];
  expected_outcome: string;
  created_at: string;
  updated_at: string;
}

// 自我认知报告类型定义
export interface SelfAwarenessReport {
  id: string;
  user_id: string;
  title: string;
  period: string;
  behavior_patterns: BehaviorPattern[];
  emotion_trends: {
    dominant_emotions: string[];
    emotion_changes: { date: string; emotion: string; intensity: number }[];
  };
  strengths: Strength[];
  blind_spots: BlindSpot[];
  growth_suggestions: GrowthSuggestion[];
  overall_insights: string;
  created_at: string;
}

// 自我认知服务
export const selfAwarenessService = {
  // 行为模式分析
  async analyzeBehaviorPatterns(): Promise<BehaviorPattern[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取用户数据
    const integratedData = await dataIntegrationService.getIntegratedData();

    // 分析日记内容中的行为模式
    const journalEntries = integratedData.journal_entries;
    
    // 生成行为模式分析提示
    const behaviorPrompt = `
    分析以下日记内容，识别用户的行为模式：
    
    ${journalEntries.map(entry => `${entry.timestamp}: ${entry.content.substring(0, 200)}${entry.content.length > 200 ? '...' : ''}`).join('\n\n')}
    
    请识别：
    1. 重复出现的行为模式
    2. 每种模式的频率
    3. 模式的影响（积极、消极、中性）
    4. 具体例子
    
    格式：
    模式1: [模式名称]
    - 描述: [详细描述]
    - 频率: [高频/中频/低频]
    - 影响: [积极/消极/中性]
    - 例子: [具体例子1, 具体例子2]
    
    模式2: [模式名称]
    ...
    `;

    try {
      const analysis = await quickAnalysisService.analyze(behaviorPrompt);
      const patterns = this.parseBehaviorPatternsFromAIResponse(analysis, user.id);
      
      // 保存行为模式
      for (const pattern of patterns) {
        await this.saveBehaviorPattern(pattern);
      }
      
      return patterns;
    } catch (error) {
      console.error('Behavior pattern analysis error:', error);
      return [];
    }
  },

  // 解析AI生成的行为模式
  private parseBehaviorPatternsFromAIResponse(response: string, userId: string): Omit<BehaviorPattern, 'id' | 'created_at' | 'updated_at'>[] {
    const patterns: Omit<BehaviorPattern, 'id' | 'created_at' | 'updated_at'>[] = [];
    const lines = response.split('\n');
    
    let currentPattern: Omit<BehaviorPattern, 'id' | 'created_at' | 'updated_at'> | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.match(/^模式\d+:/)) {
        if (currentPattern) {
          patterns.push(currentPattern);
        }
        
        const patternName = trimmedLine.replace(/^模式\d+:/, '').trim();
        currentPattern = {
          user_id: userId,
          pattern_type: patternName,
          description: '',
          frequency: 0,
          impact: 'neutral',
          examples: [],
        };
      } else if (currentPattern) {
        if (trimmedLine.startsWith('- 描述:')) {
          currentPattern.description = trimmedLine.replace('- 描述:', '').trim();
        } else if (trimmedLine.startsWith('- 频率:')) {
          const frequencyStr = trimmedLine.replace('- 频率:', '').trim();
          currentPattern.frequency = frequencyStr === '高频' ? 3 : frequencyStr === '中频' ? 2 : 1;
        } else if (trimmedLine.startsWith('- 影响:')) {
          const impactStr = trimmedLine.replace('- 影响:', '').trim();
          currentPattern.impact = impactStr === '积极' ? 'positive' : impactStr === '消极' ? 'negative' : 'neutral';
        } else if (trimmedLine.startsWith('- 例子:')) {
          const examplesStr = trimmedLine.replace('- 例子:', '').trim();
          currentPattern.examples = examplesStr.split(',').map(ex => ex.trim());
        }
      }
    }
    
    if (currentPattern) {
      patterns.push(currentPattern);
    }
    
    return patterns;
  },

  // 保存行为模式
  async saveBehaviorPattern(pattern: Omit<BehaviorPattern, 'id' | 'created_at' | 'updated_at'>): Promise<BehaviorPattern> {
    const { data, error } = await supabase
      .from('behavior_patterns')
      .insert(pattern)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 情绪变化趋势追踪
  async trackEmotionTrends(period: string = 'month'): Promise<{
    dominant_emotions: string[];
    emotion_changes: { date: string; emotion: string; intensity: number }[];
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取用户的情绪记录
    const { data: emotionRecords, error } = await supabase
      .from('emotion_records')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    // 分析情绪趋势
    if (emotionRecords.length === 0) {
      return {
        dominant_emotions: [],
        emotion_changes: [],
      };
    }

    // 计算主导情绪
    const emotionCounts: Record<string, number> = {};
    emotionRecords.forEach(record => {
      emotionCounts[record.emotion] = (emotionCounts[record.emotion] || 0) + 1;
    });

    const dominantEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);

    // 构建情绪变化趋势
    const emotionChanges = emotionRecords.map(record => ({
      date: record.timestamp,
      emotion: record.emotion,
      intensity: record.intensity,
    }));

    return {
      dominant_emotions: dominantEmotions,
      emotion_changes: emotionChanges,
    };
  },

  // 记录情绪
  async recordEmotion(emotion: Omit<EmotionRecord, 'id' | 'user_id' | 'created_at'>): Promise<EmotionRecord> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('emotion_records')
      .insert({
        user_id: user.id,
        ...emotion,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 优势和盲点识别
  async identifyStrengthsAndBlindSpots(): Promise<{ strengths: Strength[]; blind_spots: BlindSpot[] }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取用户数据
    const integratedData = await dataIntegrationService.getIntegratedData();
    const personalProfile = await dataIntegrationService.generatePersonalProfile();

    // 生成优势和盲点分析提示
    const analysisPrompt = `
    基于用户的个人数据画像和行为记录，识别用户的优势和盲点：
    
    个人数据画像：
    ${JSON.stringify(personalProfile, null, 2)}
    
    最近的日记内容：
    ${integratedData.journal_entries.slice(0, 5).map(entry => `${entry.timestamp}: ${entry.content.substring(0, 150)}${entry.content.length > 150 ? '...' : ''}`).join('\n\n')}
    
    请识别：
    1. 用户的核心优势（至少3个）
    2. 用户的主要盲点（至少2个）
    3. 每个优势的具体证据
    4. 每个盲点的改进建议
    
    格式：
    优势：
    1. [优势名称]: [描述]
       证据: [具体例子]
    
    盲点：
    1. [盲点名称]: [描述]
       影响: [对用户的影响]
       改进建议: [具体建议]
    `;

    try {
      const analysis = await quickAnalysisService.analyze(analysisPrompt);
      const { strengths, blindSpots } = this.parseStrengthsAndBlindSpotsFromAIResponse(analysis, user.id);
      
      // 保存优势和盲点
      for (const strength of strengths) {
        await this.saveStrength(strength);
      }
      
      for (const blindSpot of blindSpots) {
        await this.saveBlindSpot(blindSpot);
      }
      
      return { strengths, blind_spots: blindSpots };
    } catch (error) {
      console.error('Strengths and blind spots analysis error:', error);
      return { strengths: [], blind_spots: [] };
    }
  },

  // 解析AI生成的优势和盲点
  private parseStrengthsAndBlindSpotsFromAIResponse(response: string, userId: string): { strengths: Omit<Strength, 'id' | 'created_at' | 'updated_at'>[]; blindSpots: Omit<BlindSpot, 'id' | 'created_at' | 'updated_at'>[] } {
    const strengths: Omit<Strength, 'id' | 'created_at' | 'updated_at'>[] = [];
    const blindSpots: Omit<BlindSpot, 'id' | 'created_at' | 'updated_at'>[] = [];
    
    const lines = response.split('\n');
    let currentSection: 'strengths' | 'blindSpots' | null = null;
    let currentStrength: Omit<Strength, 'id' | 'created_at' | 'updated_at'> | null = null;
    let currentBlindSpot: Omit<BlindSpot, 'id' | 'created_at' | 'updated_at'> | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '优势：') {
        currentSection = 'strengths';
      } else if (trimmedLine === '盲点：') {
        currentSection = 'blindSpots';
      } else if (currentSection === 'strengths' && trimmedLine.match(/^\d+\. /)) {
        if (currentStrength) {
          strengths.push(currentStrength);
        }
        
        const [namePart, descriptionPart] = trimmedLine.replace(/^\d+\. /, '').split(':', 2);
        currentStrength = {
          user_id: userId,
          name: namePart.trim(),
          description: descriptionPart ? descriptionPart.trim() : '',
          evidence: [],
          confidence: 80,
        };
      } else if (currentSection === 'strengths' && currentStrength && trimmedLine.startsWith('证据:')) {
        const evidence = trimmedLine.replace('证据:', '').trim();
        currentStrength.evidence = [evidence];
      } else if (currentSection === 'blindSpots' && trimmedLine.match(/^\d+\. /)) {
        if (currentBlindSpot) {
          blindSpots.push(currentBlindSpot);
        }
        
        const [namePart, descriptionPart] = trimmedLine.replace(/^\d+\. /, '').split(':', 2);
        currentBlindSpot = {
          user_id: userId,
          name: namePart.trim(),
          description: descriptionPart ? descriptionPart.trim() : '',
          impact: '',
          improvement_suggestions: [],
        };
      } else if (currentSection === 'blindSpots' && currentBlindSpot) {
        if (trimmedLine.startsWith('影响:')) {
          currentBlindSpot.impact = trimmedLine.replace('影响:', '').trim();
        } else if (trimmedLine.startsWith('改进建议:')) {
          const suggestion = trimmedLine.replace('改进建议:', '').trim();
          currentBlindSpot.improvement_suggestions = [suggestion];
        }
      }
    }
    
    if (currentStrength) {
      strengths.push(currentStrength);
    }
    
    if (currentBlindSpot) {
      blindSpots.push(currentBlindSpot);
    }
    
    return { strengths, blindSpots };
  },

  // 保存优势
  async saveStrength(strength: Omit<Strength, 'id' | 'created_at' | 'updated_at'>): Promise<Strength> {
    const { data, error } = await supabase
      .from('strengths')
      .insert(strength)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 保存盲点
  async saveBlindSpot(blindSpot: Omit<BlindSpot, 'id' | 'created_at' | 'updated_at'>): Promise<BlindSpot> {
    const { data, error } = await supabase
      .from('blind_spots')
      .insert(blindSpot)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 生成个性化成长建议
  async generateGrowthSuggestions(): Promise<GrowthSuggestion[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取用户的优势和盲点
    const { strengths, blind_spots } = await this.identifyStrengthsAndBlindSpots();

    // 生成成长建议提示
    const suggestionPrompt = `
    基于用户的优势和盲点，生成个性化的成长建议：
    
    优势：
    ${strengths.map(s => `- ${s.name}: ${s.description}`).join('\n')}
    
    盲点：
    ${blind_spots.map(b => `- ${b.name}: ${b.description}\n  改进建议: ${b.improvement_suggestions.join(', ')}`).join('\n')}
    
    请生成：
    1. 至少5条个性化成长建议
    2. 每条建议包含：标题、描述、类别、优先级、可操作步骤、预期结果
    3. 建议应基于用户的优势，针对盲点提供改进方案
    4. 建议应具体、可执行
    
    格式：
    建议1: [标题]
    - 描述: [详细描述]
    - 类别: [类别]
    - 优先级: [高/中/低]
    - 可操作步骤: [步骤1, 步骤2, 步骤3]
    - 预期结果: [预期结果]
    
    建议2: [标题]
    ...
    `;

    try {
      const analysis = await quickAnalysisService.analyze(suggestionPrompt);
      const suggestions = this.parseGrowthSuggestionsFromAIResponse(analysis, user.id);
      
      // 保存成长建议
      for (const suggestion of suggestions) {
        await this.saveGrowthSuggestion(suggestion);
      }
      
      return suggestions;
    } catch (error) {
      console.error('Growth suggestion generation error:', error);
      return [];
    }
  },

  // 解析AI生成的成长建议
  private parseGrowthSuggestionsFromAIResponse(response: string, userId: string): Omit<GrowthSuggestion, 'id' | 'created_at' | 'updated_at'>[] {
    const suggestions: Omit<GrowthSuggestion, 'id' | 'created_at' | 'updated_at'>[] = [];
    const lines = response.split('\n');
    
    let currentSuggestion: Omit<GrowthSuggestion, 'id' | 'created_at' | 'updated_at'> | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.match(/^建议\d+:/)) {
        if (currentSuggestion) {
          suggestions.push(currentSuggestion);
        }
        
        const title = trimmedLine.replace(/^建议\d+:/, '').trim();
        currentSuggestion = {
          user_id: userId,
          title: title,
          description: '',
          category: '',
          priority: 'medium',
          actionable_steps: [],
          expected_outcome: '',
        };
      } else if (currentSuggestion) {
        if (trimmedLine.startsWith('- 描述:')) {
          currentSuggestion.description = trimmedLine.replace('- 描述:', '').trim();
        } else if (trimmedLine.startsWith('- 类别:')) {
          currentSuggestion.category = trimmedLine.replace('- 类别:', '').trim();
        } else if (trimmedLine.startsWith('- 优先级:')) {
          const priorityStr = trimmedLine.replace('- 优先级:', '').trim();
          currentSuggestion.priority = priorityStr === '高' ? 'high' : priorityStr === '低' ? 'low' : 'medium';
        } else if (trimmedLine.startsWith('- 可操作步骤:')) {
          const stepsStr = trimmedLine.replace('- 可操作步骤:', '').trim();
          currentSuggestion.actionable_steps = stepsStr.split(',').map(step => step.trim());
        } else if (trimmedLine.startsWith('- 预期结果:')) {
          currentSuggestion.expected_outcome = trimmedLine.replace('- 预期结果:', '').trim();
        }
      }
    }
    
    if (currentSuggestion) {
      suggestions.push(currentSuggestion);
    }
    
    return suggestions;
  },

  // 保存成长建议
  async saveGrowthSuggestion(suggestion: Omit<GrowthSuggestion, 'id' | 'created_at' | 'updated_at'>): Promise<GrowthSuggestion> {
    const { data, error } = await supabase
      .from('growth_suggestions')
      .insert(suggestion)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 生成自我认知报告
  async generateSelfAwarenessReport(period: string = 'month'): Promise<SelfAwarenessReport> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 收集各部分数据
    const behaviorPatterns = await this.analyzeBehaviorPatterns();
    const emotionTrends = await this.trackEmotionTrends(period);
    const { strengths, blind_spots } = await this.identifyStrengthsAndBlindSpots();
    const growthSuggestions = await this.generateGrowthSuggestions();

    // 生成整体洞察
    const insightsPrompt = `
    基于用户的自我认知数据，生成整体洞察：
    
    行为模式：
    ${behaviorPatterns.map(p => `- ${p.pattern_type}: ${p.description}`).join('\n')}
    
    主导情绪：
    ${emotionTrends.dominant_emotions.join(', ')}
    
    优势：
    ${strengths.map(s => `- ${s.name}: ${s.description}`).join('\n')}
    
    盲点：
    ${blind_spots.map(b => `- ${b.name}: ${b.description}`).join('\n')}
    
    请生成一段全面的整体洞察，包括用户的特点、成长机会和发展方向。
    `;

    let overallInsights = '基于你的数据，我们生成了这份自我认知报告。通过分析你的行为模式、情绪趋势、优势和盲点，我们发现了你独特的个人特质和成长机会。';
    
    try {
      const analysis = await quickAnalysisService.analyze(insightsPrompt);
      overallInsights = analysis;
    } catch (error) {
      console.error('Insights generation error:', error);
    }

    // 创建报告
    const report: Omit<SelfAwarenessReport, 'id' | 'created_at'> = {
      user_id: user.id,
      title: `${period === 'week' ? '周' : period === 'month' ? '月' : '年'}度自我认知报告`,
      period: period,
      behavior_patterns: behaviorPatterns,
      emotion_trends: emotionTrends,
      strengths: strengths,
      blind_spots: blind_spots,
      growth_suggestions: growthSuggestions,
      overall_insights: overallInsights,
    };

    // 保存报告
    const { data, error } = await supabase
      .from('self_awareness_reports')
      .insert(report)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 获取自我认知报告历史
  async getSelfAwarenessReports(): Promise<SelfAwarenessReport[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('self_awareness_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};