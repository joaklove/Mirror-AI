import { supabase } from '@/integrations/supabase/client';
import { quickAnalysisService } from './quickAnalysisService';

// 健康记录类型定义
export interface HealthRecord {
  id: string;
  user_id: string;
  type: 'sleep' | 'exercise' | 'diet';
  duration?: number; // 分钟
  quality?: 'poor' | 'fair' | 'good' | 'excellent';
  details: string;
  timestamp: string;
  created_at: string;
}

// 财务记录类型定义
export interface FinancialRecord {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  timestamp: string;
  created_at: string;
}

// 预算类型定义
export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  start_date: string;
  end_date: string;
  current_spending: number;
  created_at: string;
  updated_at: string;
}

// 学习记录类型定义
export interface LearningRecord {
  id: string;
  user_id: string;
  course_name: string;
  category: string;
  total_hours: number;
  progress: number; // 0-100
  start_date: string;
  end_date?: string;
  status: 'in_progress' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

// 工作任务类型定义
export interface WorkTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  estimated_time?: number; // 小时
  actual_time?: number; // 小时
  project?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// 生活管理服务
export const lifeManagementService = {
  // 健康管理
  async addHealthRecord(record: Omit<HealthRecord, 'id' | 'user_id' | 'created_at'>): Promise<HealthRecord> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('health_records')
      .insert({
        user_id: user.id,
        ...record,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getHealthRecords(type?: HealthRecord['type'], startDate?: string, endDate?: string): Promise<HealthRecord[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('health_records')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (startDate && endDate) {
      query = query
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async analyzeHealthData(period: string = 'month'): Promise<{
    sleep: {
      averageDuration: number;
      qualityDistribution: Record<string, number>;
    };
    exercise: {
      totalMinutes: number;
      frequency: number;
    };
    diet: {
      totalRecords: number;
      healthyChoices: number;
    };
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const endDate = new Date();
    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const { data: healthRecords, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    if (error) throw error;

    // 分析睡眠数据
    const sleepRecords = healthRecords.filter(r => r.type === 'sleep');
    const sleepDurationSum = sleepRecords.reduce((sum, r) => sum + (r.duration || 0), 0);
    const sleepQualityDistribution: Record<string, number> = {
      poor: 0,
      fair: 0,
      good: 0,
      excellent: 0,
    };
    sleepRecords.forEach(r => {
      if (r.quality) {
        sleepQualityDistribution[r.quality]++;
      }
    });

    // 分析运动数据
    const exerciseRecords = healthRecords.filter(r => r.type === 'exercise');
    const exerciseTotalMinutes = exerciseRecords.reduce((sum, r) => sum + (r.duration || 0), 0);

    // 分析饮食数据
    const dietRecords = healthRecords.filter(r => r.type === 'diet');
    const healthyChoices = dietRecords.filter(r => 
      r.details.toLowerCase().includes('healthy') || 
      r.details.toLowerCase().includes('营养') || 
      r.details.toLowerCase().includes('蔬菜') || 
      r.details.toLowerCase().includes('水果')
    ).length;

    return {
      sleep: {
        averageDuration: sleepRecords.length > 0 ? sleepDurationSum / sleepRecords.length : 0,
        qualityDistribution: sleepQualityDistribution,
      },
      exercise: {
        totalMinutes: exerciseTotalMinutes,
        frequency: exerciseRecords.length,
      },
      diet: {
        totalRecords: dietRecords.length,
        healthyChoices: healthyChoices,
      },
    };
  },

  // 财务管理
  async addFinancialRecord(record: Omit<FinancialRecord, 'id' | 'user_id' | 'created_at'>): Promise<FinancialRecord> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('financial_records')
      .insert({
        user_id: user.id,
        ...record,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getFinancialRecords(type?: FinancialRecord['type'], startDate?: string, endDate?: string): Promise<FinancialRecord[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('financial_records')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (startDate && endDate) {
      query = query
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createBudget(budget: Omit<Budget, 'id' | 'user_id' | 'current_spending' | 'created_at' | 'updated_at'>): Promise<Budget> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        ...budget,
        current_spending: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async analyzeFinancialData(period: string = 'month'): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
    categoryBreakdown: Record<string, number>;
    budgetStatus: Array<{
      category: string;
      budget: number;
      spending: number;
      percentage: number;
    }>;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const endDate = new Date();
    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // 获取财务记录
    const { data: financialRecords, error: recordsError } = await supabase
      .from('financial_records')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    if (recordsError) throw recordsError;

    // 获取预算
    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_date', startDate.toISOString())
      .lte('end_date', endDate.toISOString());

    if (budgetsError) throw budgetsError;

    // 计算总收入和支出
    const totalIncome = financialRecords
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpense = financialRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);

    const balance = totalIncome - totalExpense;

    // 计算类别 breakdown
    const categoryBreakdown: Record<string, number> = {};
    financialRecords
      .filter(r => r.type === 'expense')
      .forEach(r => {
        categoryBreakdown[r.category] = (categoryBreakdown[r.category] || 0) + r.amount;
      });

    // 计算预算状态
    const budgetStatus = budgets.map(budget => {
      const categorySpending = categoryBreakdown[budget.category] || 0;
      return {
        category: budget.category,
        budget: budget.amount,
        spending: categorySpending,
        percentage: budget.amount > 0 ? (categorySpending / budget.amount) * 100 : 0,
      };
    });

    return {
      totalIncome,
      totalExpense,
      balance,
      categoryBreakdown,
      budgetStatus,
    };
  },

  // 学习管理
  async addLearningRecord(record: Omit<LearningRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<LearningRecord> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('learning_records')
      .insert({
        user_id: user.id,
        ...record,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getLearningRecords(status?: LearningRecord['status']): Promise<LearningRecord[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('learning_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateLearningProgress(id: string, progress: number, additionalHours: number = 0): Promise<LearningRecord> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取当前记录
    const { data: currentRecord, error: fetchError } = await supabase
      .from('learning_records')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;

    const updatedProgress = Math.min(100, progress);
    const updatedHours = currentRecord.total_hours + additionalHours;
    const updatedStatus = updatedProgress === 100 ? 'completed' : currentRecord.status;
    const updatedEndDate = updatedProgress === 100 ? new Date().toISOString() : currentRecord.end_date;

    const { data, error } = await supabase
      .from('learning_records')
      .update({
        progress: updatedProgress,
        total_hours: updatedHours,
        status: updatedStatus,
        end_date: updatedEndDate,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async analyzeLearningData(): Promise<{
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalHours: number;
    categoryDistribution: Record<string, number>;
    progressOverview: Array<{
      course_name: string;
      progress: number;
      status: string;
    }>;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: learningRecords, error } = await supabase
      .from('learning_records')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    const totalCourses = learningRecords.length;
    const completedCourses = learningRecords.filter(r => r.status === 'completed').length;
    const inProgressCourses = learningRecords.filter(r => r.status === 'in_progress').length;
    const totalHours = learningRecords.reduce((sum, r) => sum + r.total_hours, 0);

    // 计算类别分布
    const categoryDistribution: Record<string, number> = {};
    learningRecords.forEach(r => {
      categoryDistribution[r.category] = (categoryDistribution[r.category] || 0) + 1;
    });

    // 进度概览
    const progressOverview = learningRecords.map(r => ({
      course_name: r.course_name,
      progress: r.progress,
      status: r.status === 'completed' ? '已完成' : r.status === 'in_progress' ? '进行中' : '暂停',
    }));

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalHours,
      categoryDistribution,
      progressOverview,
    };
  },

  // 工作管理
  async addWorkTask(task: Omit<WorkTask, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'>): Promise<WorkTask> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('work_tasks')
      .insert({
        user_id: user.id,
        ...task,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getWorkTasks(status?: WorkTask['status'], project?: string): Promise<WorkTask[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('work_tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (project) {
      query = query.eq('project', project);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateWorkTaskStatus(id: string, status: WorkTask['status'], actualTime?: number): Promise<WorkTask> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updates: Partial<WorkTask> = {
      status,
    };

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
      if (actualTime !== undefined) {
        updates.actual_time = actualTime;
      }
    }

    const { data, error } = await supabase
      .from('work_tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async analyzeWorkData(period: string = 'month'): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    completionRate: number;
    averageCompletionTime: number;
    priorityDistribution: Record<string, number>;
    projectBreakdown: Record<string, number>;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const endDate = new Date();
    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const { data: workTasks, error } = await supabase
      .from('work_tasks')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    const totalTasks = workTasks.length;
    const completedTasks = workTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = workTasks.filter(t => t.status === 'in_progress').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // 计算平均完成时间
    const completedWithTime = workTasks.filter(t => t.status === 'completed' && t.actual_time);
    const totalCompletionTime = completedWithTime.reduce((sum, t) => sum + (t.actual_time || 0), 0);
    const averageCompletionTime = completedWithTime.length > 0 ? totalCompletionTime / completedWithTime.length : 0;

    // 计算优先级分布
    const priorityDistribution: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };
    workTasks.forEach(t => {
      priorityDistribution[t.priority]++;
    });

    // 计算项目分解
    const projectBreakdown: Record<string, number> = {};
    workTasks.forEach(t => {
      const projectName = t.project || '未分类';
      projectBreakdown[projectName] = (projectBreakdown[projectName] || 0) + 1;
    });

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      completionRate,
      averageCompletionTime,
      priorityDistribution,
      projectBreakdown,
    };
  },

  // 综合分析
  async getLifeBalanceOverview(): Promise<{
    health: number; // 0-100
    finance: number; // 0-100
    learning: number; // 0-100
    work: number; // 0-100
    overall: number; // 0-100
    recommendations: string[];
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取各维度数据
    const healthData = await this.analyzeHealthData('month');
    const financialData = await this.analyzeFinancialData('month');
    const learningData = await this.analyzeLearningData();
    const workData = await this.analyzeWorkData('month');

    // 计算各维度得分
    const healthScore = this.calculateHealthScore(healthData);
    const financeScore = this.calculateFinanceScore(financialData);
    const learningScore = this.calculateLearningScore(learningData);
    const workScore = this.calculateWorkScore(workData);

    // 计算总体得分
    const overallScore = Math.round((healthScore + financeScore + learningScore + workScore) / 4);

    // 生成建议
    const recommendations = await this.generateLifeBalanceRecommendations({
      health: healthScore,
      finance: financeScore,
      learning: learningScore,
      work: workScore,
      overall: overallScore,
    });

    return {
      health: healthScore,
      finance: financeScore,
      learning: learningScore,
      work: workScore,
      overall: overallScore,
      recommendations,
    };
  },

  // 计算健康得分
  private calculateHealthScore(healthData: any): number {
    // 睡眠得分 (0-30)
    const sleepDurationScore = Math.min(30, (healthData.sleep.averageDuration / 480) * 30); // 8小时 = 480分钟
    
    // 运动得分 (0-30)
    const exerciseScore = Math.min(30, (healthData.exercise.totalMinutes / 150) * 30); // 每周150分钟
    
    // 饮食得分 (0-40)
    const dietScore = healthData.diet.totalRecords > 0 
      ? Math.min(40, (healthData.diet.healthyChoices / healthData.diet.totalRecords) * 40)
      : 0;

    return Math.round(sleepDurationScore + exerciseScore + dietScore);
  },

  // 计算财务得分
  private calculateFinanceScore(financialData: any): number {
    // 收支平衡得分 (0-50)
    const balanceScore = financialData.totalIncome > 0 
      ? Math.min(50, (financialData.balance / financialData.totalIncome) * 50)
      : 0;
    
    // 预算管理得分 (0-50)
    let budgetScore = 50;
    if (financialData.budgetStatus.length > 0) {
      const avgBudgetPercentage = financialData.budgetStatus
        .reduce((sum: number, budget: any) => sum + budget.percentage, 0) / financialData.budgetStatus.length;
      budgetScore = Math.max(0, 50 - Math.min(50, (avgBudgetPercentage - 100) / 2));
    }

    return Math.round(Math.max(0, balanceScore + budgetScore));
  },

  // 计算学习得分
  private calculateLearningScore(learningData: any): number {
    // 完成率得分 (0-50)
    const completionScore = learningData.totalCourses > 0 
      ? Math.min(50, (learningData.completedCourses / learningData.totalCourses) * 50)
      : 0;
    
    // 学习时长得分 (0-50)
    const hoursScore = Math.min(50, (learningData.totalHours / 40) * 50); // 每月40小时

    return Math.round(completionScore + hoursScore);
  },

  // 计算工作得分
  private calculateWorkScore(workData: any): number {
    // 完成率得分 (0-50)
    const completionScore = Math.min(50, workData.completionRate / 2);
    
    // 任务管理得分 (0-50)
    const taskManagementScore = workData.totalTasks > 0 
      ? Math.min(50, ((workData.completedTasks + workData.inProgressTasks) / workData.totalTasks) * 50)
      : 0;

    return Math.round(completionScore + taskManagementScore);
  },

  // 生成生活平衡建议
  private async generateLifeBalanceRecommendations(scores: {
    health: number;
    finance: number;
    learning: number;
    work: number;
    overall: number;
  }): Promise<string[]> {
    const prompt = `
    基于用户的生活平衡得分，生成个性化建议：
    
    健康得分: ${scores.health}/100
    财务得分: ${scores.finance}/100
    学习得分: ${scores.learning}/100
    工作得分: ${scores.work}/100
    总体得分: ${scores.overall}/100
    
    请生成：
    1. 3-5条具体、可执行的建议
    2. 针对得分较低的维度提供改进方案
    3. 建议应平衡各维度，促进整体生活质量提升
    4. 每条建议应简洁明了
    
    格式：
    - 建议1: [具体建议]
    - 建议2: [具体建议]
    - 建议3: [具体建议]
    - 建议4: [具体建议]
    - 建议5: [具体建议]
    `;

    try {
      const analysis = await quickAnalysisService.analyze(prompt);
      const lines = analysis.split('\n');
      const recommendations = lines
        .filter(line => line.trim().startsWith('- 建议'))
        .map(line => line.trim().replace(/^- 建议\d+: /, ''))
        .filter(Boolean);

      return recommendations;
    } catch (error) {
      console.error('Recommendations generation error:', error);
      return [
        '保持健康的作息时间，确保充足的睡眠',
        '制定合理的预算计划，控制日常支出',
        '持续学习新技能，拓展知识领域',
        '合理安排工作时间，提高工作效率',
        '定期进行自我反思，调整生活平衡',
      ];
    }
  },
};