import { settingsService } from './journalService';
import { llmService, type Message } from './llmService';
import type { JournalEntry } from './journalService';

// 预测性AI系统的核心服务

// 用户行为预测模型相关类型
export interface UserBehaviorPrediction {
  behavior: string;
  probability: number;
  confidence: number;
  timestamp: string;
  factors: string[];
}

// 生活趋势分析相关类型
export interface LifeTrend {
  dimension: string;
  trend: 'improving' | 'stable' | 'declining';
  score: number;
  changeRate: number;
  prediction: string;
  timestamp: string;
}

// 智能预警相关类型
export interface SmartAlert {
  id: string;
  type: 'warning' | 'info' | 'critical';
  title: string;
  description: string;
  severity: number;
  predictedTime: string;
  recommendedActions: string[];
  timestamp: string;
}

// AI教练建议相关类型
export interface AICoachSuggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
  implementationDifficulty: 'easy' | 'moderate' | 'hard';
  timestamp: string;
}

// 预测性分析结果类型
export interface PredictiveAnalysisResult {
  behaviorPredictions: UserBehaviorPrediction[];
  lifeTrends: LifeTrend[];
  alerts: SmartAlert[];
  coachSuggestions: AICoachSuggestion[];
  accuracy: number;
  timestamp: string;
}

// 预测性AI服务
export const predictiveAIService = {
  // 生成预测性分析（接入 DeepSeek AI）
  async generatePredictiveAnalysis(entries: JournalEntry[]): Promise<PredictiveAnalysisResult> {
    if (entries.length < 10) {
      return {
        behaviorPredictions: [],
        lifeTrends: [],
        alerts: [],
        coachSuggestions: [],
        accuracy: 0,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      // 使用本地规则分析
      const behaviorPredictions = this.predictUserBehavior(entries);
      const lifeTrends = this.analyzeLifeTrends(entries);
      const alerts = this.generateSmartAlerts(lifeTrends, behaviorPredictions);
      const accuracy = this.calculateAccuracy(entries, behaviorPredictions);

      // 使用 DeepSeek AI 生成更智能的教练建议
      const coachSuggestions = await this.generateAICoachSuggestionsWithAI(entries, lifeTrends, behaviorPredictions);

      return {
        behaviorPredictions,
        lifeTrends,
        alerts,
        coachSuggestions,
        accuracy,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Predictive analysis error:', error);
      return {
        behaviorPredictions: [],
        lifeTrends: [],
        alerts: [],
        coachSuggestions: [],
        accuracy: 0,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // 使用 DeepSeek AI 生成教练建议
  async generateAICoachSuggestionsWithAI(
    entries: JournalEntry[],
    trends: LifeTrend[],
    predictions: UserBehaviorPrediction[]
  ): Promise<AICoachSuggestion[]> {
    try {
      // 准备用户日记内容摘要
      const recentEntries = entries.slice(0, 20);
      const contentSummary = recentEntries.map(e => e.content).join('\n\n');
      
      // 构建 prompt
      const systemPrompt = `你是一个专业的AI生活教练和心理分析师。基于用户的日记记录，你需要分析用户的生活模式、情绪状态，并给出个性化的成长建议。

请分析以下用户日记，给出3-5条具体的、可执行的建议。

每个建议必须包含以下JSON格式的字段：
- id: 建议的唯一ID
- type: 建议类型（如：情绪管理、时间管理、人际关系、职业发展、健康管理等）
- title: 建议标题（简短明了）
- description: 建议详细描述（50-100字）
- priority: 优先级（high/medium/low）
- estimatedImpact: 预期影响（0-100的数值）
- implementationDifficulty: 执行难度（easy/moderate/hard）

请只返回JSON数组，不要包含其他内容。`;

      const userPrompt = `用户最近的生活记录：

${contentSummary}

用户当前的生活趋势：
${trends.map(t => `- ${t.dimension}: ${t.trend} (评分: ${t.score})`).join('\n')}

用户行为预测：
${predictions.map(p => `- ${p.behavior}: 概率 ${Math.round(p.probability * 100)}%`).join('\n')}`;

      const messages: Message[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];

      // 调用 DeepSeek AI
      const aiResponse = await llmService.callModel(
        messages,
        'deepseek-chat',
        {
          temperature: 0.7,
          max_tokens: 2000,
        }
      );

      // 解析 AI 响应
      const suggestions = this.parseAISuggestions(aiResponse);
      return suggestions;
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      // 如果 AI 调用失败，回退到本地规则
      return this.generateAICoachSuggestions(trends, predictions);
    }
  },

  // 解析 AI 响应
  parseAISuggestions(response: string): AICoachSuggestion[] {
    try {
      // 尝试提取 JSON 数组
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return suggestions.map((s: any, index: number) => ({
          id: s.id || `ai-suggestion-${Date.now()}-${index}`,
          type: s.type || 'general',
          title: s.title || '建议',
          description: s.description || '',
          priority: s.priority || 'medium',
          estimatedImpact: s.estimatedImpact || 50,
          implementationDifficulty: s.implementationDifficulty || 'moderate',
          timestamp: new Date().toISOString(),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error parsing AI suggestions:', error);
      return [];
    }
  },

  // 预测用户行为
  predictUserBehavior(entries: JournalEntry[]): UserBehaviorPrediction[] {
    const recentEntries = entries.slice(0, 20);
    const predictions: UserBehaviorPrediction[] = [];

    // 分析情绪模式
    const emotionalPatterns = this.analyzeEmotionalPatterns(recentEntries);
    if (emotionalPatterns.length > 0) {
      predictions.push({
        behavior: '情绪波动',
        probability: Math.min(0.9, emotionalPatterns.length * 0.15),
        confidence: Math.min(0.85, emotionalPatterns.length * 0.1),
        timestamp: new Date().toISOString(),
        factors: emotionalPatterns,
      });
    }

    // 分析活动模式
    const activityPatterns = this.analyzeActivityPatterns(recentEntries);
    if (activityPatterns.length > 0) {
      predictions.push({
        behavior: '活动偏好',
        probability: Math.min(0.85, activityPatterns.length * 0.12),
        confidence: Math.min(0.8, activityPatterns.length * 0.08),
        timestamp: new Date().toISOString(),
        factors: activityPatterns,
      });
    }

    // 分析社交模式
    const socialPatterns = this.analyzeSocialPatterns(recentEntries);
    if (socialPatterns.length > 0) {
      predictions.push({
        behavior: '社交行为',
        probability: Math.min(0.8, socialPatterns.length * 0.1),
        confidence: Math.min(0.75, socialPatterns.length * 0.07),
        timestamp: new Date().toISOString(),
        factors: socialPatterns,
      });
    }

    return predictions.filter(p => p.probability > 0.5).sort((a, b) => b.probability - a.probability);
  },

  // 分析情绪模式
  analyzeEmotionalPatterns(entries: JournalEntry[]): string[] {
    const patterns: string[] = [];
    const emotionalWords = ['开心', '快乐', '兴奋', '难过', '悲伤', '焦虑', '压力', '愤怒', '平静', '满足'];
    
    emotionalWords.forEach(word => {
      const count = entries.filter(entry => 
        entry.content.toLowerCase().includes(word.toLowerCase())
      ).length;
      
      if (count >= 3) {
        patterns.push(`${word} (${count}次)`);
      }
    });

    return patterns;
  },

  // 分析活动模式
  analyzeActivityPatterns(entries: JournalEntry[]): string[] {
    const patterns: string[] = [];
    const activityWords = ['工作', '学习', '运动', '休息', '娱乐', '社交', '阅读', '旅行', '家务', '创作'];
    
    activityWords.forEach(word => {
      const count = entries.filter(entry => 
        entry.content.toLowerCase().includes(word.toLowerCase())
      ).length;
      
      if (count >= 3) {
        patterns.push(`${word} (${count}次)`);
      }
    });

    return patterns;
  },

  // 分析社交模式
  analyzeSocialPatterns(entries: JournalEntry[]): string[] {
    const patterns: string[] = [];
    const socialWords = ['朋友', '家人', '同事', '聚会', '交流', '沟通', '孤独', '独处'];
    
    socialWords.forEach(word => {
      const count = entries.filter(entry => 
        entry.content.toLowerCase().includes(word.toLowerCase())
      ).length;
      
      if (count >= 2) {
        patterns.push(`${word} (${count}次)`);
      }
    });

    return patterns;
  },

  // 分析生活趋势
  analyzeLifeTrends(entries: JournalEntry[]): LifeTrend[] {
    const dimensions = ['psychology', 'cognitive', 'efficiency', 'social', 'health', 'finance'];
    const trends: LifeTrend[] = [];

    dimensions.forEach(dimension => {
      const dimensionEntries = entries.filter(entry => entry.dimension === dimension);
      if (dimensionEntries.length > 0) {
        const score = this.calculateDimensionScore(dimensionEntries);
        const changeRate = this.calculateChangeRate(dimensionEntries);
        let trend: 'improving' | 'stable' | 'declining' = 'stable';
        
        if (changeRate > 0.1) trend = 'improving';
        else if (changeRate < -0.1) trend = 'declining';

        trends.push({
          dimension,
          trend,
          score,
          changeRate,
          prediction: this.predictDimensionTrend(dimension, trend, changeRate),
          timestamp: new Date().toISOString(),
        });
      }
    });

    return trends;
  },

  // 计算维度评分
  calculateDimensionScore(entries: JournalEntry[]): number {
    // 基于条目数量、内容长度和情绪关键词计算评分
    const baseScore = entries.length * 10;
    const contentScore = entries.reduce((sum, entry) => sum + entry.content.length, 0) / 100;
    const emotionalScore = this.calculateEmotionalScore(entries);
    
    return Math.min(100, baseScore + contentScore + emotionalScore);
  },

  // 计算情绪评分
  calculateEmotionalScore(entries: JournalEntry[]): number {
    const positiveWords = ['开心', '快乐', '兴奋', '满足', '成功', '进步', '希望'];
    const negativeWords = ['难过', '悲伤', '焦虑', '压力', '愤怒', '失败', '失望'];
    
    let score = 0;
    entries.forEach(entry => {
      positiveWords.forEach(word => {
        if (entry.content.toLowerCase().includes(word.toLowerCase())) score += 2;
      });
      negativeWords.forEach(word => {
        if (entry.content.toLowerCase().includes(word.toLowerCase())) score -= 2;
      });
    });
    
    return score;
  },

  // 计算变化率
  calculateChangeRate(entries: JournalEntry[]): number {
    if (entries.length < 2) return 0;
    
    const recent = entries.slice(0, Math.floor(entries.length / 2));
    const past = entries.slice(Math.floor(entries.length / 2));
    
    const recentScore = this.calculateDimensionScore(recent);
    const pastScore = this.calculateDimensionScore(past);
    
    if (pastScore === 0) return 0;
    return (recentScore - pastScore) / pastScore;
  },

  // 预测维度趋势
  predictDimensionTrend(dimension: string, currentTrend: 'improving' | 'stable' | 'declining', changeRate: number): string {
    const predictions: Record<string, Record<string, string>> = {
      psychology: {
        improving: '心理状态预计将继续改善，建议保持当前的积极活动',
        stable: '心理状态相对稳定，建议寻找新的成长机会',
        declining: '心理状态有下降趋势，建议关注情绪管理和压力缓解',
      },
      cognitive: {
        improving: '认知能力预计将继续提升，建议保持学习和思考',
        stable: '认知能力相对稳定，建议尝试新的思维挑战',
        declining: '认知能力有下降趋势，建议增加脑力活动和休息',
      },
      efficiency: {
        improving: '效率预计将继续提高，建议优化工作流程',
        stable: '效率相对稳定，建议寻找新的效率提升方法',
        declining: '效率有下降趋势，建议分析原因并调整工作方式',
      },
      social: {
        improving: '社交状况预计将继续改善，建议扩大社交圈',
        stable: '社交状况相对稳定，建议深化现有关系',
        declining: '社交状况有下降趋势，建议主动联系朋友和家人',
      },
      health: {
        improving: '健康状况预计将继续改善，建议保持健康习惯',
        stable: '健康状况相对稳定，建议定期体检和调整',
        declining: '健康状况有下降趋势，建议关注饮食和运动',
      },
      finance: {
        improving: '财务状况预计将继续改善，建议合理规划投资',
        stable: '财务状况相对稳定，建议建立应急基金',
        declining: '财务状况有下降趋势，建议控制支出和增加收入',
      },
    };

    return predictions[dimension]?.[currentTrend] || '趋势预测需要更多数据';
  },

  // 生成智能预警
  generateSmartAlerts(trends: LifeTrend[], predictions: UserBehaviorPrediction[]): SmartAlert[] {
    const alerts: SmartAlert[] = [];
    const alertId = () => `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 基于趋势生成预警
    trends.forEach(trend => {
      if (trend.trend === 'declining' && Math.abs(trend.changeRate) > 0.2) {
        alerts.push({
          id: alertId(),
          type: 'warning',
          title: `${this.getDimensionName(trend.dimension)}状况下降预警`,
          description: `您的${this.getDimensionName(trend.dimension)}状况正在显著下降，变化率为${(trend.changeRate * 100).toFixed(1)}%`,
          severity: Math.min(10, Math.abs(trend.changeRate) * 50),
          predictedTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          recommendedActions: this.getRecommendedActions(trend.dimension, 'declining'),
          timestamp: new Date().toISOString(),
        });
      }
    });

    // 基于行为预测生成预警
    predictions.forEach(prediction => {
      if (prediction.probability > 0.8 && prediction.behavior.includes('情绪')) {
        alerts.push({
          id: alertId(),
          type: 'info',
          title: '情绪波动预测',
          description: `预计您可能会出现${prediction.behavior}，概率为${(prediction.probability * 100).toFixed(1)}%`,
          severity: Math.min(10, prediction.probability * 10),
          predictedTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          recommendedActions: ['关注情绪变化', '适当放松', '与朋友交流'],
          timestamp: new Date().toISOString(),
        });
      }
    });

    return alerts.sort((a, b) => b.severity - a.severity);
  },

  // 获取维度名称
  getDimensionName(dimension: string): string {
    const names: Record<string, string> = {
      psychology: '心理',
      cognitive: '认知',
      efficiency: '效率',
      social: '社交',
      health: '健康',
      finance: '财务',
    };
    return names[dimension] || dimension;
  },

  // 获取推荐行动
  getRecommendedActions(dimension: string, trend: string): string[] {
    const actions: Record<string, Record<string, string[]>> = {
      psychology: {
        declining: ['进行放松练习', '保持规律作息', '寻求专业帮助', '与朋友交流'],
        improving: ['保持积极心态', '设定新目标', '分享成功经验'],
        stable: ['尝试新的兴趣爱好', '定期反思', '保持社交活动'],
      },
      cognitive: {
        declining: ['进行脑力训练', '保证充足睡眠', '健康饮食', '学习新知识'],
        improving: ['挑战更复杂的任务', '分享知识', '保持学习习惯'],
        stable: ['尝试新的学习方法', '跨领域学习', '定期复习'],
      },
      efficiency: {
        declining: ['分析时间管理', '减少干扰', '设定优先级', '适当休息'],
        improving: ['优化工作流程', '分享经验', '设定更高目标'],
        stable: ['尝试新工具', '学习时间管理技巧', '定期评估效率'],
      },
      social: {
        declining: ['主动联系朋友', '参加社交活动', '加入兴趣小组', '培养新关系'],
        improving: ['深化现有关系', '拓展社交圈', '参与社区活动'],
        stable: ['定期聚会', '保持联系', '尝试新的社交方式'],
      },
      health: {
        declining: ['增加运动量', '改善饮食习惯', '保证充足睡眠', '定期体检'],
        improving: ['保持健康习惯', '设定新的健康目标', '分享健康经验'],
        stable: ['尝试新的运动方式', '调整饮食结构', '定期健康检查'],
      },
      finance: {
        declining: ['制定预算', '减少不必要支出', '寻找额外收入', '学习理财知识'],
        improving: ['合理规划投资', '建立长期财务目标', '分享理财经验'],
        stable: ['建立应急基金', '多元化投资', '定期财务审计'],
      },
    };

    return actions[dimension]?.[trend] || ['保持观察', '收集更多数据', '寻求专业建议'];
  },

  // 生成AI教练建议
  generateAICoachSuggestions(trends: LifeTrend[], predictions: UserBehaviorPrediction[]): AICoachSuggestion[] {
    const suggestions: AICoachSuggestion[] = [];
    const suggestionId = () => `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 基于趋势生成建议
    trends.forEach(trend => {
      if (trend.trend === 'improving') {
        suggestions.push({
          id: suggestionId(),
          type: trend.dimension,
          title: `强化${this.getDimensionName(trend.dimension)}优势`,
          description: `您的${this.getDimensionName(trend.dimension)}状况正在改善，建议进一步强化积极因素`,
          priority: 'medium',
          estimatedImpact: 75,
          implementationDifficulty: 'easy',
          timestamp: new Date().toISOString(),
        });
      } else if (trend.trend === 'declining') {
        suggestions.push({
          id: suggestionId(),
          type: trend.dimension,
          title: `改善${this.getDimensionName(trend.dimension)}状况`,
          description: `您的${this.getDimensionName(trend.dimension)}状况正在下降，建议采取积极措施改善`,
          priority: 'high',
          estimatedImpact: 85,
          implementationDifficulty: 'moderate',
          timestamp: new Date().toISOString(),
        });
      }
    });

    // 基于行为预测生成建议
    predictions.forEach(prediction => {
      if (prediction.probability > 0.7) {
        suggestions.push({
          id: suggestionId(),
          type: 'behavior',
          title: `应对${prediction.behavior}的策略`,
          description: `预计您可能会出现${prediction.behavior}，建议提前准备应对策略`,
          priority: 'medium',
          estimatedImpact: 70,
          implementationDifficulty: 'easy',
          timestamp: new Date().toISOString(),
        });
      }
    });

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  },

  // 计算预测准确率
  calculateAccuracy(entries: JournalEntry[], predictions: UserBehaviorPrediction[]): number {
    // 基于历史数据和预测结果计算准确率
    // 这里使用模拟数据，实际应用中应该基于真实的历史预测和实际结果
    const baseAccuracy = 0.85;
    const dataQualityFactor = Math.min(1, entries.length / 50);
    const predictionCountFactor = Math.min(1, predictions.length / 5);
    
    return Math.min(100, (baseAccuracy * dataQualityFactor * predictionCountFactor) * 100);
  },

  // 获取预测性分析历史
  async getAnalysisHistory(limit: number = 10): Promise<PredictiveAnalysisResult[]> {
    // 这里应该从数据库获取历史分析结果
    // 目前返回空数组，实际应用中应该实现数据库存储和检索
    return [];
  },

  // 保存预测性分析结果
  async saveAnalysisResult(result: PredictiveAnalysisResult): Promise<void> {
    // 这里应该将分析结果保存到数据库
    // 目前只是打印日志，实际应用中应该实现数据库存储
    console.log('Saving predictive analysis result:', result);
  },

  // 生成详细的AI教练计划
  async generateAICoachPlan(trends: LifeTrend[], suggestions: AICoachSuggestion[]): Promise<any> {
    try {
      const settings = await settingsService.getSettings();
      
      const planData = {
        trends,
        suggestions,
        timestamp: new Date().toISOString(),
      };

      // 这里可以调用外部AI API生成更详细的教练计划
      // 目前返回基于本地逻辑生成的计划
      return {
        id: `plan-${Date.now()}`,
        title: '个性化AI教练计划',
        description: '基于您的生活趋势和行为预测生成的个性化计划',
        goals: suggestions.slice(0, 3).map(s => s.title),
        actions: suggestions.slice(0, 5).map(s => ({
          title: s.title,
          description: s.description,
          priority: s.priority,
          difficulty: s.implementationDifficulty,
        })),
        timeline: {
          shortTerm: suggestions.filter(s => s.implementationDifficulty === 'easy'),
          mediumTerm: suggestions.filter(s => s.implementationDifficulty === 'moderate'),
          longTerm: suggestions.filter(s => s.implementationDifficulty === 'hard'),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating AI coach plan:', error);
      return null;
    }
  },
};
