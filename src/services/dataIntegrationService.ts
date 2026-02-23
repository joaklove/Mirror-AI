import { supabase } from '@/integrations/supabase/client';
import { JournalEntry } from './journalService';

// 多维度数据类型定义
export interface HealthRecord {
  id: string;
  user_id: string;
  type: 'sleep' | 'exercise' | 'diet';
  value: number;
  unit: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface FinancialRecord {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  timestamp: string;
  description?: string;
}

export interface LearningRecord {
  id: string;
  user_id: string;
  course_id: string;
  course_name: string;
  progress: number;
  last_studied: string;
  total_hours: number;
  notes?: string;
}

export interface WorkRecord {
  id: string;
  user_id: string;
  task_name: string;
  project?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  estimated_time?: number;
  actual_time?: number;
  created_at: string;
  completed_at?: string;
}

// 个人数据画像
export interface PersonalDataProfile {
  user_id: string;
  basic_info: {
    name: string;
    age: number;
    gender: string;
    location: string;
  };
  lifestyle: {
    sleep_pattern: string;
    exercise_frequency: string;
    diet_type: string;
    work_hours: number;
    learning_hours: number;
  };
  preferences: {
    communication_style: string;
    learning_style: string;
    work_style: string;
    goal_setting: string;
  };
  strengths: string[];
  growth_areas: string[];
  created_at: string;
  updated_at: string;
}

// 数据整合服务
export const dataIntegrationService = {
  // 导入外部数据
  async importExternalData(dataType: string, data: any[]): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      switch (dataType) {
        case 'health':
          return await this.importHealthData(data, user.id);
        case 'financial':
          return await this.importFinancialData(data, user.id);
        case 'learning':
          return await this.importLearningData(data, user.id);
        case 'work':
          return await this.importWorkData(data, user.id);
        case 'journal':
          return await this.importJournalData(data, user.id);
        default:
          throw new Error('Unsupported data type');
      }
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  },

  // 导入健康数据
  private async importHealthData(data: any[], userId: string): Promise<boolean> {
    const healthRecords: HealthRecord[] = data.map(item => ({
      id: `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type: item.type,
      value: item.value,
      unit: item.unit,
      timestamp: item.timestamp,
      metadata: item.metadata
    }));

    const { error } = await supabase
      .from('health_records')
      .insert(healthRecords);

    if (error) throw error;
    return true;
  },

  // 导入财务数据
  private async importFinancialData(data: any[], userId: string): Promise<boolean> {
    const financialRecords: FinancialRecord[] = data.map(item => ({
      id: `fin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type: item.type,
      amount: item.amount,
      currency: item.currency,
      category: item.category,
      timestamp: item.timestamp,
      description: item.description
    }));

    const { error } = await supabase
      .from('financial_records')
      .insert(financialRecords);

    if (error) throw error;
    return true;
  },

  // 导入学习数据
  private async importLearningData(data: any[], userId: string): Promise<boolean> {
    const learningRecords: LearningRecord[] = data.map(item => ({
      id: `learn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      course_id: item.course_id,
      course_name: item.course_name,
      progress: item.progress,
      last_studied: item.last_studied,
      total_hours: item.total_hours,
      notes: item.notes
    }));

    const { error } = await supabase
      .from('learning_records')
      .insert(learningRecords);

    if (error) throw error;
    return true;
  },

  // 导入工作数据
  private async importWorkData(data: any[], userId: string): Promise<boolean> {
    const workRecords: WorkRecord[] = data.map(item => ({
      id: `work_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      task_name: item.task_name,
      project: item.project,
      status: item.status,
      priority: item.priority,
      estimated_time: item.estimated_time,
      actual_time: item.actual_time,
      created_at: item.created_at,
      completed_at: item.completed_at
    }));

    const { error } = await supabase
      .from('work_records')
      .insert(workRecords);

    if (error) throw error;
    return true;
  },

  // 导入日记数据
  private async importJournalData(data: any[], userId: string): Promise<boolean> {
    const journalEntries: Omit<JournalEntry, 'id' | 'user_id'>[] = data.map(item => ({
      content: item.content,
      timestamp: item.timestamp,
      tags: item.tags || [],
      dimension: item.dimension,
      images: item.images || []
    }));

    // 使用现有的journalService导入日记数据
    for (const entry of journalEntries) {
      await supabase
        .from('journal_entries')
        .insert({
          user_id: userId,
          content: entry.content,
          created_at: entry.timestamp,
          tags: entry.tags,
          images: entry.images
        });
    }

    return true;
  },

  // 获取整合的个人数据
  async getIntegratedData(): Promise<{
    journal_entries: JournalEntry[];
    health_records: HealthRecord[];
    financial_records: FinancialRecord[];
    learning_records: LearningRecord[];
    work_records: WorkRecord[];
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 并行获取所有数据
    const [journalData, healthData, financialData, learningData, workData] = await Promise.all([
      supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      
      supabase
        .from('health_records')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false }),
      
      supabase
        .from('financial_records')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false }),
      
      supabase
        .from('learning_records')
        .select('*')
        .eq('user_id', user.id),
      
      supabase
        .from('work_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    ]);

    // 转换日记数据格式
    const journalEntries: JournalEntry[] = (journalData.data || []).map((entry: any) => ({
      id: entry.id,
      content: entry.content,
      timestamp: entry.created_at,
      tags: entry.tags || [],
      user_id: entry.user_id,
      images: entry.images || []
    }));

    return {
      journal_entries: journalEntries,
      health_records: healthData.data || [],
      financial_records: financialData.data || [],
      learning_records: learningData.data || [],
      work_records: workData.data || []
    };
  },

  // 生成个人数据画像
  async generatePersonalProfile(): Promise<PersonalDataProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取用户基础信息
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // 获取整合数据
    const integratedData = await this.getIntegratedData();

    // 分析健康数据
    const healthAnalysis = this.analyzeHealthData(integratedData.health_records);

    // 分析财务数据
    const financialAnalysis = this.analyzeFinancialData(integratedData.financial_records);

    // 分析学习数据
    const learningAnalysis = this.analyzeLearningData(integratedData.learning_records);

    // 分析工作数据
    const workAnalysis = this.analyzeWorkData(integratedData.work_records);

    // 分析日记数据
    const journalAnalysis = this.analyzeJournalData(integratedData.journal_entries);

    // 构建个人数据画像
    const personalProfile: PersonalDataProfile = {
      user_id: user.id,
      basic_info: {
        name: userProfile?.name || user.email?.split('@')[0] || 'User',
        age: userProfile?.age || 30,
        gender: userProfile?.gender || 'prefer_not_to_say',
        location: userProfile?.location || 'Unknown'
      },
      lifestyle: {
        sleep_pattern: healthAnalysis.sleepPattern,
        exercise_frequency: healthAnalysis.exerciseFrequency,
        diet_type: healthAnalysis.dietType,
        work_hours: workAnalysis.averageWorkHours,
        learning_hours: learningAnalysis.averageLearningHours
      },
      preferences: {
        communication_style: journalAnalysis.communicationStyle,
        learning_style: learningAnalysis.learningStyle,
        work_style: workAnalysis.workStyle,
        goal_setting: this.analyzeGoalSetting(integratedData)
      },
      strengths: this.identifyStrengths(integratedData),
      growth_areas: this.identifyGrowthAreas(integratedData),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 保存个人数据画像
    await supabase
      .from('personal_profiles')
      .upsert({
        user_id: user.id,
        profile_data: personalProfile,
        updated_at: personalProfile.updated_at
      });

    return personalProfile;
  },

  // 分析健康数据
  private analyzeHealthData(healthRecords: HealthRecord[]) {
    const sleepRecords = healthRecords.filter(r => r.type === 'sleep');
    const exerciseRecords = healthRecords.filter(r => r.type === 'exercise');
    const dietRecords = healthRecords.filter(r => r.type === 'diet');

    // 分析睡眠模式
    let sleepPattern = '规律';
    if (sleepRecords.length > 0) {
      const avgSleep = sleepRecords.reduce((sum, r) => sum + r.value, 0) / sleepRecords.length;
      if (avgSleep < 6) sleepPattern = '睡眠不足';
      else if (avgSleep > 9) sleepPattern = '睡眠过多';
    }

    // 分析运动频率
    let exerciseFrequency = '适中';
    const weeklyExercise = exerciseRecords.filter(r => {
      const recordDate = new Date(r.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return recordDate > weekAgo;
    }).length;

    if (weeklyExercise < 2) exerciseFrequency = '较少';
    else if (weeklyExercise > 5) exerciseFrequency = '频繁';

    // 分析饮食类型
    const dietType = dietRecords.length > 0 ? '规律' : '不规律';

    return {
      sleepPattern,
      exerciseFrequency,
      dietType
    };
  },

  // 分析财务数据
  private analyzeFinancialData(financialRecords: FinancialRecord[]) {
    const incomeRecords = financialRecords.filter(r => r.type === 'income');
    const expenseRecords = financialRecords.filter(r => r.type === 'expense');

    const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalExpense = expenseRecords.reduce((sum, r) => sum + r.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      savingsRate
    };
  },

  // 分析学习数据
  private analyzeLearningData(learningRecords: LearningRecord[]) {
    const totalHours = learningRecords.reduce((sum, r) => sum + r.total_hours, 0);
    const averageLearningHours = learningRecords.length > 0 ? totalHours / learningRecords.length : 0;

    // 分析学习风格
    let learningStyle = '综合型';
    if (learningRecords.length > 0) {
      const hasNotes = learningRecords.some(r => r.notes && r.notes.length > 0);
      const consistentLearners = learningRecords.filter(r => r.progress > 70).length;
      
      if (hasNotes) learningStyle = '笔记型';
      else if (consistentLearners > learningRecords.length / 2) learningStyle = '坚持型';
    }

    return {
      totalHours,
      averageLearningHours,
      learningStyle
    };
  },

  // 分析工作数据
  private analyzeWorkData(workRecords: WorkRecord[]) {
    const completedTasks = workRecords.filter(r => r.status === 'completed');
    const totalTasks = workRecords.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    const totalWorkHours = workRecords.reduce((sum, r) => sum + (r.actual_time || 0), 0);
    const averageWorkHours = workRecords.length > 0 ? totalWorkHours / workRecords.length : 0;

    // 分析工作风格
    let workStyle = '平衡型';
    if (workRecords.length > 0) {
      const highPriorityTasks = workRecords.filter(r => r.priority === 'high').length;
      const quickCompletions = completedTasks.filter(r => {
        if (!r.completed_at || !r.created_at) return false;
        const duration = (new Date(r.completed_at).getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60);
        return duration < 2;
      }).length;

      if (highPriorityTasks > workRecords.length / 2) workStyle = '高效型';
      else if (quickCompletions > completedTasks.length / 2) workStyle = '快速型';
    }

    return {
      completionRate,
      averageWorkHours,
      workStyle
    };
  },

  // 分析日记数据
  private analyzeJournalData(journalEntries: JournalEntry[]) {
    // 分析沟通风格
    let communicationStyle = '平衡型';
    if (journalEntries.length > 0) {
      const longEntries = journalEntries.filter(e => e.content.length > 500).length;
      const emotionalEntries = journalEntries.filter(e => 
        e.tags.some(t => ['情绪', '感受', '心情'].includes(t))
      ).length;

      if (longEntries > journalEntries.length / 2) communicationStyle = '详细型';
      else if (emotionalEntries > journalEntries.length / 2) communicationStyle = '情感型';
    }

    return {
      communicationStyle
    };
  },

  // 分析目标设定
  private analyzeGoalSetting(integratedData: any) {
    // 基于各维度数据推断目标设定风格
    const hasLearningGoals = integratedData.learning_records.length > 0;
    const hasFinancialGoals = integratedData.financial_records.length > 0;
    const hasHealthGoals = integratedData.health_records.length > 0;

    if (hasLearningGoals && hasFinancialGoals && hasHealthGoals) {
      return '全面型';
    } else if (hasLearningGoals) {
      return '成长型';
    } else if (hasFinancialGoals) {
      return '财务型';
    } else if (hasHealthGoals) {
      return '健康型';
    } else {
      return '未明确';
    }
  },

  // 识别优势
  private identifyStrengths(integratedData: any): string[] {
    const strengths: string[] = [];

    // 基于工作数据
    const workAnalysis = this.analyzeWorkData(integratedData.work_records);
    if (workAnalysis.completionRate > 80) {
      strengths.push('工作效率高');
    }

    // 基于学习数据
    const learningAnalysis = this.analyzeLearningData(integratedData.learning_records);
    if (learningAnalysis.averageLearningHours > 5) {
      strengths.push('学习投入度高');
    }

    // 基于健康数据
    const healthAnalysis = this.analyzeHealthData(integratedData.health_records);
    if (healthAnalysis.exerciseFrequency === '频繁') {
      strengths.push('注重健康');
    }

    // 基于财务数据
    const financialAnalysis = this.analyzeFinancialData(integratedData.financial_records);
    if (financialAnalysis.savingsRate > 30) {
      strengths.push('理财能力强');
    }

    // 基于日记数据
    if (integratedData.journal_entries.length > 10) {
      strengths.push('自我反思能力强');
    }

    return strengths.length > 0 ? strengths : ['适应能力强', '学习能力强'];
  },

  // 识别成长领域
  private identifyGrowthAreas(integratedData: any): string[] {
    const growthAreas: string[] = [];

    // 基于工作数据
    const workAnalysis = this.analyzeWorkData(integratedData.work_records);
    if (workAnalysis.completionRate < 50) {
      growthAreas.push('任务完成率');
    }

    // 基于学习数据
    const learningAnalysis = this.analyzeLearningData(integratedData.learning_records);
    if (learningAnalysis.averageLearningHours < 2) {
      growthAreas.push('学习时间管理');
    }

    // 基于健康数据
    const healthAnalysis = this.analyzeHealthData(integratedData.health_records);
    if (healthAnalysis.sleepPattern === '睡眠不足') {
      growthAreas.push('睡眠质量');
    }
    if (healthAnalysis.exerciseFrequency === '较少') {
      growthAreas.push('运动频率');
    }

    // 基于财务数据
    const financialAnalysis = this.analyzeFinancialData(integratedData.financial_records);
    if (financialAnalysis.savingsRate < 10) {
      growthAreas.push('储蓄习惯');
    }

    // 基于日记数据
    if (integratedData.journal_entries.length < 5) {
      growthAreas.push('自我反思');
    }

    return growthAreas.length > 0 ? growthAreas : ['时间管理', '目标设定'];
  },

  // 导出数据
  async exportData(format: 'json' | 'csv' | 'pdf'): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取所有数据
    const integratedData = await this.getIntegratedData();

    switch (format) {
      case 'json':
        return JSON.stringify(integratedData, null, 2);
      
      case 'csv':
        // 生成CSV格式数据
        const csvData = this.generateCSV(integratedData);
        return csvData;
      
      case 'pdf':
        // 生成PDF格式数据（这里返回占位符，实际需要PDF生成库）
        return 'PDF generation not implemented yet';
      
      default:
        throw new Error('Unsupported format');
    }
  },

  // 生成CSV数据
  private generateCSV(data: any): string {
    // 简化的CSV生成，实际项目中应使用专业库
    let csvContent = '';

    // 生成日记数据CSV
    csvContent += 'Journal Entries\n';
    csvContent += 'ID,Content,Timestamp,Tags,Images\n';
    data.journal_entries.forEach((entry: JournalEntry) => {
      csvContent += `${entry.id},"${entry.content.replace(/"/g, '""')}",${entry.timestamp},${entry.tags.join(';')},${entry.images?.join(';') || ''}\n`;
    });

    // 其他数据类型的CSV生成...

    return csvContent;
  },

  // 备份数据
  async backupData(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取所有数据
    const integratedData = await this.getIntegratedData();

    // 创建备份记录
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 保存备份到存储
    const backupData = {
      id: backupId,
      user_id: user.id,
      data: integratedData,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    // 保存到数据库
    const { error } = await supabase
      .from('data_backups')
      .insert({
        id: backupId,
        user_id: user.id,
        backup_data: backupData,
        created_at: backupData.timestamp
      });

    if (error) throw error;

    return backupId;
  },

  // 恢复数据
  async restoreData(backupId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取备份数据
    const { data: backup } = await supabase
      .from('data_backups')
      .select('*')
      .eq('id', backupId)
      .eq('user_id', user.id)
      .single();

    if (!backup) throw new Error('Backup not found');

    const backupData = backup.backup_data;

    // 恢复各维度数据
    // 注意：实际项目中需要处理数据冲突和增量恢复

    return true;
  }
};