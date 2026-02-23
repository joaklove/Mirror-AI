import { supabase } from '@/integrations/supabase/client';
import { quickAnalysisService } from './quickAnalysisService';

// 目标类型定义
export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: 'health' | 'career' | 'finance' | 'learning' | 'relationship' | 'other';
  target_date: string;
  current_progress: number;
  status: 'active' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  milestones?: Milestone[];
  created_at: string;
  updated_at: string;
}

// 里程碑类型定义
export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  target_date: string;
  status: 'pending' | 'completed';
  order: number;
  created_at: string;
}

// 计划类型定义
export interface Plan {
  id: string;
  user_id: string;
  goal_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  tasks?: Task[];
  created_at: string;
  updated_at: string;
}

// 任务类型定义
export interface Task {
  id: string;
  plan_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  estimated_time?: number;
  actual_time?: number;
  due_date?: string;
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  order: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// 提醒类型定义
export interface Reminder {
  id: string;
  user_id: string;
  task_id?: string;
  milestone_id?: string;
  title: string;
  description?: string;
  reminder_time: string;
  status: 'pending' | 'sent' | 'dismissed';
  recurrence?: 'once' | 'daily' | 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
}

// 规划服务
export const planningService = {
  // 目标管理
  async createGoal(goal: Omit<Goal, 'id' | 'user_id' | 'current_progress' | 'created_at' | 'updated_at'>): Promise<Goal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        title: goal.title,
        description: goal.description,
        type: goal.type,
        target_date: goal.target_date,
        current_progress: 0,
        status: goal.status,
        priority: goal.priority,
        milestones: goal.milestones,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      description: data.description,
      type: data.type,
      target_date: data.target_date,
      current_progress: data.current_progress,
      status: data.status,
      priority: data.priority,
      milestones: data.milestones,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  async getGoals(): Promise<Goal[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async deleteGoal(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // 里程碑管理
  async addMilestone(goalId: string, milestone: Omit<Milestone, 'id' | 'goal_id' | 'created_at'>): Promise<Milestone> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('milestones')
      .insert({
        goal_id: goalId,
        title: milestone.title,
        description: milestone.description,
        target_date: milestone.target_date,
        status: milestone.status,
        order: milestone.order,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateMilestone(id: string, updates: Partial<Milestone>): Promise<Milestone> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  // 计划管理
  async createPlan(plan: Omit<Plan, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Plan> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('plans')
      .insert({
        user_id: user.id,
        goal_id: plan.goal_id,
        title: plan.title,
        description: plan.description,
        start_date: plan.start_date,
        end_date: plan.end_date,
        status: plan.status,
        tasks: plan.tasks,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id,
      goal_id: data.goal_id,
      title: data.title,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
      tasks: data.tasks,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  async getPlans(goalId?: string): Promise<Plan[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (goalId) {
      query = query.eq('goal_id', goalId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  },

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('plans')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  // 任务管理
  async addTask(planId: string, task: Omit<Task, 'id' | 'plan_id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        plan_id: planId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        estimated_time: task.estimated_time,
        actual_time: task.actual_time,
        due_date: task.due_date,
        recurrence: task.recurrence,
        order: task.order,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 如果任务状态变为completed，记录完成时间
    if (updates.status === 'completed' && !updates.completed_at) {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async getTasks(planId?: string): Promise<Task[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('tasks')
      .select('*')
      .order('order', { ascending: true });

    if (planId) {
      query = query.eq('plan_id', planId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  },

  // AI驱动的计划生成
  async generatePlan(goalId: string): Promise<Plan> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取目标详情
    const { data: goal } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single();

    if (!goal) throw new Error('Goal not found');

    // 使用AI生成计划
    const planPrompt = `
    基于以下目标，生成一个详细的行动计划：
    
    目标：${goal.title}
    描述：${goal.description || '无'}
    类型：${goal.type}
    目标日期：${goal.target_date}
    优先级：${goal.priority}
    
    请生成：
    1. 计划标题
    2. 计划描述
    3. 开始日期（从今天开始）
    4. 结束日期（不超过目标日期）
    5. 详细的任务列表，包括：
       - 任务标题
       - 任务描述
       - 优先级
       - 预计时间（小时）
       - 截止日期
       - 任务顺序
    
    请确保计划合理可行，任务分解详细，时间安排合理。
    `;

    try {
      const analysis = await quickAnalysisService.analyze(planPrompt);
      
      // 解析AI生成的计划
      const planData = this.parsePlanFromAIResponse(analysis, goal);

      // 创建计划
      const plan = await this.createPlan({
        goal_id: goalId,
        title: planData.title,
        description: planData.description,
        start_date: planData.start_date,
        end_date: planData.end_date,
        status: 'draft',
        tasks: planData.tasks,
      });

      return plan;
    } catch (error) {
      console.error('Plan generation error:', error);
      
      // 如果AI生成失败，创建一个默认计划
      return this.createPlan({
        goal_id: goalId,
        title: `实现 ${goal.title} 的计划`,
        description: `基于目标自动生成的计划`,
        start_date: new Date().toISOString(),
        end_date: goal.target_date,
        status: 'draft',
        tasks: [
          {
            title: '开始实施计划',
            description: '制定详细的实施步骤',
            status: 'todo',
            priority: 'high',
            estimated_time: 2,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            order: 1,
          },
          {
            title: '执行关键任务',
            description: '完成计划中的关键任务',
            status: 'todo',
            priority: 'medium',
            estimated_time: 5,
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            order: 2,
          },
          {
            title: '评估进度',
            description: '评估计划执行进度，调整策略',
            status: 'todo',
            priority: 'medium',
            estimated_time: 1,
            due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            order: 3,
          },
          {
            title: '完成目标',
            description: '完成所有任务，实现目标',
            status: 'todo',
            priority: 'high',
            estimated_time: 2,
            due_date: goal.target_date,
            order: 4,
          },
        ],
      });
    }
  },

  // 解析AI生成的计划
  private parsePlanFromAIResponse(response: string, goal: Goal): {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    tasks: Omit<Task, 'id' | 'plan_id' | 'created_at' | 'updated_at'>[];
  } {
    // 简单的解析逻辑，实际项目中可能需要更复杂的解析
    const lines = response.split('\n').filter(line => line.trim());

    let title = `实现 ${goal.title} 的计划`;
    let description = `基于目标自动生成的计划`;
    let start_date = new Date().toISOString();
    let end_date = goal.target_date;
    const tasks: Omit<Task, 'id' | 'plan_id' | 'created_at' | 'updated_at'>[] = [];

    // 尝试从AI响应中提取信息
    // 这里使用简单的启发式方法，实际项目中可能需要使用NLP技术
    let inTasksSection = false;
    let taskOrder = 1;

    for (const line of lines) {
      if (line.includes('计划标题') || line.includes('Plan Title')) {
        title = line.split(':').slice(1).join(':').trim() || title;
      } else if (line.includes('计划描述') || line.includes('Plan Description')) {
        description = line.split(':').slice(1).join(':').trim() || description;
      } else if (line.includes('开始日期') || line.includes('Start Date')) {
        start_date = line.split(':').slice(1).join(':').trim() || start_date;
      } else if (line.includes('结束日期') || line.includes('End Date')) {
        end_date = line.split(':').slice(1).join(':').trim() || end_date;
      } else if (line.includes('任务列表') || line.includes('Task List')) {
        inTasksSection = true;
      } else if (inTasksSection && (line.startsWith('-') || line.match(/^\d+\./))) {
        // 提取任务信息
        const taskTitle = line.replace(/^-\s*|^\d+\.\s*/, '').trim();
        if (taskTitle) {
          tasks.push({
            title: taskTitle,
            description: '',
            status: 'todo',
            priority: 'medium',
            estimated_time: 1,
            due_date: new Date(Date.now() + taskOrder * 7 * 24 * 60 * 60 * 1000).toISOString(),
            order: taskOrder++,
          });
        }
      }
    }

    // 如果没有提取到任务，创建默认任务
    if (tasks.length === 0) {
      tasks.push(
        {
          title: '开始实施计划',
          description: '制定详细的实施步骤',
          status: 'todo',
          priority: 'high',
          estimated_time: 2,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          order: 1,
        },
        {
          title: '执行关键任务',
          description: '完成计划中的关键任务',
          status: 'todo',
          priority: 'medium',
          estimated_time: 5,
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          order: 2,
        },
        {
          title: '评估进度',
          description: '评估计划执行进度，调整策略',
          status: 'todo',
          priority: 'medium',
          estimated_time: 1,
          due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          order: 3,
        },
        {
          title: '完成目标',
          description: '完成所有任务，实现目标',
          status: 'todo',
          priority: 'high',
          estimated_time: 2,
          due_date: goal.target_date,
          order: 4,
        }
      );
    }

    return {
      title,
      description,
      start_date,
      end_date,
      tasks,
    };
  },

  // 任务优先级排序
  prioritizeTasks(tasks: Task[]): Task[] {
    // 基于优先级和截止日期排序
    return tasks.sort((a, b) => {
      // 首先按状态排序（未完成的任务优先）
      if (a.status !== b.status) {
        const statusOrder = { todo: 0, in_progress: 1, completed: 2, cancelled: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      }

      // 然后按优先级排序
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      // 最后按截止日期排序
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      } else if (a.due_date) {
        return -1;
      } else if (b.due_date) {
        return 1;
      }

      return 0;
    });
  },

  // 智能提醒管理
  async createReminder(reminder: Omit<Reminder, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>): Promise<Reminder> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: user.id,
        task_id: reminder.task_id,
        milestone_id: reminder.milestone_id,
        title: reminder.title,
        description: reminder.description,
        reminder_time: reminder.reminder_time,
        status: 'pending',
        recurrence: reminder.recurrence,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async getPendingReminders(): Promise<Reminder[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('reminder_time', { ascending: true });

    if (error) throw error;

    return data;
  },

  // 进度跟踪
  async trackProgress(goalId: string): Promise<number> {
    const { data: goal } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single();

    if (!goal) throw new Error('Goal not found');

    // 获取计划和任务
    const { data: plans } = await supabase
      .from('plans')
      .select('*')
      .eq('goal_id', goalId);

    let completedTasks = 0;
    let totalTasks = 0;

    for (const plan of plans) {
      if (plan.tasks) {
        totalTasks += plan.tasks.length;
        completedTasks += plan.tasks.filter(task => task.status === 'completed').length;
      }
    }

    // 计算进度
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 更新目标进度
    await supabase
      .from('goals')
      .update({ current_progress: progress })
      .eq('id', goalId);

    return progress;
  },

  // 获取每日任务
  async getDailyTasks(date: string = new Date().toISOString()): Promise<Task[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取所有计划
    const { data: plans } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    const targetDate = new Date(date).toDateString();
    const dailyTasks: Task[] = [];

    for (const plan of plans) {
      if (plan.tasks) {
        for (const task of plan.tasks) {
          // 检查任务是否今天到期
          if (task.due_date) {
            const taskDate = new Date(task.due_date).toDateString();
            if (taskDate === targetDate && task.status !== 'completed' && task.status !== 'cancelled') {
              dailyTasks.push(task);
            }
          }
          // 检查任务是否是每日重复
          else if (task.recurrence === 'daily' && task.status !== 'completed' && task.status !== 'cancelled') {
            dailyTasks.push(task);
          }
        }
      }
    }

    // 按优先级排序
    return this.prioritizeTasks(dailyTasks);
  },

  // 获取周计划
  async getWeeklyPlan(startDate: string = new Date().toISOString()): Promise<{
    tasks: Task[];
    milestones: Milestone[];
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    // 获取所有计划
    const { data: plans } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    const weeklyTasks: Task[] = [];

    for (const plan of plans) {
      if (plan.tasks) {
        for (const task of plan.tasks) {
          // 检查任务是否在本周内
          if (task.due_date) {
            const taskDate = new Date(task.due_date);
            if (taskDate >= start && taskDate <= end && task.status !== 'completed' && task.status !== 'cancelled') {
              weeklyTasks.push(task);
            }
          }
          // 检查任务是否是每周重复
          else if (task.recurrence === 'weekly' && task.status !== 'completed' && task.status !== 'cancelled') {
            weeklyTasks.push(task);
          }
        }
      }
    }

    // 获取本周的里程碑
    const { data: milestones } = await supabase
      .from('milestones')
      .select('*');

    const weeklyMilestones = milestones.filter(milestone => {
      const milestoneDate = new Date(milestone.target_date);
      return milestoneDate >= start && milestoneDate <= end && milestone.status === 'pending';
    });

    return {
      tasks: this.prioritizeTasks(weeklyTasks),
      milestones: weeklyMilestones,
    };
  },
};