import { JournalEntry } from './journalService';

// 健康数据类型
export type HealthDataType = 'physical' | 'mental' | 'sleep' | 'nutrition' | 'exercise' | 'mood' | 'energy' | 'stress';

// 健康数据接口
export interface HealthData {
  id: string;
  type: HealthDataType;
  value: number;
  unit: string;
  date: string;
  time?: string;
  notes?: string;
  tags: string[];
  source: 'manual' | 'device' | 'app';
}

// 健康指标接口
export interface HealthMetric {
  id: string;
  name: string;
  type: HealthDataType;
  unit: string;
  normalRange: { min: number; max: number };
  idealValue?: number;
  description: string;
  frequency: string;
  importance: 'low' | 'medium' | 'high';
  relatedMetrics: string[];
}

// 健康习惯类型
export type HealthHabitType = 'sleep' | 'nutrition' | 'exercise' | 'hydration' | 'meditation' | 'other';

// 健康习惯接口
export interface HealthHabit {
  id: string;
  name: string;
  description: string;
  type: HealthHabitType;
  frequency: number;
  days?: number[];
  startDate: string;
  streak: number;
  totalCompletions: number;
  completionRate: number;
  lastCompleted?: string;
  nextDue?: string;
  benefits: string[];
  reminders: boolean;
  reminderTime?: string;
  color: string;
  icon: string;
}

// 健康知识文章接口
export interface HealthArticle {
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
}

// 健康风险评估结果接口
export interface HealthRiskAssessment {
  id: string;
  date: string;
  overallRiskScore: number;
  riskFactors: HealthRiskFactor[];
  recommendations: string[];
  nextSteps: string[];
  notes?: string;
}

// 健康风险因素接口
export interface HealthRiskFactor {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  contributingFactors: string[];
  mitigationStrategies: string[];
  relatedMetrics: string[];
}

// 健康目标接口
export interface HealthGoal {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  targetDate: string;
  currentValue: number;
  progress: number;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  type: HealthDataType;
  priority: 'low' | 'medium' | 'high';
  actionItems: HealthActionItem[];
  motivation: string;
  obstacles: string[];
  support: string[];
}

// 健康行动项接口
export interface HealthActionItem {
  id: string;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed: boolean;
  completionDate?: string;
  relatedGoal?: string;
}

// 健康报告接口
export interface HealthReport {
  id: string;
  title: string;
  date: string;
  period: 'week' | 'month' | 'year';
  metrics: HealthMetricReport[];
  trends: HealthTrend[];
  insights: string[];
  recommendations: string[];
  achievements: string[];
  areasForImprovement: string[];
}

// 健康指标报告接口
export interface HealthMetricReport {
  metricId: string;
  name: string;
  averageValue: number;
  minValue: number;
  maxValue: number;
  trend: 'improving' | 'stable' | 'declining';
  status: 'normal' | 'borderline' | 'concerning';
  notes?: string;
}

// 健康趋势接口
export interface HealthTrend {
  id: string;
  name: string;
  type: HealthDataType;
  data: { date: string; value: number }[];
  trend: 'improving' | 'stable' | 'declining';
  description: string;
  recommendations: string[];
}

// 健康设备接口
export interface HealthDevice {
  id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  connected: boolean;
  lastSync: string;
  dataTypes: HealthDataType[];
  batteryLevel?: number;
  firmwareVersion?: string;
}

// 健康提醒接口
export interface HealthReminder {
  id: string;
  name: string;
  description: string;
  type: 'medication' | 'water' | 'exercise' | 'sleep' | 'appointment' | 'other';
  schedule: {
    type: 'daily' | 'weekly' | 'custom';
    time: string;
    days?: number[];
  };
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  nextTrigger?: string;
}

// 模拟数据存储
class MockHealthStorage {
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

class HealthService {
  private storage = new MockHealthStorage();

  // 记录健康数据
  async recordHealthData(data: Omit<HealthData, 'id'>): Promise<HealthData> {
    const newData: HealthData = {
      ...data,
      id: `health-data-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    await this.storage.set(`health-data/${newData.id}`, newData);
    return newData;
  }

  // 获取健康数据
  async getHealthData(type?: HealthDataType, startDate?: string, endDate?: string): Promise<HealthData[]> {
    // 模拟健康数据
    const mockData: HealthData[] = [
      {
        id: 'health-data-1',
        type: 'sleep',
        value: 7.5,
        unit: 'hours',
        date: '2024-02-15',
        time: '07:00',
        notes: '睡眠质量良好',
        tags: ['睡眠', '健康'],
        source: 'manual'
      },
      {
        id: 'health-data-2',
        type: 'exercise',
        value: 30,
        unit: 'minutes',
        date: '2024-02-15',
        time: '18:00',
        notes: '有氧运动',
        tags: ['运动', '健康'],
        source: 'manual'
      },
      {
        id: 'health-data-3',
        type: 'mood',
        value: 8,
        unit: 'score',
        date: '2024-02-15',
        time: '20:00',
        notes: '心情愉快',
        tags: ['情绪', '心理健康'],
        source: 'manual'
      },
      {
        id: 'health-data-4',
        type: 'energy',
        value: 7,
        unit: 'score',
        date: '2024-02-15',
        time: '10:00',
        notes: '精力充沛',
        tags: ['能量', '健康'],
        source: 'manual'
      },
      {
        id: 'health-data-5',
        type: 'stress',
        value: 3,
        unit: 'score',
        date: '2024-02-15',
        time: '12:00',
        notes: '压力较小',
        tags: ['压力', '心理健康'],
        source: 'manual'
      }
    ];
    
    return mockData;
  }

  // 获取健康指标
  async getHealthMetrics(): Promise<HealthMetric[]> {
    // 模拟健康指标
    const mockMetrics: HealthMetric[] = [
      {
        id: 'metric-1',
        name: '睡眠时间',
        type: 'sleep',
        unit: 'hours',
        normalRange: { min: 7, max: 9 },
        idealValue: 8,
        description: '每天的睡眠时间',
        frequency: '每天',
        importance: 'high',
        relatedMetrics: ['metric-7', 'metric-8']
      },
      {
        id: 'metric-2',
        name: '运动时间',
        type: 'exercise',
        unit: 'minutes',
        normalRange: { min: 30, max: 120 },
        idealValue: 60,
        description: '每天的运动时间',
        frequency: '每天',
        importance: 'high',
        relatedMetrics: ['metric-3', 'metric-7']
      },
      {
        id: 'metric-3',
        name: '心率',
        type: 'physical',
        unit: 'bpm',
        normalRange: { min: 60, max: 100 },
        idealValue: 75,
        description: '每分钟心跳次数',
        frequency: '按需',
        importance: 'medium',
        relatedMetrics: ['metric-2', 'metric-8']
      },
      {
        id: 'metric-4',
        name: '体重',
        type: 'physical',
        unit: 'kg',
        normalRange: { min: 50, max: 80 },
        description: '身体重量',
        frequency: '每周',
        importance: 'medium',
        relatedMetrics: ['metric-2', 'metric-5']
      },
      {
        id: 'metric-5',
        name: '饮食质量',
        type: 'nutrition',
        unit: 'score',
        normalRange: { min: 5, max: 10 },
        idealValue: 8,
        description: '饮食的健康程度',
        frequency: '每天',
        importance: 'high',
        relatedMetrics: ['metric-4', 'metric-6']
      },
      {
        id: 'metric-6',
        name: '水分摄入',
        type: 'nutrition',
        unit: 'ml',
        normalRange: { min: 1500, max: 3000 },
        idealValue: 2000,
        description: '每天的水分摄入量',
        frequency: '每天',
        importance: 'medium',
        relatedMetrics: ['metric-5', 'metric-7']
      },
      {
        id: 'metric-7',
        name: '情绪状态',
        type: 'mood',
        unit: 'score',
        normalRange: { min: 5, max: 10 },
        idealValue: 8,
        description: '情绪的好坏程度',
        frequency: '每天',
        importance: 'high',
        relatedMetrics: ['metric-1', 'metric-8']
      },
      {
        id: 'metric-8',
        name: '压力水平',
        type: 'stress',
        unit: 'score',
        normalRange: { min: 0, max: 5 },
        idealValue: 2,
        description: '压力的大小程度',
        frequency: '每天',
        importance: 'high',
        relatedMetrics: ['metric-1', 'metric-7']
      }
    ];
    
    return mockMetrics;
  }

  // 创建健康习惯
  async createHealthHabit(habit: Omit<HealthHabit, 'id' | 'streak' | 'totalCompletions' | 'completionRate'>): Promise<HealthHabit> {
    const newHabit: HealthHabit = {
      ...habit,
      id: `health-habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      streak: 0,
      totalCompletions: 0,
      completionRate: 0
    };
    
    await this.storage.set(`health-habits/${newHabit.id}`, newHabit);
    return newHabit;
  }

  // 获取健康习惯
  async getHealthHabits(): Promise<HealthHabit[]> {
    // 模拟健康习惯
    const mockHabits: HealthHabit[] = [
      {
        id: 'health-habit-1',
        name: '早睡早起',
        description: '每天晚上11点前睡觉，早上7点前起床',
        type: 'sleep',
        frequency: 1,
        startDate: '2024-01-01',
        streak: 15,
        totalCompletions: 45,
        completionRate: 75,
        lastCompleted: '2024-02-15',
        nextDue: '2024-02-16',
        benefits: ['提高睡眠质量', '增强精力', '改善心情'],
        reminders: true,
        reminderTime: '22:30',
        color: '#4ECDC4',
        icon: 'moon'
      },
      {
        id: 'health-habit-2',
        name: '每日运动',
        description: '每天进行30分钟的有氧运动',
        type: 'exercise',
        frequency: 1,
        startDate: '2024-01-01',
        streak: 10,
        totalCompletions: 35,
        completionRate: 58,
        lastCompleted: '2024-02-14',
        nextDue: '2024-02-16',
        benefits: ['增强体质', '提高心肺功能', '减轻压力'],
        reminders: true,
        reminderTime: '18:00',
        color: '#FF6B6B',
        icon: 'dumbbell'
      },
      {
        id: 'health-habit-3',
        name: '多喝水',
        description: '每天喝够2000ml水',
        type: 'hydration',
        frequency: 1,
        startDate: '2024-01-01',
        streak: 8,
        totalCompletions: 30,
        completionRate: 50,
        lastCompleted: '2024-02-13',
        nextDue: '2024-02-16',
        benefits: ['保持水分', '促进代谢', '改善皮肤'],
        reminders: true,
        reminderTime: '10:00',
        color: '#45B7D1',
        icon: 'droplets'
      },
      {
        id: 'health-habit-4',
        name: '冥想',
        description: '每天进行10分钟的冥想',
        type: 'meditation',
        frequency: 1,
        startDate: '2024-01-01',
        streak: 5,
        totalCompletions: 20,
        completionRate: 33,
        lastCompleted: '2024-02-12',
        nextDue: '2024-02-16',
        benefits: ['减轻压力', '提高专注力', '改善情绪'],
        reminders: true,
        reminderTime: '20:00',
        color: '#96CEB4',
        icon: 'brain'
      }
    ];
    
    return mockHabits;
  }

  // 记录健康习惯完成情况
  async recordHealthHabitCompletion(habitId: string, date: string, completed: boolean, notes?: string): Promise<void> {
    try {
      // 在实际应用中，这里会记录健康习惯完成情况
      console.log(`Recording health habit ${habitId} completion for ${date}: ${completed}`, { notes });
    } catch (error) {
      console.error('Error recording health habit completion:', error);
      throw error;
    }
  }

  // 获取健康知识文章
  async getHealthArticles(): Promise<HealthArticle[]> {
    // 模拟健康知识文章
    const mockArticles: HealthArticle[] = [
      {
        id: 'article-1',
        title: '如何改善睡眠质量',
        content: '睡眠是健康的重要组成部分，良好的睡眠质量对身体和心理健康都至关重要。本文将介绍一些改善睡眠质量的方法，包括保持规律的睡眠时间、创建舒适的睡眠环境、避免睡前使用电子设备等。',
        author: '健康专家',
        publishDate: '2024-02-01',
        category: '睡眠',
        tags: ['睡眠', '健康', '生活方式'],
        readingTime: '5分钟',
        difficulty: 'beginner',
        source: '健康生活杂志',
        relatedArticles: ['article-2', 'article-3'],
        references: ['https://example.com/sleep-study-1', 'https://example.com/sleep-study-2']
      },
      {
        id: 'article-2',
        title: '健康饮食的基本原则',
        content: '健康的饮食对维持身体健康至关重要。本文将介绍健康饮食的基本原则，包括均衡摄入各类营养素、多吃蔬菜水果、控制盐分和糖分的摄入、保持适当的饮水量等。',
        author: '营养专家',
        publishDate: '2024-02-05',
        category: '营养',
        tags: ['饮食', '营养', '健康'],
        readingTime: '6分钟',
        difficulty: 'beginner',
        source: '营养学会',
        relatedArticles: ['article-1', 'article-4'],
        references: ['https://example.com/nutrition-guide-1', 'https://example.com/nutrition-guide-2']
      },
      {
        id: 'article-3',
        title: '适合初学者的运动计划',
        content: '定期运动对身体健康非常重要，但对于初学者来说，制定合适的运动计划至关重要。本文将介绍适合初学者的运动计划，包括运动类型的选择、运动强度的控制、运动时间的安排等。',
        author: '运动专家',
        publishDate: '2024-02-10',
        category: '运动',
        tags: ['运动', '健康', '初学者'],
        readingTime: '7分钟',
        difficulty: 'beginner',
        source: '运动健康协会',
        relatedArticles: ['article-1', 'article-5'],
        references: ['https://example.com/exercise-guide-1', 'https://example.com/exercise-guide-2']
      }
    ];
    
    return mockArticles;
  }

  // 生成健康风险评估
  async generateHealthRiskAssessment(): Promise<HealthRiskAssessment> {
    // 模拟健康风险评估
    const mockAssessment: HealthRiskAssessment = {
      id: 'assessment-1',
      date: '2024-02-15',
      overallRiskScore: 35,
      riskFactors: [
        {
          id: 'risk-1',
          name: '睡眠不足',
          description: '最近的睡眠记录显示您的睡眠时间不足7小时',
          riskLevel: 'medium',
          contributingFactors: ['工作压力', '睡前使用电子设备'],
          mitigationStrategies: ['保持规律的睡眠时间', '睡前避免使用电子设备', '创建舒适的睡眠环境'],
          relatedMetrics: ['metric-1', 'metric-7']
        },
        {
          id: 'risk-2',
          name: '运动不足',
          description: '最近的运动记录显示您的运动时间不足30分钟',
          riskLevel: 'medium',
          contributingFactors: ['工作繁忙', '缺乏运动动力'],
          mitigationStrategies: ['制定合理的运动计划', '选择自己喜欢的运动方式', '寻找运动伙伴'],
          relatedMetrics: ['metric-2', 'metric-3']
        }
      ],
      recommendations: [
        '每天保持7-9小时的睡眠时间',
        '每天进行至少30分钟的中等强度运动',
        '保持健康的饮食习惯',
        '定期进行健康检查'
      ],
      nextSteps: [
        '制定个性化的睡眠计划',
        '选择适合自己的运动方式',
        '记录每天的健康数据',
        '3个月后重新进行健康风险评估'
      ],
      notes: '整体健康状况良好，需要注意睡眠和运动习惯的改善'
    };
    
    return mockAssessment;
  }

  // 创建健康目标
  async createHealthGoal(goal: Omit<HealthGoal, 'id' | 'progress'>): Promise<HealthGoal> {
    const progress = goal.currentValue >= goal.targetValue ? 100 : (goal.currentValue / goal.targetValue) * 100;
    const newGoal: HealthGoal = {
      ...goal,
      id: `health-goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      progress
    };
    
    await this.storage.set(`health-goals/${newGoal.id}`, newGoal);
    return newGoal;
  }

  // 获取健康目标
  async getHealthGoals(): Promise<HealthGoal[]> {
    // 模拟健康目标
    const mockGoals: HealthGoal[] = [
      {
        id: 'health-goal-1',
        name: '增加睡眠时间',
        description: '将睡眠时间从目前的6小时增加到8小时',
        targetValue: 8,
        targetDate: '2024-03-15',
        currentValue: 6.5,
        progress: 25,
        status: 'active',
        type: 'sleep',
        priority: 'high',
        actionItems: [
          {
            id: 'action-1-1',
            name: '设定固定的睡觉时间',
            description: '每天晚上11点前睡觉',
            priority: 'high',
            dueDate: '2024-02-20',
            completed: false
          },
          {
            id: 'action-1-2',
            name: '睡前放松',
            description: '睡前1小时进行放松活动，如阅读或冥想',
            priority: 'medium',
            dueDate: '2024-02-25',
            completed: false
          }
        ],
        motivation: '充足的睡眠有助于提高精力和改善心情',
        obstacles: ['工作压力', '睡前使用电子设备'],
        support: ['睡眠追踪应用', '家人的提醒']
      },
      {
        id: 'health-goal-2',
        name: '增加运动时间',
        description: '将运动时间从目前的20分钟增加到60分钟',
        targetValue: 60,
        targetDate: '2024-03-31',
        currentValue: 30,
        progress: 33,
        status: 'active',
        type: 'exercise',
        priority: 'high',
        actionItems: [
          {
            id: 'action-2-1',
            name: '制定运动计划',
            description: '每周制定详细的运动计划',
            priority: 'high',
            dueDate: '2024-02-20',
            completed: false
          },
          {
            id: 'action-2-2',
            name: '选择喜欢的运动',
            description: '选择自己喜欢的运动方式，提高运动动力',
            priority: 'medium',
            dueDate: '2024-02-25',
            completed: false
          }
        ],
        motivation: '定期运动有助于保持身体健康和减轻压力',
        obstacles: ['工作繁忙', '缺乏运动动力'],
        support: ['运动伙伴', '运动追踪应用']
      }
    ];
    
    return mockGoals;
  }

  // 生成健康报告
  async generateHealthReport(period: 'week' | 'month' | 'year', startDate: string, endDate: string): Promise<HealthReport> {
    // 模拟健康报告
    const mockReport: HealthReport = {
      id: 'report-1',
      title: `${period === 'week' ? '周' : period === 'month' ? '月' : '年'}度健康报告`,
      date: '2024-02-15',
      period,
      metrics: [
        {
          metricId: 'metric-1',
          name: '睡眠时间',
          averageValue: 6.5,
          minValue: 5,
          maxValue: 8,
          trend: 'improving',
          status: 'borderline',
          notes: '睡眠时间有所增加，但仍需改善'
        },
        {
          metricId: 'metric-2',
          name: '运动时间',
          averageValue: 35,
          minValue: 20,
          maxValue: 60,
          trend: 'improving',
          status: 'normal',
          notes: '运动时间基本达标'
        },
        {
          metricId: 'metric-7',
          name: '情绪状态',
          averageValue: 7.5,
          minValue: 5,
          maxValue: 9,
          trend: 'stable',
          status: 'normal',
          notes: '情绪状态良好'
        },
        {
          metricId: 'metric-8',
          name: '压力水平',
          averageValue: 3,
          minValue: 1,
          maxValue: 5,
          trend: 'declining',
          status: 'normal',
          notes: '压力水平有所下降'
        }
      ],
      trends: [
        {
          id: 'trend-1',
          name: '睡眠趋势',
          type: 'sleep',
          data: [
            { date: '2024-02-09', value: 6 },
            { date: '2024-02-10', value: 7 },
            { date: '2024-02-11', value: 6.5 },
            { date: '2024-02-12', value: 7.5 },
            { date: '2024-02-13', value: 6 },
            { date: '2024-02-14', value: 7 },
            { date: '2024-02-15', value: 7.5 }
          ],
          trend: 'improving',
          description: '睡眠时间呈现上升趋势',
          recommendations: ['继续保持规律的睡眠时间', '睡前避免使用电子设备']
        },
        {
          id: 'trend-2',
          name: '运动趋势',
          type: 'exercise',
          data: [
            { date: '2024-02-09', value: 30 },
            { date: '2024-02-10', value: 45 },
            { date: '2024-02-11', value: 30 },
            { date: '2024-02-12', value: 60 },
            { date: '2024-02-13', value: 20 },
            { date: '2024-02-14', value: 40 },
            { date: '2024-02-15', value: 50 }
          ],
          trend: 'improving',
          description: '运动时间呈现上升趋势',
          recommendations: ['继续保持运动习惯', '尝试不同类型的运动']
        }
      ],
      insights: [
        '您的睡眠时间有所增加，但仍需达到7-9小时的目标',
        '您的运动时间基本达标，建议继续保持',
        '您的情绪状态良好，压力水平有所下降',
        '整体健康状况呈现改善趋势'
      ],
      recommendations: [
        '每天保持7-9小时的睡眠时间',
        '每天进行至少30分钟的中等强度运动',
        '保持健康的饮食习惯',
        '定期进行健康检查'
      ],
      achievements: [
        '运动时间达到了每天30分钟的目标',
        '压力水平有所下降',
        '情绪状态保持稳定'
      ],
      areasForImprovement: [
        '增加睡眠时间',
        '提高运动的规律性',
        '加强健康数据的记录'
      ]
    };
    
    return mockReport;
  }

  // 获取健康设备
  async getHealthDevices(): Promise<HealthDevice[]> {
    // 模拟健康设备
    const mockDevices: HealthDevice[] = [
      {
        id: 'device-1',
        name: '智能手表',
        type: 'wearable',
        brand: 'Apple',
        model: 'Watch Series 9',
        connected: true,
        lastSync: '2024-02-15T10:00:00',
        dataTypes: ['physical', 'sleep', 'exercise', 'mood'],
        batteryLevel: 85,
        firmwareVersion: '9.3'
      },
      {
        id: 'device-2',
        name: '智能体重秤',
        type: 'scale',
        brand: 'Withings',
        model: 'Body+',
        connected: true,
        lastSync: '2024-02-14T08:00:00',
        dataTypes: ['physical'],
        batteryLevel: 70,
        firmwareVersion: '2.1'
      }
    ];
    
    return mockDevices;
  }

  // 创建健康提醒
  async createHealthReminder(reminder: Omit<HealthReminder, 'id'>): Promise<HealthReminder> {
    const newReminder: HealthReminder = {
      ...reminder,
      id: `health-reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    await this.storage.set(`health-reminders/${newReminder.id}`, newReminder);
    return newReminder;
  }

  // 获取健康提醒
  async getHealthReminders(): Promise<HealthReminder[]> {
    // 模拟健康提醒
    const mockReminders: HealthReminder[] = [
      {
        id: 'reminder-1',
        name: '喝水提醒',
        description: '每2小时喝一次水',
        type: 'hydration',
        schedule: {
          type: 'daily',
          time: '10:00'
        },
        active: true,
        createdAt: '2024-02-01T00:00:00',
        lastTriggered: '2024-02-15T10:00:00',
        nextTrigger: '2024-02-15T12:00:00'
      },
      {
        id: 'reminder-2',
        name: '运动提醒',
        description: '下午6点进行运动',
        type: 'exercise',
        schedule: {
          type: 'daily',
          time: '18:00'
        },
        active: true,
        createdAt: '2024-02-01T00:00:00',
        lastTriggered: '2024-02-14T18:00:00',
        nextTrigger: '2024-02-15T18:00:00'
      },
      {
        id: 'reminder-3',
        name: '冥想提醒',
        description: '晚上8点进行冥想',
        type: 'meditation',
        schedule: {
          type: 'daily',
          time: '20:00'
        },
        active: true,
        createdAt: '2024-02-01T00:00:00',
        lastTriggered: '2024-02-13T20:00:00',
        nextTrigger: '2024-02-15T20:00:00'
      }
    ];
    
    return mockReminders;
  }

  // 生成健康生活建议
  async generateHealthRecommendations(): Promise<string[]> {
    // 模拟健康生活建议
    const recommendations: string[] = [
      '每天保持7-9小时的睡眠时间，有助于身体和大脑的恢复',
      '每天进行至少30分钟的中等强度运动，如快走、游泳或骑自行车',
      '保持健康的饮食习惯，多吃蔬菜水果，减少加工食品的摄入',
      '每天喝够2000ml水，保持身体水分平衡',
      '定期进行健康检查，及早发现和预防健康问题',
      '学习放松技巧，如冥想、深呼吸或瑜伽，减轻压力',
      '保持社交联系，与家人和朋友保持良好的关系',
      '避免吸烟和过量饮酒，减少对健康的危害'
    ];
    
    return recommendations;
  }
}

export const healthService = new HealthService();
