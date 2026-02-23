import { JournalEntry } from './journalService';

// 目标类型
export type GoalType = 'short-term' | 'medium-term' | 'long-term';

// 目标状态
export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';

// 目标接口
export interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  status: GoalStatus;
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  targetDate: string;
  progress: number;
  milestones: Milestone[];
  actionItems: GoalActionItem[];
  category: string;
  tags: string[];
  motivation: string;
  obstacles: string[];
  support: string[];
  successCriteria: string[];
}

// 里程碑接口
export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  completionDate?: string;
  progress: number;
}

// 目标行动项接口
export interface GoalActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed: boolean;
  completionDate?: string;
  relatedMilestone?: string;
}

// 习惯类型
export type HabitType = 'daily' | 'weekly' | 'custom';

// 习惯接口
export interface Habit {
  id: string;
  title: string;
  description: string;
  type: HabitType;
  frequency: number;
  days?: number[];
  startDate: string;
  streak: number;
  totalCompletions: number;
  completionRate: number;
  lastCompleted?: string;
  nextDue?: string;
  category: string;
  tags: string[];
  motivation: string;
  reminders: boolean;
  reminderTime?: string;
  color: string;
  icon: string;
}

// 习惯记录接口
export interface HabitRecord {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  notes?: string;
  mood?: number;
}

// 技能等级
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// 技能接口
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  progress: number;
  learningResources: LearningResource[];
  practiceActivities: PracticeActivity[];
  achievementHistory: SkillAchievement[];
  tags: string[];
  importance: 'low' | 'medium' | 'high';
  learningGoal: string;
}

// 学习资源接口
export interface LearningResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'course' | 'book' | 'podcast';
  url: string;
  description: string;
  difficulty: SkillLevel;
  duration?: string;
  completed: boolean;
  rating?: number;
}

// 练习活动接口
export interface PracticeActivity {
  id: string;
  title: string;
  description: string;
  difficulty: SkillLevel;
  duration: string;
  frequency: string;
  completed: boolean;
  lastCompleted?: string;
}

// 技能成就接口
export interface SkillAchievement {
  id: string;
  title: string;
  description: string;
  date: string;
  levelAchieved: SkillLevel;
  evidence?: string;
}

// 成就类型
export type AchievementType = 'goal' | 'habit' | 'skill' | 'milestone' | 'custom';

// 成就接口
export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: AchievementType;
  date: string;
  category: string;
  points: number;
  relatedEntity?: string;
  evidence?: string;
  tags: string[];
}

// 学习路径接口
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  skills: string[];
  duration: string;
  difficulty: SkillLevel;
  prerequisites: string[];
  learningResources: LearningResource[];
  practiceActivities: PracticeActivity[];
  milestones: Milestone[];
  completionRate: number;
  startDate?: string;
  completionDate?: string;
}

// 成长洞察接口
export interface GrowthInsight {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  impact: 'low' | 'medium' | 'high';
  relatedGoals: string[];
  relatedHabits: string[];
  relatedSkills: string[];
  actionable: boolean;
  actionSuggestion?: string;
}

// 模拟数据存储
class MockPersonalGrowthStorage {
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

class PersonalGrowthService {
  private storage = new MockPersonalGrowthStorage();

  // 创建目标
  async createGoal(goal: Omit<Goal, 'id' | 'progress'>): Promise<Goal> {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      progress: 0
    };
    
    await this.storage.set(`goals/${newGoal.id}`, newGoal);
    return newGoal;
  }

  // 获取所有目标
  async getGoals(): Promise<Goal[]> {
    // 模拟目标数据
    const mockGoals: Goal[] = [
      {
        id: 'goal-1',
        title: '学习英语',
        description: '提高英语口语和写作能力，达到流利交流的水平',
        type: 'medium-term',
        status: 'active',
        priority: 'high',
        startDate: '2024-01-01',
        targetDate: '2024-06-30',
        progress: 45,
        milestones: [
          {
            id: 'milestone-1-1',
            title: '掌握基础词汇',
            description: '学习并掌握1000个基础英语词汇',
            targetDate: '2024-02-15',
            completed: true,
            completionDate: '2024-02-10',
            progress: 100
          },
          {
            id: 'milestone-1-2',
            title: '提高听力能力',
            description: '能够听懂日常英语对话',
            targetDate: '2024-04-01',
            completed: false,
            progress: 60
          },
          {
            id: 'milestone-1-3',
            title: '流利口语交流',
            description: '能够与外国人进行流利的英语对话',
            targetDate: '2024-06-30',
            completed: false,
            progress: 20
          }
        ],
        actionItems: [
          {
            id: 'action-1-1',
            title: '每天学习30分钟英语',
            description: '使用英语学习APP或教材，每天学习30分钟',
            priority: 'high',
            dueDate: '2024-06-30',
            completed: false
          },
          {
            id: 'action-1-2',
            title: '每周参加英语角',
            description: '每周参加一次英语角活动，练习口语',
            priority: 'medium',
            dueDate: '2024-06-30',
            completed: false
          }
        ],
        category: 'education',
        tags: ['语言学习', '个人发展'],
        motivation: '能够与外国人流利交流，增加职业竞争力',
        obstacles: ['时间不足', '缺乏语言环境'],
        support: ['英语学习APP', '英语角'],
        successCriteria: ['能够听懂日常英语对话', '能够与外国人进行基本交流', '通过英语水平考试']
      },
      {
        id: 'goal-2',
        title: '保持健康体重',
        description: '通过合理饮食和运动，保持健康的体重',
        type: 'long-term',
        status: 'active',
        priority: 'medium',
        startDate: '2024-01-01',
        targetDate: '2024-12-31',
        progress: 30,
        milestones: [
          {
            id: 'milestone-2-1',
            title: '建立运动习惯',
            description: '每天进行30分钟的运动',
            targetDate: '2024-03-01',
            completed: true,
            completionDate: '2024-02-25',
            progress: 100
          },
          {
            id: 'milestone-2-2',
            title: '调整饮食习惯',
            description: '养成健康的饮食习惯，减少高热量食物的摄入',
            targetDate: '2024-06-01',
            completed: false,
            progress: 50
          }
        ],
        actionItems: [
          {
            id: 'action-2-1',
            title: '每天运动30分钟',
            description: '选择适合自己的运动方式，每天坚持30分钟',
            priority: 'high',
            dueDate: '2024-12-31',
            completed: false
          },
          {
            id: 'action-2-2',
            title: '控制饮食',
            description: '减少高热量食物的摄入，增加蔬菜水果的比例',
            priority: 'high',
            dueDate: '2024-12-31',
            completed: false
          }
        ],
        category: 'health',
        tags: ['健康', '运动', '饮食'],
        motivation: '保持健康的身体，提高生活质量',
        obstacles: ['工作繁忙', '美食诱惑'],
        support: ['运动APP', '健康饮食书籍'],
        successCriteria: ['保持健康的体重', '体脂率在正常范围内', '精力充沛']
      }
    ];
    
    return mockGoals;
  }

  // 获取单个目标
  async getGoal(goalId: string): Promise<Goal | null> {
    const goals = await this.getGoals();
    return goals.find(goal => goal.id === goalId) || null;
  }

  // 更新目标
  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
    try {
      // 在实际应用中，这里会更新存储中的目标
      console.log(`Updating goal ${goalId} with:`, updates);
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  // 创建习惯
  async createHabit(habit: Omit<Habit, 'id' | 'streak' | 'totalCompletions' | 'completionRate'>): Promise<Habit> {
    const newHabit: Habit = {
      ...habit,
      id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      streak: 0,
      totalCompletions: 0,
      completionRate: 0
    };
    
    await this.storage.set(`habits/${newHabit.id}`, newHabit);
    return newHabit;
  }

  // 获取习惯
  async getHabits(): Promise<Habit[]> {
    // 模拟习惯数据
    const mockHabits: Habit[] = [
      {
        id: 'habit-1',
        title: '早起',
        description: '每天早上6点起床，开始新的一天',
        type: 'daily',
        frequency: 1,
        startDate: '2024-01-01',
        streak: 15,
        totalCompletions: 45,
        completionRate: 75,
        lastCompleted: '2024-02-15',
        nextDue: '2024-02-16',
        category: 'health',
        tags: ['健康', '习惯'],
        motivation: '早起可以让我有更多时间规划一天的工作和生活',
        reminders: true,
        reminderTime: '05:45',
        color: '#FF6B6B',
        icon: 'sun'
      },
      {
        id: 'habit-2',
        title: '冥想',
        description: '每天进行10分钟的冥想，提高专注力和内心平静',
        type: 'daily',
        frequency: 1,
        startDate: '2024-01-01',
        streak: 8,
        totalCompletions: 30,
        completionRate: 50,
        lastCompleted: '2024-02-14',
        nextDue: '2024-02-16',
        category: 'mental-health',
        tags: ['冥想', '心理健康'],
        motivation: '冥想可以帮助我减轻压力，提高专注力',
        reminders: true,
        reminderTime: '20:00',
        color: '#4ECDC4',
        icon: 'moon'
      },
      {
        id: 'habit-3',
        title: '阅读',
        description: '每周阅读至少3次，每次30分钟',
        type: 'weekly',
        frequency: 3,
        days: [1, 3, 5],
        startDate: '2024-01-01',
        streak: 4,
        totalCompletions: 12,
        completionRate: 60,
        lastCompleted: '2024-02-13',
        nextDue: '2024-02-15',
        category: 'education',
        tags: ['阅读', '学习'],
        motivation: '阅读可以拓展我的知识面，提高思维能力',
        reminders: true,
        reminderTime: '19:00',
        color: '#45B7D1',
        icon: 'book'
      }
    ];
    
    return mockHabits;
  }

  // 记录习惯完成情况
  async recordHabitCompletion(habitId: string, date: string, completed: boolean, notes?: string, mood?: number): Promise<void> {
    try {
      // 在实际应用中，这里会记录习惯完成情况
      console.log(`Recording habit ${habitId} completion for ${date}: ${completed}`, { notes, mood });
    } catch (error) {
      console.error('Error recording habit completion:', error);
      throw error;
    }
  }

  // 获取技能
  async getSkills(): Promise<Skill[]> {
    // 模拟技能数据
    const mockSkills: Skill[] = [
      {
        id: 'skill-1',
        name: '编程',
        description: '学习和掌握各种编程语言和技术',
        category: 'technical',
        currentLevel: 'intermediate',
        targetLevel: 'advanced',
        progress: 60,
        learningResources: [
          {
            id: 'resource-1-1',
            title: 'JavaScript高级编程',
            type: 'book',
            url: 'https://example.com/books/js-advanced',
            description: '深入学习JavaScript的高级特性和最佳实践',
            difficulty: 'intermediate',
            duration: '4周',
            completed: true,
            rating: 4.5
          },
          {
            id: 'resource-1-2',
            title: 'React实战',
            type: 'course',
            url: 'https://example.com/courses/react',
            description: '学习React框架的实战应用',
            difficulty: 'intermediate',
            duration: '6周',
            completed: false
          }
        ],
        practiceActivities: [
          {
            id: 'activity-1-1',
            title: '每日编程练习',
            description: '每天进行30分钟的编程练习',
            difficulty: 'intermediate',
            duration: '30分钟',
            frequency: 'daily',
            completed: true,
            lastCompleted: '2024-02-15'
          },
          {
            id: 'activity-1-2',
            title: '项目实战',
            description: '参与一个实际的编程项目',
            difficulty: 'advanced',
            duration: '2小时',
            frequency: 'weekly',
            completed: false
          }
        ],
        achievementHistory: [
          {
            id: 'achievement-1-1',
            title: 'JavaScript基础掌握',
            description: '完成了JavaScript基础课程的学习',
            date: '2023-12-01',
            levelAchieved: 'beginner'
          },
          {
            id: 'achievement-1-2',
            title: 'React基础掌握',
            description: '完成了React基础课程的学习',
            date: '2024-01-15',
            levelAchieved: 'intermediate'
          }
        ],
        tags: ['编程', '前端', 'JavaScript'],
        importance: 'high',
        learningGoal: '成为一名优秀的前端开发者'
      },
      {
        id: 'skill-2',
        name: '写作',
        description: '提高写作能力，包括文章、报告和创意写作',
        category: 'creative',
        currentLevel: 'beginner',
        targetLevel: 'intermediate',
        progress: 30,
        learningResources: [
          {
            id: 'resource-2-1',
            title: '写作技巧指南',
            type: 'book',
            url: 'https://example.com/books/writing-skills',
            description: '学习基本的写作技巧和方法',
            difficulty: 'beginner',
            duration: '3周',
            completed: true,
            rating: 4.0
          }
        ],
        practiceActivities: [
          {
            id: 'activity-2-1',
            title: '每日写作',
            description: '每天写500字的文章',
            difficulty: 'beginner',
            duration: '30分钟',
            frequency: 'daily',
            completed: false
          }
        ],
        achievementHistory: [],
        tags: ['写作', '创意'],
        importance: 'medium',
        learningGoal: '能够写出清晰、有逻辑的文章'
      }
    ];
    
    return mockSkills;
  }

  // 获取成就
  async getAchievements(): Promise<Achievement[]> {
    // 模拟成就数据
    const mockAchievements: Achievement[] = [
      {
        id: 'achievement-1',
        title: '第一个目标完成',
        description: '完成了第一个长期目标',
        type: 'goal',
        date: '2023-12-31',
        category: 'goal',
        points: 100,
        relatedEntity: 'goal-001',
        tags: ['目标', '成就']
      },
      {
        id: 'achievement-2',
        title: '早起达人',
        description: '连续早起30天',
        type: 'habit',
        date: '2024-01-30',
        category: 'habit',
        points: 50,
        relatedEntity: 'habit-1',
        tags: ['习惯', '早起']
      },
      {
        id: 'achievement-3',
        title: '技能提升',
        description: 'JavaScript技能达到中级水平',
        type: 'skill',
        date: '2024-02-01',
        category: 'skill',
        points: 75,
        relatedEntity: 'skill-1',
        tags: ['技能', '编程']
      }
    ];
    
    return mockAchievements;
  }

  // 创建学习路径
  async createLearningPath(path: Omit<LearningPath, 'id' | 'completionRate'>): Promise<LearningPath> {
    const newPath: LearningPath = {
      ...path,
      id: `path-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completionRate: 0
    };
    
    await this.storage.set(`learning-paths/${newPath.id}`, newPath);
    return newPath;
  }

  // 获取学习路径
  async getLearningPaths(): Promise<LearningPath[]> {
    // 模拟学习路径数据
    const mockPaths: LearningPath[] = [
      {
        id: 'path-1',
        title: '前端开发者路径',
        description: '从零基础到前端开发工程师的学习路径',
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'],
        duration: '6个月',
        difficulty: 'beginner',
        prerequisites: [],
        learningResources: [
          {
            id: 'resource-path-1-1',
            title: 'HTML & CSS基础',
            type: 'course',
            url: 'https://example.com/courses/html-css',
            description: '学习HTML和CSS的基础知识',
            difficulty: 'beginner',
            duration: '4周',
            completed: true,
            rating: 4.5
          },
          {
            id: 'resource-path-1-2',
            title: 'JavaScript基础',
            type: 'course',
            url: 'https://example.com/courses/javascript',
            description: '学习JavaScript的基础知识',
            difficulty: 'beginner',
            duration: '6周',
            completed: true,
            rating: 4.0
          }
        ],
        practiceActivities: [
          {
            id: 'activity-path-1-1',
            title: '构建静态网站',
            description: '使用HTML和CSS构建一个静态网站',
            difficulty: 'beginner',
            duration: '2周',
            frequency: 'daily',
            completed: true,
            lastCompleted: '2024-01-15'
          }
        ],
        milestones: [
          {
            id: 'milestone-path-1-1',
            title: '掌握HTML & CSS',
            description: '能够使用HTML和CSS构建基本的静态网站',
            targetDate: '2024-01-15',
            completed: true,
            completionDate: '2024-01-10',
            progress: 100
          },
          {
            id: 'milestone-path-1-2',
            title: '掌握JavaScript基础',
            description: '能够使用JavaScript实现基本的交互功能',
            targetDate: '2024-02-28',
            completed: false,
            progress: 80
          }
        ],
        completionRate: 30,
        startDate: '2024-01-01'
      }
    ];
    
    return mockPaths;
  }

  // 获取成长洞察
  async getGrowthInsights(): Promise<GrowthInsight[]> {
    // 模拟成长洞察数据
    const mockInsights: GrowthInsight[] = [
      {
        id: 'insight-1',
        title: '习惯养成的关键',
        description: '你在早起习惯上表现出色，连续坚持了15天。研究表明，习惯养成需要21天的持续努力，你已经接近这个目标了。',
        type: 'habit',
        date: '2024-02-15',
        impact: 'medium',
        relatedHabits: ['habit-1'],
        actionable: true,
        actionSuggestion: '继续保持早起的习惯，再坚持6天，你将形成稳定的早起习惯。'
      },
      {
        id: 'insight-2',
        title: '目标进度分析',
        description: '你的英语学习目标目前进度为45%，按照当前的学习速度，你有望在目标日期前完成这个目标。',
        type: 'goal',
        date: '2024-02-15',
        impact: 'low',
        relatedGoals: ['goal-1'],
        actionable: true,
        actionSuggestion: '保持当前的学习节奏，重点关注听力能力的提升，这是你下一个里程碑的目标。'
      },
      {
        id: 'insight-3',
        title: '技能学习建议',
        description: '你在编程技能上的学习进度良好，已经完成了JavaScript基础课程的学习。建议你开始学习React框架，这将对你的前端开发技能有很大帮助。',
        type: 'skill',
        date: '2024-02-10',
        impact: 'high',
        relatedSkills: ['skill-1'],
        actionable: true,
        actionSuggestion: '开始学习React框架，建议使用官方文档和实战项目来加深理解。'
      }
    ];
    
    return mockInsights;
  }

  // 生成个性化成长建议
  async generatePersonalizedGrowthRecommendations(): Promise<string[]> {
    // 模拟个性化成长建议
    const recommendations: string[] = [
      '建议你设定一个具体的学习目标，例如每周学习10个新单词，这样可以更有效地提高英语水平。',
      '你在冥想习惯上的坚持有所松懈，建议你重新安排冥想时间，选择一个你每天都能抽出时间的时段。',
      '根据你的学习进度，建议你开始学习React框架，这将对你的前端开发技能有很大帮助。',
      '你已经连续早起15天了，建议你设定一个新的早起目标，例如每天早起后进行10分钟的晨练。',
      '建议你每周回顾一次你的目标进度，调整行动计划，确保你能在目标日期前完成目标。'
    ];
    
    return recommendations;
  }
}

export const personalGrowthService = new PersonalGrowthService();
