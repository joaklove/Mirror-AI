// 模拟数据存储
class MockStorage {
  private data: Record<string, any> = {};

  async set(path: string, data: any): Promise<void> {
    this.data[path] = { ...data, timestamp: new Date() };
  }

  async get(path: string): Promise<any | null> {
    return this.data[path] || null;
  }

  async getAll(collectionPath: string): Promise<any[]> {
    const keys = Object.keys(this.data).filter(key => key.startsWith(collectionPath));
    return keys.map(key => this.data[key]);
  }

  async update(path: string, data: any): Promise<void> {
    if (this.data[path]) {
      this.data[path] = { ...this.data[path], ...data };
    }
  }
}

interface ContextData {
  timestamp: Date;
  timeOfDay: string;
  dayOfWeek: string;
  location?: {
    latitude: number;
    longitude: number;
    placeName?: string;
    placeType?: string;
  };
  activity?: string;
  deviceInfo?: {
    type: string;
    os: string;
    browser?: string;
  };
  appUsage?: {
    screen: string;
    duration: number;
  };
  weather?: {
    temperature: number;
    condition: string;
    humidity: number;
  };
  mood?: number;
}

interface UserContext {
  id: string;
  userId: string;
  context: ContextData;
  createdAt: Date;
}

interface ContextRule {
  id: string;
  userId: string;
  name: string;
  conditions: {
    timeOfDay?: string[];
    dayOfWeek?: string[];
    locationType?: string[];
    activity?: string[];
    moodRange?: [number, number];
  };
  actions: {
    type: string;
    parameters: any;
  }[];
  enabled: boolean;
  createdAt: Date;
}

interface ContextualSuggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: number;
  context: ContextData;
  timestamp: Date;
  relevant: boolean;
}

class ContextService {
  private storage = new MockStorage();

  async trackContext(contextData: Partial<ContextData>): Promise<void> {
    // 模拟用户ID
    const userId = 'mock-user-id';

    const completeContext: ContextData = {
      timestamp: new Date(),
      timeOfDay: this.getTimeOfDay(),
      dayOfWeek: this.getDayOfWeek(),
      ...contextData
    };

    const contextPath = `users/${userId}/contexts/${Date.now()}`;
    await this.storage.set(contextPath, {
      userId,
      context: completeContext,
      createdAt: new Date()
    });

    await this.analyzeContext(completeContext, userId);
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  private getDayOfWeek(): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  }

  private async analyzeContext(context: ContextData, userId: string): Promise<void> {
    try {
      const rules = await this.getUserContextRules(userId);
      const applicableRules = rules.filter(rule => this.isRuleApplicable(rule, context));

      for (const rule of applicableRules) {
        await this.executeRuleActions(rule, context, userId);
      }

      await this.generateContextualSuggestions(context, userId);
    } catch (error) {
      console.error('Error analyzing context:', error);
    }
  }

  private async getUserContextRules(userId: string): Promise<ContextRule[]> {
    try {
      const rulesData = await this.storage.getAll(`users/${userId}/contextRules`);
      return rulesData.map((data, index) => ({
        id: data.id || `rule-${index}`,
        ...data
      } as ContextRule));
    } catch (error) {
      console.error('Error getting context rules:', error);
      return [];
    }
  }

  private isRuleApplicable(rule: ContextRule, context: ContextData): boolean {
    if (!rule.enabled) return false;

    const conditions = rule.conditions;

    if (conditions.timeOfDay && !conditions.timeOfDay.includes(context.timeOfDay)) {
      return false;
    }

    if (conditions.dayOfWeek && !conditions.dayOfWeek.includes(context.dayOfWeek)) {
      return false;
    }

    if (conditions.locationType && context.location?.placeType && 
        !conditions.locationType.includes(context.location.placeType)) {
      return false;
    }

    if (conditions.activity && context.activity && 
        !conditions.activity.includes(context.activity)) {
      return false;
    }

    if (conditions.moodRange && context.mood && 
        (context.mood < conditions.moodRange[0] || context.mood > conditions.moodRange[1])) {
      return false;
    }

    return true;
  }

  private async executeRuleActions(rule: ContextRule, context: ContextData, userId: string): Promise<void> {
    for (const action of rule.actions) {
      try {
        switch (action.type) {
          case 'sendNotification':
            await this.sendNotification(action.parameters, userId);
            break;
          case 'updateSettings':
            await this.updateUserSettings(action.parameters, userId);
            break;
          case 'createTask':
            await this.createTask(action.parameters, userId);
            break;
          case 'suggestActivity':
            await this.suggestActivity(action.parameters, context, userId);
            break;
          default:
            console.warn('Unknown action type:', action.type);
        }
      } catch (error) {
        console.error('Error executing action:', error);
      }
    }
  }

  private async sendNotification(parameters: any, userId: string): Promise<void> {
    // 实现通知发送逻辑
    console.log('Sending notification:', parameters, 'to user:', userId);
  }

  private async updateUserSettings(parameters: any, userId: string): Promise<void> {
    // 实现设置更新逻辑
    console.log('Updating user settings:', parameters, 'for user:', userId);
  }

  private async createTask(parameters: any, userId: string): Promise<void> {
    // 实现任务创建逻辑
    console.log('Creating task:', parameters, 'for user:', userId);
  }

  private async suggestActivity(parameters: any, context: ContextData, userId: string): Promise<void> {
    // 实现活动建议逻辑
    console.log('Suggesting activity:', parameters, 'for context:', context, 'to user:', userId);
  }

  private async generateContextualSuggestions(context: ContextData, userId: string): Promise<void> {
    const suggestions: ContextualSuggestion[] = [];

    // 基于时间的建议
    const timeBasedSuggestions = this.generateTimeBasedSuggestions(context);
    suggestions.push(...timeBasedSuggestions);

    // 基于位置的建议
    if (context.location) {
      const locationBasedSuggestions = this.generateLocationBasedSuggestions(context);
      suggestions.push(...locationBasedSuggestions);
    }

    // 基于活动的建议
    if (context.activity) {
      const activityBasedSuggestions = this.generateActivityBasedSuggestions(context);
      suggestions.push(...activityBasedSuggestions);
    }

    // 基于情绪的建议
    if (context.mood !== undefined) {
      const moodBasedSuggestions = this.generateMoodBasedSuggestions(context);
      suggestions.push(...moodBasedSuggestions);
    }

    // 存储建议
    for (const suggestion of suggestions) {
      const suggestionPath = `users/${userId}/contextualSuggestions/${Date.now()}-${suggestion.id}`;
      await this.storage.set(suggestionPath, {
        ...suggestion,
        userId,
        createdAt: new Date()
      });
    }
  }

  private generateTimeBasedSuggestions(context: ContextData): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];

    switch (context.timeOfDay) {
      case 'morning':
        suggestions.push({
          id: `morning-${Date.now()}`,
          type: 'activity',
          title: '晨间冥想',
          description: '开始新的一天前，花5分钟进行冥想，提高专注力',
          priority: 8,
          context,
          timestamp: new Date(),
          relevant: true
        });
        break;
      case 'afternoon':
        suggestions.push({
          id: `afternoon-${Date.now()}`,
          type: 'break',
          title: '午后休息',
          description: '长时间工作后，建议休息10分钟，缓解疲劳',
          priority: 7,
          context,
          timestamp: new Date(),
          relevant: true
        });
        break;
      case 'evening':
        suggestions.push({
          id: `evening-${Date.now()}`,
          type: 'reflection',
          title: '今日反思',
          description: '回顾今天的经历，记录你的想法和感受',
          priority: 9,
          context,
          timestamp: new Date(),
          relevant: true
        });
        break;
      case 'night':
        suggestions.push({
          id: `night-${Date.now()}`,
          type: 'sleep',
          title: '准备就寝',
          description: '建议放下电子设备，为良好的睡眠做准备',
          priority: 8,
          context,
          timestamp: new Date(),
          relevant: true
        });
        break;
    }

    return suggestions;
  }

  private generateLocationBasedSuggestions(context: ContextData): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];
    const location = context.location;

    if (!location) return suggestions;

    switch (location.placeType) {
      case 'home':
        suggestions.push({
          id: `home-${Date.now()}`,
          type: 'activity',
          title: '家庭时间',
          description: '在家时，建议与家人共度质量时光',
          priority: 7,
          context,
          timestamp: new Date(),
          relevant: true
        });
        break;
      case 'work':
        suggestions.push({
          id: `work-${Date.now()}`,
          type: 'productivity',
          title: '工作专注',
          description: '在工作场所，建议专注于当前任务，减少分心',
          priority: 9,
          context,
          timestamp: new Date(),
          relevant: true
        });
        break;
      case 'gym':
        suggestions.push({
          id: `gym-${Date.now()}`,
          type: 'fitness',
          title: '健身计划',
          description: '在健身房，建议按照你的健身计划进行锻炼',
          priority: 8,
          context,
          timestamp: new Date(),
          relevant: true
        });
        break;
      case 'cafe':
        suggestions.push({
          id: `cafe-${Date.now()}`,
          type: 'creativity',
          title: '创意写作',
          description: '在咖啡馆的环境中，建议进行创意写作或思考',
          priority: 7,
          context,
          timestamp: new Date(),
          relevant: true
        });
        break;
    }

    return suggestions;
  }

  private generateActivityBasedSuggestions(context: ContextData): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];
    const activity = context.activity;

    if (!activity) return suggestions;

    switch (activity) {
      case 'working':
        suggestions.push({
          id: `working-${Date.now()}`,
          type: 'productivity',
          title: '工作效率',
          description: '工作时，建议使用番茄工作法提高效率',
          priority: 8,
          context,
          timestamp: new Date(),
          relevant: true
        });
        break;
      case 'exercising':
        suggestions.push({
          id: `exercising-${Date.now()}`,
          type: 'fitness',
          title: '运动追踪',
          description: '锻炼时，建议记录你的运动数据，跟踪进度',
          priority: 7,
          context,
          timestamp: new Date(),
          relevant: true
        });
        break;
      case 'relaxing':
        suggestions.push({
          id: `relaxing-${Date.now()}`,
          type: 'wellness',
          title: '放松技巧',
          description: '放松时，建议尝试深呼吸或渐进式肌肉放松',
          priority: 6,
          context,
          timestamp: new Date(),
          relevant: true
        });
        break;
      case 'learning':
        suggestions.push({
          id: `learning-${Date.now()}`,
          type: 'education',
          title: '学习方法',
          description: '学习时，建议使用间隔重复法增强记忆',
          priority: 8,
          context,
          timestamp: new Date(),
          relevant: true
        });
        break;
    }

    return suggestions;
  }

  private generateMoodBasedSuggestions(context: ContextData): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];
    const mood = context.mood;

    if (mood === undefined) return suggestions;

    if (mood < 3) {
      // 情绪低落
      suggestions.push({
        id: `low-mood-${Date.now()}`,
        type: 'wellness',
        title: '情绪调节',
        description: '建议进行一些能提升心情的活动，如听音乐或散步',
        priority: 9,
        context,
        timestamp: new Date(),
        relevant: true
      });
    } else if (mood > 7) {
      // 情绪高涨
      suggestions.push({
        id: `high-mood-${Date.now()}`,
        type: 'productivity',
        title: '利用积极情绪',
        description: '情绪高涨时，建议处理重要任务，充分利用创造力',
        priority: 8,
        context,
        timestamp: new Date(),
        relevant: true
      });
    } else {
      // 情绪平稳
      suggestions.push({
        id: `neutral-mood-${Date.now()}`,
        type: 'balance',
        title: '保持平衡',
        description: '情绪平稳时，建议规划未来，保持生活平衡',
        priority: 7,
        context,
        timestamp: new Date(),
        relevant: true
      });
    }

    return suggestions;
  }

  async getContextualSuggestions(limit: number = 10): Promise<ContextualSuggestion[]> {
    // 模拟用户ID
    const userId = 'mock-user-id';

    try {
      const suggestionsData = await this.storage.getAll(`users/${userId}/contextualSuggestions`);
      const suggestions = suggestionsData
        .filter(data => data.relevant)
        .map(data => data as ContextualSuggestion)
        .sort((a, b) => b.priority - a.priority)
        .slice(0, limit);

      return suggestions;
    } catch (error) {
      console.error('Error getting contextual suggestions:', error);
      return [];
    }
  }

  async createContextRule(rule: Omit<ContextRule, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    // 模拟用户ID
    const userId = 'mock-user-id';

    const ruleId = `rule-${Date.now()}`;
    const rulePath = `users/${userId}/contextRules/${ruleId}`;
    await this.storage.set(rulePath, {
      ...rule,
      id: ruleId,
      userId,
      createdAt: new Date()
    });

    return ruleId;
  }

  async updateContextRule(ruleId: string, updates: Partial<ContextRule>): Promise<void> {
    // 模拟用户ID
    const userId = 'mock-user-id';

    const rulePath = `users/${userId}/contextRules/${ruleId}`;
    await this.storage.update(rulePath, updates);
  }

  async deleteContextRule(ruleId: string): Promise<void> {
    // 模拟用户ID
    const userId = 'mock-user-id';

    const rulePath = `users/${userId}/contextRules/${ruleId}`;
    await this.storage.update(rulePath, { enabled: false });
  }

  async getContextRules(): Promise<ContextRule[]> {
    // 模拟用户ID
    const userId = 'mock-user-id';

    try {
      const rulesData = await this.storage.getAll(`users/${userId}/contextRules`);
      return rulesData.map((data, index) => ({
        id: data.id || `rule-${index}`,
        ...data
      } as ContextRule));
    } catch (error) {
      console.error('Error getting context rules:', error);
      return [];
    }
  }

  async getContextHistory(limit: number = 50): Promise<UserContext[]> {
    // 模拟用户ID
    const userId = 'mock-user-id';

    try {
      const contextData = await this.storage.getAll(`users/${userId}/contexts`);
      return contextData
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
        .map((data, index) => ({
          id: data.id || `context-${index}`,
          ...data
        } as UserContext));
    } catch (error) {
      console.error('Error getting context history:', error);
      return [];
    }
  }

  async analyzeContextPatterns(): Promise<{ patterns: any[], insights: string[] }> {
    try {
      const contextHistory = await this.getContextHistory(100);
      if (contextHistory.length === 0) return { patterns: [], insights: [] };

      // 分析时间模式
      const timePatterns = this.analyzeTimePatterns(contextHistory);

      // 分析位置模式
      const locationPatterns = this.analyzeLocationPatterns(contextHistory);

      // 分析活动模式
      const activityPatterns = this.analyzeActivityPatterns(contextHistory);

      // 生成洞察
      const insights = this.generateInsights(timePatterns, locationPatterns, activityPatterns);

      return {
        patterns: [timePatterns, locationPatterns, activityPatterns],
        insights
      };
    } catch (error) {
      console.error('Error analyzing context patterns:', error);
      return { patterns: [], insights: [] };
    }
  }

  private analyzeTimePatterns(contextHistory: UserContext[]) {
    const timeOfDayCounts = contextHistory.reduce((acc, ctx) => {
      const timeOfDay = ctx.context.timeOfDay;
      acc[timeOfDay] = (acc[timeOfDay] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dayOfWeekCounts = contextHistory.reduce((acc, ctx) => {
      const dayOfWeek = ctx.context.dayOfWeek;
      acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { timeOfDayCounts, dayOfWeekCounts };
  }

  private analyzeLocationPatterns(contextHistory: UserContext[]) {
    const locationTypeCounts = contextHistory.reduce((acc, ctx) => {
      const locationType = ctx.context.location?.placeType;
      if (locationType) {
        acc[locationType] = (acc[locationType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { locationTypeCounts };
  }

  private analyzeActivityPatterns(contextHistory: UserContext[]) {
    const activityCounts = contextHistory.reduce((acc, ctx) => {
      const activity = ctx.context.activity;
      if (activity) {
        acc[activity] = (acc[activity] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { activityCounts };
  }

  private generateInsights(timePatterns: any, locationPatterns: any, activityPatterns: any): string[] {
    const insights: string[] = [];

    // 基于时间模式的洞察
    const mostFrequentTimeOfDay = Object.entries(timePatterns.timeOfDayCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    if (mostFrequentTimeOfDay) {
      insights.push(`你最常在${this.getTimeOfDayLabel(mostFrequentTimeOfDay)}使用应用`);
    }

    // 基于位置模式的洞察
    const mostFrequentLocation = Object.entries(locationPatterns.locationTypeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    if (mostFrequentLocation) {
      insights.push(`你最常在${this.getLocationTypeLabel(mostFrequentLocation)}使用应用`);
    }

    // 基于活动模式的洞察
    const mostFrequentActivity = Object.entries(activityPatterns.activityCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    if (mostFrequentActivity) {
      insights.push(`你在${this.getActivityLabel(mostFrequentActivity)}时最常使用应用`);
    }

    return insights;
  }

  private getTimeOfDayLabel(timeOfDay: string): string {
    const labels = {
      morning: '早上',
      afternoon: '下午',
      evening: '晚上',
      night: '深夜'
    };
    return labels[timeOfDay as keyof typeof labels] || timeOfDay;
  }

  private getLocationTypeLabel(locationType: string): string {
    const labels = {
      home: '家中',
      work: '工作场所',
      gym: '健身房',
      cafe: '咖啡馆',
      park: '公园',
      store: '商店'
    };
    return labels[locationType as keyof typeof labels] || locationType;
  }

  private getActivityLabel(activity: string): string {
    const labels = {
      working: '工作',
      exercising: '锻炼',
      relaxing: '放松',
      learning: '学习',
      socializing: '社交',
      commuting: '通勤'
    };
    return labels[activity as keyof typeof labels] || activity;
  }

  async getContextAwarenessScore(): Promise<number> {
    // 模拟用户ID
    const userId = 'mock-user-id';

    try {
      const contextHistory = await this.getContextHistory(30);
      const rules = await this.getUserContextRules(userId);

      // 计算上下文数据的丰富度
      const dataRichness = this.calculateDataRichness(contextHistory);

      // 计算规则的有效性
      const ruleEffectiveness = this.calculateRuleEffectiveness(rules, contextHistory);

      // 计算情境感知的整体得分
      const score = (dataRichness * 0.6) + (ruleEffectiveness * 0.4);

      return Math.min(Math.max(score, 0), 100);
    } catch (error) {
      console.error('Error calculating context awareness score:', error);
      return 0;
    }
  }

  private calculateDataRichness(contextHistory: UserContext[]): number {
    if (contextHistory.length === 0) return 0;

    const dataPoints = contextHistory.reduce((total, ctx) => {
      let count = 0;
      if (ctx.context.timeOfDay) count++;
      if (ctx.context.dayOfWeek) count++;
      if (ctx.context.location) count++;
      if (ctx.context.activity) count++;
      if (ctx.context.deviceInfo) count++;
      if (ctx.context.appUsage) count++;
      if (ctx.context.weather) count++;
      if (ctx.context.mood !== undefined) count++;
      return total + count;
    }, 0);

    const averageDataPoints = dataPoints / contextHistory.length;
    return (averageDataPoints / 8) * 100; // 8个可能的数据点
  }

  private calculateRuleEffectiveness(rules: ContextRule[], contextHistory: UserContext[]): number {
    if (rules.length === 0) return 0;

    const enabledRules = rules.filter(rule => rule.enabled);
    if (enabledRules.length === 0) return 0;

    // 计算规则的适用频率
    const applicableRuleCount = enabledRules.reduce((count, rule) => {
      return count + contextHistory.filter(ctx => 
        this.isRuleApplicable(rule, ctx.context)
      ).length;
    }, 0);

    const effectiveness = applicableRuleCount / (enabledRules.length * contextHistory.length);
    return effectiveness * 100;
  }
}

export const contextService = new ContextService();
