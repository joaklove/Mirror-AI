// 可持续生活服务
// 提供环境影响追踪、可持续生活建议、碳足迹计算等功能

// 可持续生活数据类型
export type SustainabilityDataType = 'carbon' | 'energy' | 'water' | 'waste' | 'transportation' | 'food' | 'consumption';

// 可持续生活数据接口
export interface SustainabilityData {
  id: string;
  type: SustainabilityDataType;
  value: number;
  unit: string;
  date: string;
  time?: string;
  notes?: string;
  tags: string[];
  source: 'manual' | 'device' | 'app';
  impact: 'low' | 'medium' | 'high';
}

// 可持续生活指标接口
export interface SustainabilityMetric {
  id: string;
  name: string;
  type: SustainabilityDataType;
  unit: string;
  normalRange: { min: number; max: number };
  idealValue?: number;
  description: string;
  frequency: string;
  importance: 'low' | 'medium' | 'high';
  relatedMetrics: string[];
  environmentalImpact: string;
  improvementTips: string[];
}

// 可持续生活习惯类型
export type SustainableHabitType = 'energy' | 'water' | 'waste' | 'transportation' | 'food' | 'consumption' | 'other';

// 可持续生活习惯接口
export interface SustainableHabit {
  id: string;
  name: string;
  description: string;
  type: SustainableHabitType;
  frequency: number;
  days?: number[];
  startDate: string;
  streak: number;
  totalCompletions: number;
  completionRate: number;
  lastCompleted?: string;
  nextDue?: string;
  benefits: string[];
  environmentalImpact: string;
  carbonReduction?: number;
  reminders: boolean;
  reminderTime?: string;
  color: string;
  icon: string;
}

// 可持续生活知识文章接口
export interface SustainableArticle {
  id: string;
  title: string;
  content: string;
  author: string;
  publishDate: string;
  category: string;
  tags: string[];
  readingTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  source: string;
  relatedArticles: string[];
  references: string[];
  environmentalImpact: string;
  practicalTips: string[];
}

// 碳足迹接口
export interface CarbonFootprint {
  id: string;
  date: string;
  totalEmissions: number;
  breakdown: {
    category: string;
    emissions: number;
    percentage: number;
  }[];
  trends: {
    period: 'week' | 'month' | 'year';
    change: number;
    direction: 'increase' | 'decrease' | 'stable';
  };
  recommendations: string[];
  improvementAreas: string[];
  notes?: string;
}

// 可持续生活挑战接口
export interface SustainabilityChallenge {
  id: string;
  name: string;
  description: string;
  duration: number; // 天数
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  startDate?: string;
  endDate?: string;
  completed: boolean;
  progress: number;
  participants: number;
  successRate: number;
  benefits: string[];
  tips: string[];
  icon: string;
  color: string;
}

// 可持续消费产品接口
export interface SustainableProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  brand: string;
  sustainabilityRating: number; // 1-5
  certifications: string[];
  environmentalImpact: string;
  alternatives: string[];
  purchaseLink?: string;
  imageUrl?: string;
  tags: string[];
}

// 可持续生活社区活动接口
export interface SustainabilityEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'online' | 'in-person';
  organizer: string;
  participants: number;
  maxParticipants?: number;
  registrationLink?: string;
  category: string;
  tags: string[];
  imageUrl?: string;
}

// 模拟数据存储
class MockSustainabilityStorage {
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

  async delete(path: string): Promise<void> {
    delete this.data[path];
  }
}

class SustainableService {
  private storage = new MockSustainabilityStorage();

  // 记录可持续生活数据
  async recordSustainabilityData(data: Omit<SustainabilityData, 'id'>): Promise<SustainabilityData> {
    const newData: SustainabilityData = {
      ...data,
      id: `sustainability-data-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    await this.storage.set(`sustainability-data/${newData.id}`, newData);
    return newData;
  }

  // 获取可持续生活数据
  async getSustainabilityData(type?: SustainabilityDataType, startDate?: string, endDate?: string): Promise<SustainabilityData[]> {
    // 模拟可持续生活数据
    const mockData: SustainabilityData[] = [
      {
        id: 'sustainability-data-1',
        type: 'carbon',
        value: 4.5,
        unit: 'kg CO2',
        date: '2024-02-15',
        time: '22:00',
        notes: '今日碳足迹',
        tags: ['碳足迹', '环境'],
        source: 'manual',
        impact: 'medium'
      },
      {
        id: 'sustainability-data-2',
        type: 'energy',
        value: 8.2,
        unit: 'kWh',
        date: '2024-02-15',
        time: '22:00',
        notes: '今日能源消耗',
        tags: ['能源', '电力'],
        source: 'manual',
        impact: 'medium'
      },
      {
        id: 'sustainability-data-3',
        type: 'water',
        value: 120,
        unit: 'L',
        date: '2024-02-15',
        time: '22:00',
        notes: '今日用水量',
        tags: ['水资源', '消耗'],
        source: 'manual',
        impact: 'low'
      },
      {
        id: 'sustainability-data-4',
        type: 'waste',
        value: 1.2,
        unit: 'kg',
        date: '2024-02-15',
        time: '22:00',
        notes: '今日垃圾产生量',
        tags: ['垃圾', '回收'],
        source: 'manual',
        impact: 'medium'
      },
      {
        id: 'sustainability-data-5',
        type: 'transportation',
        value: 15,
        unit: 'km',
        date: '2024-02-15',
        time: '22:00',
        notes: '今日出行距离',
        tags: ['交通', '出行'],
        source: 'manual',
        impact: 'low'
      }
    ];
    
    return mockData;
  }

  // 获取可持续生活指标
  async getSustainabilityMetrics(): Promise<SustainabilityMetric[]> {
    // 模拟可持续生活指标
    const mockMetrics: SustainabilityMetric[] = [
      {
        id: 'sustainability-metric-1',
        name: '碳足迹',
        type: 'carbon',
        unit: 'kg CO2',
        normalRange: { min: 0, max: 10 },
        idealValue: 2,
        description: '每日碳排放量',
        frequency: '每天',
        importance: 'high',
        relatedMetrics: ['sustainability-metric-5', 'sustainability-metric-6'],
        environmentalImpact: '碳排放是气候变化的主要原因之一',
        improvementTips: ['减少使用私家车', '选择可再生能源', '减少肉类消费']
      },
      {
        id: 'sustainability-metric-2',
        name: '能源消耗',
        type: 'energy',
        unit: 'kWh',
        normalRange: { min: 0, max: 20 },
        idealValue: 5,
        description: '每日能源消耗',
        frequency: '每天',
        importance: 'high',
        relatedMetrics: ['sustainability-metric-1'],
        environmentalImpact: '能源消耗会导致温室气体排放',
        improvementTips: ['关闭不必要的电器', '使用节能电器', '利用自然光']
      },
      {
        id: 'sustainability-metric-3',
        name: '用水量',
        type: 'water',
        unit: 'L',
        normalRange: { min: 0, max: 500 },
        idealValue: 150,
        description: '每日用水量',
        frequency: '每天',
        importance: 'medium',
        relatedMetrics: ['sustainability-metric-4'],
        environmentalImpact: '水资源短缺是全球性问题',
        improvementTips: ['缩短淋浴时间', '修复漏水龙头', '收集雨水']
      },
      {
        id: 'sustainability-metric-4',
        name: '垃圾产生量',
        type: 'waste',
        unit: 'kg',
        normalRange: { min: 0, max: 5 },
        idealValue: 1,
        description: '每日垃圾产生量',
        frequency: '每天',
        importance: 'medium',
        relatedMetrics: ['sustainability-metric-6'],
        environmentalImpact: '垃圾填埋会污染土壤和地下水',
        improvementTips: ['减少一次性物品使用', '分类回收', '堆肥有机垃圾']
      },
      {
        id: 'sustainability-metric-5',
        name: '交通出行',
        type: 'transportation',
        unit: 'km',
        normalRange: { min: 0, max: 100 },
        idealValue: 10,
        description: '每日出行距离',
        frequency: '每天',
        importance: 'medium',
        relatedMetrics: ['sustainability-metric-1'],
        environmentalImpact: '交通是碳排放的主要来源之一',
        improvementTips: ['使用公共交通', '骑自行车或步行', '拼车']
      },
      {
        id: 'sustainability-metric-6',
        name: '食物消费',
        type: 'food',
        unit: 'kg',
        normalRange: { min: 0, max: 5 },
        idealValue: 2,
        description: '每日食物消费量',
        frequency: '每天',
        importance: 'medium',
        relatedMetrics: ['sustainability-metric-1', 'sustainability-metric-4'],
        environmentalImpact: '食物生产和运输会产生碳排放',
        improvementTips: ['减少肉类消费', '选择当地食材', '减少食物浪费']
      }
    ];
    
    return mockMetrics;
  }

  // 创建可持续生活习惯
  async createSustainableHabit(habit: Omit<SustainableHabit, 'id' | 'streak' | 'totalCompletions' | 'completionRate'>): Promise<SustainableHabit> {
    const newHabit: SustainableHabit = {
      ...habit,
      id: `sustainable-habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      streak: 0,
      totalCompletions: 0,
      completionRate: 0
    };
    
    await this.storage.set(`sustainable-habits/${newHabit.id}`, newHabit);
    return newHabit;
  }

  // 获取可持续生活习惯
  async getSustainableHabits(): Promise<SustainableHabit[]> {
    // 模拟可持续生活习惯
    const mockHabits: SustainableHabit[] = [
      {
        id: 'sustainable-habit-1',
        name: '绿色出行',
        description: '每周至少3天使用公共交通、骑自行车或步行',
        type: 'transportation',
        frequency: 3,
        days: [1, 3, 5],
        startDate: '2024-01-01',
        streak: 12,
        totalCompletions: 40,
        completionRate: 67,
        lastCompleted: '2024-02-14',
        nextDue: '2024-02-16',
        benefits: ['减少碳排放', '锻炼身体', '节省交通费用'],
        environmentalImpact: '减少交通碳排放',
        carbonReduction: 0.5,
        reminders: true,
        reminderTime: '07:00',
        color: '#4CAF50',
        icon: 'bicycle'
      },
      {
        id: 'sustainable-habit-2',
        name: '节水行动',
        description: '每日淋浴时间不超过10分钟',
        type: 'water',
        frequency: 1,
        startDate: '2024-01-01',
        streak: 8,
        totalCompletions: 30,
        completionRate: 50,
        lastCompleted: '2024-02-13',
        nextDue: '2024-02-16',
        benefits: ['节约水资源', '减少水费', '保护环境'],
        environmentalImpact: '节约水资源',
        reminders: true,
        reminderTime: '08:00',
        color: '#2196F3',
        icon: 'droplets'
      },
      {
        id: 'sustainable-habit-3',
        name: '垃圾分类',
        description: '每日正确分类垃圾',
        type: 'waste',
        frequency: 1,
        startDate: '2024-01-01',
        streak: 15,
        totalCompletions: 45,
        completionRate: 75,
        lastCompleted: '2024-02-15',
        nextDue: '2024-02-16',
        benefits: ['减少垃圾填埋', '促进资源回收', '保护环境'],
        environmentalImpact: '促进资源回收利用',
        reminders: true,
        reminderTime: '20:00',
        color: '#FF9800',
        icon: 'recycle'
      },
      {
        id: 'sustainable-habit-4',
        name: '减少肉类消费',
        description: '每周至少2天素食',
        type: 'food',
        frequency: 2,
        days: [2, 4],
        startDate: '2024-01-01',
        streak: 5,
        totalCompletions: 20,
        completionRate: 33,
        lastCompleted: '2024-02-12',
        nextDue: '2024-02-16',
        benefits: ['减少碳排放', '改善健康', '节约资源'],
        environmentalImpact: '减少畜牧业碳排放',
        carbonReduction: 0.3,
        reminders: true,
        reminderTime: '09:00',
        color: '#8BC34A',
        icon: 'leaf'
      }
    ];
    
    return mockHabits;
  }

  // 记录可持续生活习惯完成情况
  async recordSustainableHabitCompletion(habitId: string, date: string, completed: boolean, notes?: string): Promise<void> {
    try {
      // 在实际应用中，这里会记录可持续生活习惯完成情况
      console.log(`Recording sustainable habit ${habitId} completion for ${date}: ${completed}`, { notes });
    } catch (error) {
      console.error('Error recording sustainable habit completion:', error);
      throw error;
    }
  }

  // 获取可持续生活知识文章
  async getSustainableArticles(): Promise<SustainableArticle[]> {
    // 模拟可持续生活知识文章
    const mockArticles: SustainableArticle[] = [
      {
        id: 'sustainable-article-1',
        title: '如何减少你的碳足迹',
        content: '碳足迹是指个人、组织或产品在生命周期中直接或间接产生的温室气体排放总量。减少碳足迹是应对气候变化的重要措施之一。本文将介绍一些简单有效的方法，帮助你减少日常生活中的碳排放。',
        author: '环保专家',
        publishDate: '2024-02-01',
        category: '碳足迹',
        tags: ['碳排放', '气候变化', '可持续生活'],
        readingTime: '6分钟',
        difficulty: 'beginner',
        source: '环保生活杂志',
        relatedArticles: ['sustainable-article-2', 'sustainable-article-3'],
        references: ['https://example.com/carbon-footprint-1', 'https://example.com/carbon-footprint-2'],
        environmentalImpact: '减少碳足迹可以减缓气候变化',
        practicalTips: ['使用公共交通或骑自行车', '减少肉类消费', '节约能源', '选择可再生能源']
      },
      {
        id: 'sustainable-article-2',
        title: '零浪费生活指南',
        content: '零浪费生活是一种尽可能减少垃圾产生的生活方式。通过减少、重复使用和回收，我们可以显著减少对环境的影响。本文将介绍零浪费生活的基本原则和实用技巧。',
        author: '可持续生活专家',
        publishDate: '2024-02-05',
        category: '垃圾减少',
        tags: ['零浪费', '垃圾减少', '可持续生活'],
        readingTime: '8分钟',
        difficulty: 'intermediate',
        source: '可持续生活博客',
        relatedArticles: ['sustainable-article-1', 'sustainable-article-4'],
        references: ['https://example.com/zero-waste-1', 'https://example.com/zero-waste-2'],
        environmentalImpact: '减少垃圾可以减少对土地和水资源的污染',
        practicalTips: ['使用可重复使用的购物袋', '避免使用一次性餐具', '自制食品', '堆肥有机垃圾']
      },
      {
        id: 'sustainable-article-3',
        title: '可持续饮食指南',
        content: '饮食对环境有着重要影响。通过选择可持续的食物，我们可以减少碳排放、节约水资源和保护生物多样性。本文将介绍如何制定可持续的饮食计划。',
        author: '营养师',
        publishDate: '2024-02-10',
        category: '食物',
        tags: ['可持续饮食', '素食', '环保'],
        readingTime: '7分钟',
        difficulty: 'beginner',
        source: '健康生活杂志',
        relatedArticles: ['sustainable-article-1', 'sustainable-article-5'],
        references: ['https://example.com/sustainable-food-1', 'https://example.com/sustainable-food-2'],
        environmentalImpact: '可持续饮食可以减少碳排放和水资源消耗',
        practicalTips: ['增加植物性食物的比例', '选择当地和季节性食材', '减少食物浪费', '选择有机食品']
      }
    ];
    
    return mockArticles;
  }

  // 计算碳足迹
  async calculateCarbonFootprint(): Promise<CarbonFootprint> {
    // 模拟碳足迹计算
    const mockFootprint: CarbonFootprint = {
      id: 'carbon-footprint-1',
      date: '2024-02-15',
      totalEmissions: 4.5,
      breakdown: [
        {
          category: '交通',
          emissions: 2.0,
          percentage: 44.4
        },
        {
          category: '家庭能源',
          emissions: 1.5,
          percentage: 33.3
        },
        {
          category: '食物',
          emissions: 0.8,
          percentage: 17.8
        },
        {
          category: '其他',
          emissions: 0.2,
          percentage: 4.5
        }
      ],
      trends: {
        period: 'week',
        change: -0.5,
        direction: 'decrease'
      },
      recommendations: [
        '减少使用私家车，选择公共交通或骑自行车',
        '关闭不必要的电器，节约能源',
        '减少肉类消费，增加植物性食物的比例'
      ],
      improvementAreas: ['交通', '家庭能源'],
      notes: '本周碳足迹较上周有所减少，继续保持良好的环保习惯'
    };
    
    return mockFootprint;
  }

  // 获取可持续生活挑战
  async getSustainabilityChallenges(): Promise<SustainabilityChallenge[]> {
    // 模拟可持续生活挑战
    const mockChallenges: SustainabilityChallenge[] = [
      {
        id: 'sustainability-challenge-1',
        name: '一周无肉挑战',
        description: '连续7天不食用肉类产品，体验素食生活',
        duration: 7,
        difficulty: 'medium',
        category: '食物',
        startDate: '2024-02-16',
        endDate: '2024-02-22',
        completed: false,
        progress: 0,
        participants: 156,
        successRate: 65,
        benefits: ['减少碳排放', '改善健康', '发现新的食谱'],
        tips: ['提前规划食谱', '选择富含蛋白质的植物性食物', '寻找支持性社区'],
        icon: 'leaf',
        color: '#4CAF50'
      },
      {
        id: 'sustainability-challenge-2',
        name: '零垃圾一周',
        description: '连续7天不产生任何垃圾，体验零浪费生活',
        duration: 7,
        difficulty: 'hard',
        category: '垃圾减少',
        startDate: '2024-02-16',
        endDate: '2024-02-22',
        completed: false,
        progress: 0,
        participants: 89,
        successRate: 42,
        benefits: ['减少对环境的影响', '培养节约意识', '节省开支'],
        tips: ['使用可重复使用的购物袋和水瓶', '避免使用一次性产品', '自制食品', '堆肥有机垃圾'],
        icon: 'recycle',
        color: '#FF9800'
      },
      {
        id: 'sustainability-challenge-3',
        name: '节能挑战',
        description: '连续7天减少能源使用，降低电费开支',
        duration: 7,
        difficulty: 'easy',
        category: '能源',
        startDate: '2024-02-16',
        endDate: '2024-02-22',
        completed: false,
        progress: 0,
        participants: 234,
        successRate: 85,
        benefits: ['减少碳排放', '节省电费', '培养节能习惯'],
        tips: ['关闭不必要的电器', '使用节能灯泡', '减少使用空调和暖气', '利用自然光'],
        icon: 'lightbulb',
        color: '#2196F3'
      }
    ];
    
    return mockChallenges;
  }

  // 获取可持续消费产品
  async getSustainableProducts(): Promise<SustainableProduct[]> {
    // 模拟可持续消费产品
    const mockProducts: SustainableProduct[] = [
      {
        id: 'sustainable-product-1',
        name: '可重复使用购物袋',
        description: '由回收材料制成的可重复使用购物袋，坚固耐用，可多次使用',
        category: '日常用品',
        price: 29.9,
        currency: 'CNY',
        brand: '绿色生活',
        sustainabilityRating: 5,
        certifications: ['GOTS认证', 'Fair Trade认证'],
        environmentalImpact: '减少一次性塑料袋的使用，降低塑料污染',
        alternatives: ['一次性塑料袋', '纸质购物袋'],
        purchaseLink: 'https://example.com/product-1',
        tags: ['可重复使用', '塑料替代', '环保']
      },
      {
        id: 'sustainable-product-2',
        name: '竹制餐具套装',
        description: '由天然竹子制成的餐具套装，包括叉子、勺子和刀子',
        category: '厨房用品',
        price: 49.9,
        currency: 'CNY',
        brand: '自然之家',
        sustainabilityRating: 4,
        certifications: ['FSC认证'],
        environmentalImpact: '减少一次性餐具的使用，降低塑料污染',
        alternatives: ['塑料餐具', '不锈钢餐具'],
        purchaseLink: 'https://example.com/product-2',
        tags: ['可重复使用', '塑料替代', '天然材料']
      },
      {
        id: 'sustainable-product-3',
        name: '有机棉T恤',
        description: '由100%有机棉制成的T恤，不含有害化学物质',
        category: '服装',
        price: 99.9,
        currency: 'CNY',
        brand: '环保时尚',
        sustainabilityRating: 4,
        certifications: ['GOTS认证'],
        environmentalImpact: '减少农药和化肥的使用，保护土壤和水资源',
        alternatives: ['常规棉T恤', '合成纤维T恤'],
        purchaseLink: 'https://example.com/product-3',
        tags: ['有机', '可持续时尚', '环保']
      }
    ];
    
    return mockProducts;
  }

  // 获取可持续生活社区活动
  async getSustainabilityEvents(): Promise<SustainabilityEvent[]> {
    // 模拟可持续生活社区活动
    const mockEvents: SustainabilityEvent[] = [
      {
        id: 'sustainability-event-1',
        name: '环保志愿活动',
        description: '参与社区清洁活动，共同维护环境整洁',
        date: '2024-02-17',
        time: '09:00',
        location: '城市公园',
        type: 'in-person',
        organizer: '环保协会',
        participants: 45,
        maxParticipants: 100,
        registrationLink: 'https://example.com/event-1',
        category: '社区活动',
        tags: ['志愿活动', '清洁', '社区']
      },
      {
        id: 'sustainability-event-2',
        name: '可持续生活讲座',
        description: '了解可持续生活的基本原则和实用技巧',
        date: '2024-02-18',
        time: '19:00',
        location: '线上',
        type: 'online',
        organizer: '可持续生活中心',
        participants: 120,
        registrationLink: 'https://example.com/event-2',
        category: '教育活动',
        tags: ['讲座', '教育', '线上活动']
      },
      {
        id: 'sustainability-event-3',
        name: '有机市场',
        description: '购买当地有机农产品，支持可持续农业',
        date: '2024-02-19',
        time: '10:00',
        location: '社区广场',
        type: 'in-person',
        organizer: '当地农民协会',
        participants: 80,
        category: '市场活动',
        tags: ['有机', '当地', '市场']
      }
    ];
    
    return mockEvents;
  }

  // 生成可持续生活建议
  async generateSustainabilityRecommendations(): Promise<string[]> {
    // 模拟可持续生活建议
    const recommendations: string[] = [
      '减少使用私家车，选择公共交通、骑自行车或步行',
      '节约能源，关闭不必要的电器，使用节能电器',
      '节约水资源，缩短淋浴时间，修复漏水龙头',
      '减少垃圾产生，使用可重复使用的产品，分类回收',
      '减少肉类消费，增加植物性食物的比例',
      '选择当地和季节性食材，减少食物运输的碳排放',
      '减少食物浪费，合理规划饮食，保存剩余食物',
      '支持可持续品牌，选择环保认证的产品'
    ];
    
    return recommendations;
  }

  // 生成可持续生活报告
  async generateSustainabilityReport(period: 'week' | 'month' | 'year', startDate: string, endDate: string): Promise<any> {
    // 模拟可持续生活报告
    const mockReport = {
      id: 'sustainability-report-1',
      title: `${period === 'week' ? '周' : period === 'month' ? '月' : '年'}度可持续生活报告`,
      date: '2024-02-15',
      period,
      metrics: [
        {
          metricId: 'sustainability-metric-1',
          name: '碳足迹',
          averageValue: 4.5,
          minValue: 3.2,
          maxValue: 5.8,
          trend: 'declining',
          status: 'medium',
          notes: '碳足迹有所减少，但仍需进一步改善'
        },
        {
          metricId: 'sustainability-metric-2',
          name: '能源消耗',
          averageValue: 8.2,
          minValue: 6.5,
          maxValue: 9.8,
          trend: 'stable',
          status: 'medium',
          notes: '能源消耗保持稳定'
        },
        {
          metricId: 'sustainability-metric-3',
          name: '用水量',
          averageValue: 120,
          minValue: 100,
          maxValue: 150,
          trend: 'improving',
          status: 'low',
          notes: '用水量在合理范围内'
        },
        {
          metricId: 'sustainability-metric-4',
          name: '垃圾产生量',
          averageValue: 1.2,
          minValue: 0.8,
          maxValue: 1.5,
          trend: 'declining',
          status: 'low',
          notes: '垃圾产生量有所减少'
        }
      ],
      trends: [
        {
          id: 'sustainability-trend-1',
          name: '碳足迹趋势',
          type: 'carbon',
          data: [
            { date: '2024-02-09', value: 4.8 },
            { date: '2024-02-10', value: 4.6 },
            { date: '2024-02-11', value: 4.7 },
            { date: '2024-02-12', value: 4.5 },
            { date: '2024-02-13', value: 4.4 },
            { date: '2024-02-14', value: 4.3 },
            { date: '2024-02-15', value: 4.2 }
          ],
          trend: 'declining',
          description: '碳足迹呈现下降趋势',
          recommendations: ['继续保持绿色出行习惯', '减少能源消耗', '增加植物性食物的比例']
        }
      ],
      insights: [
        '您的碳足迹有所减少，但仍需进一步改善',
        '您的用水量在合理范围内',
        '您的垃圾产生量有所减少',
        '整体可持续生活状况呈现改善趋势'
      ],
      recommendations: [
        '减少使用私家车，选择公共交通或骑自行车',
        '节约能源，关闭不必要的电器',
        '减少肉类消费，增加植物性食物的比例',
        '继续保持垃圾分类的好习惯'
      ],
      achievements: [
        '碳足迹较上周减少了0.6kg CO2',
        '垃圾产生量保持在较低水平',
        '成功坚持了绿色出行的习惯'
      ],
      areasForImprovement: [
        '减少能源消耗',
        '进一步减少肉类消费',
        '增加对当地有机食材的选择'
      ]
    };
    
    return mockReport;
  }
}

export const sustainableService = new SustainableService();