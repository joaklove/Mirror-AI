import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Plus, Calendar as CalendarIcon, Target, CheckSquare, Clock, AlertCircle, TrendingUp, Menu, X } from 'lucide-react';
import { planningService, Goal, Plan, Task, Milestone } from '@/services/planningService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PlanningDashboardProps {
  className?: string;
}

export const PlanningDashboard: React.FC<PlanningDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('goals');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'other' as Goal['type'],
    target_date: new Date().toISOString(),
    status: 'active' as Goal['status'],
    priority: 'medium' as Goal['priority'],
  });

  const queryClient = useQueryClient();

  // 获取所有目标
  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => planningService.getGoals(),
  });

  // 获取所有计划
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => planningService.getPlans(),
  });

  // 获取每日任务
  const { data: dailyTasks, isLoading: dailyTasksLoading } = useQuery({
    queryKey: ['daily-tasks'],
    queryFn: () => planningService.getDailyTasks(),
  });

  // 创建目标的mutation
  const createGoalMutation = useMutation({
    mutationFn: (goal: typeof newGoal) => planningService.createGoal(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowGoalForm(false);
      setNewGoal({
        title: '',
        description: '',
        type: 'other',
        target_date: new Date().toISOString(),
        status: 'active',
        priority: 'medium',
      });
    },
  });

  // 生成计划的mutation
  const generatePlanMutation = useMutation({
    mutationFn: (goalId: string) => planningService.generatePlan(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });

  // 更新任务状态的mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) => planningService.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });

  // 处理目标创建
  const handleCreateGoal = () => {
    if (newGoal.title.trim()) {
      createGoalMutation.mutate(newGoal);
    }
  };

  // 处理计划生成
  const handleGeneratePlan = (goalId: string) => {
    generatePlanMutation.mutate(goalId);
  };

  // 处理任务状态更新
  const handleUpdateTaskStatus = (taskId: string, status: Task['status']) => {
    updateTaskMutation.mutate({ id: taskId, updates: { status } });
  };

  // 渲染目标列表
  const renderGoals = () => {
    if (goalsLoading) {
      return <div className="text-center py-8">加载中...</div>;
    }

    if (!goals || goals.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-sm mb-4" style={{ color: 'hsl(var(--smoke-gray))' }}>还没有设置目标</p>
          <Button onClick={() => setShowGoalForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            创建第一个目标
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {goals.map((goal) => (
          <Card key={goal.id} className="border-2 border-[hsl(var(--light-ink))]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
                  {goal.title}
                </CardTitle>
                <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'outline'}>
                  {goal.priority === 'high' ? '高' : goal.priority === 'medium' ? '中' : '低'}优先级
                </Badge>
              </div>
              <CardDescription>{goal.description || '无描述'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>目标类型</span>
                  <Badge variant="outline">{goal.type}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>目标日期</span>
                  <span className="text-sm">{new Date(goal.target_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>当前进度</span>
                  <Badge variant="default">{goal.current_progress}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>状态</span>
                  <Badge variant={goal.status === 'completed' ? 'default' : goal.status === 'active' ? 'outline' : 'destructive'}>
                    {goal.status === 'completed' ? '已完成' : goal.status === 'active' ? '进行中' : '已取消'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleGeneratePlan(goal.id)}
                    disabled={generatePlanMutation.isLoading}
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    生成计划
                  </Button>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    查看详情
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // 渲染计划列表
  const renderPlans = () => {
    if (plansLoading) {
      return <div className="text-center py-8">加载中...</div>;
    }

    if (!plans || plans.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-sm mb-4" style={{ color: 'hsl(var(--smoke-gray))' }}>还没有计划</p>
          <p className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>为你的目标生成计划吧</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="border-2 border-[hsl(var(--light-ink))]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{plan.title}</CardTitle>
              <CardDescription>{plan.description || '无描述'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>时间范围</span>
                  <span className="text-sm">
                    {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>状态</span>
                  <Badge variant={plan.status === 'completed' ? 'default' : plan.status === 'active' ? 'outline' : 'destructive'}>
                    {plan.status === 'completed' ? '已完成' : plan.status === 'active' ? '进行中' : plan.status === 'draft' ? '草稿' : '已取消'}
                  </Badge>
                </div>
                {plan.tasks && plan.tasks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2" style={{ color: 'hsl(var(--ink-green))' }}>任务列表</h4>
                    <div className="space-y-2">
                      {plan.tasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="flex items-center gap-2">
                          <Checkbox 
                            checked={task.status === 'completed'}
                            onCheckedChange={(checked) => handleUpdateTaskStatus(task.id, checked ? 'completed' : 'todo')}
                          />
                          <span className="text-sm flex-1">{task.title}</span>
                          <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'outline'} size="sm">
                            {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                          </Badge>
                        </div>
                      ))}
                      {plan.tasks.length > 3 && (
                        <div className="text-sm text-center" style={{ color: 'hsl(var(--mountain-green))' }}>
                          还有 {plan.tasks.length - 3} 个任务...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // 渲染每日任务
  const renderDailyTasks = () => {
    if (dailyTasksLoading) {
      return <div className="text-center py-8">加载中...</div>;
    }

    if (!dailyTasks || dailyTasks.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-sm mb-4" style={{ color: 'hsl(var(--smoke-gray))' }}>今天没有任务</p>
          <p className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>享受你的一天吧！</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium" style={{ color: 'hsl(var(--ink-green))' }}>
            今日任务 ({new Date().toLocaleDateString()})
          </h3>
          <Badge variant="default">{dailyTasks.length} 个任务</Badge>
        </div>
        <div className="space-y-3">
          {dailyTasks.map((task) => (
            <Card key={task.id} className="border-2 border-[hsl(var(--light-ink))]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={task.status === 'completed'}
                    onCheckedChange={(checked) => handleUpdateTaskStatus(task.id, checked ? 'completed' : 'todo')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h4>
                      <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'outline'} size="sm">
                        {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm mb-2" style={{ color: 'hsl(var(--mountain-green))' }}>
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      {task.estimated_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {task.estimated_time}小时
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // 渲染创建目标表单
  const renderCreateGoalForm = () => {
    if (!showGoalForm) return null;

    return (
      <Card className="border-2 border-[hsl(var(--light-ink))] mb-6">
        <CardHeader>
          <CardTitle className="text-lg">创建新目标</CardTitle>
          <CardDescription>设置你的人生目标并开始规划</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                目标标题
              </label>
              <Input 
                value={newGoal.title} 
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} 
                placeholder="输入目标标题"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                目标描述
              </label>
              <Textarea 
                value={newGoal.description} 
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} 
                placeholder="输入目标描述"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                  目标类型
                </label>
                <Select value={newGoal.type} onValueChange={(value) => setNewGoal({ ...newGoal, type: value as Goal['type'] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择目标类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">健康</SelectItem>
                    <SelectItem value="career">职业</SelectItem>
                    <SelectItem value="finance">财务</SelectItem>
                    <SelectItem value="learning">学习</SelectItem>
                    <SelectItem value="relationship">关系</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                  优先级
                </label>
                <Select value={newGoal.priority} onValueChange={(value) => setNewGoal({ ...newGoal, priority: value as Goal['priority'] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                目标日期
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {new Date(newGoal.target_date).toLocaleDateString()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(newGoal.target_date)}
                    onSelect={(date) => date && setNewGoal({ ...newGoal, target_date: date.toISOString() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateGoal} disabled={createGoalMutation.isLoading}>
                创建目标
              </Button>
              <Button variant="outline" onClick={() => setShowGoalForm(false)}>
                取消
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'hsl(var(--ink-green))' }}>规划中心</h1>
          <p className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>AI驱动的智能规划系统</p>
        </div>
        <Button onClick={() => setShowGoalForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新建目标
        </Button>
      </div>

      {renderCreateGoalForm()}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="goals">我的目标</TabsTrigger>
          <TabsTrigger value="plans">我的计划</TabsTrigger>
          <TabsTrigger value="tasks">今日任务</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-0">
          {renderGoals()}
        </TabsContent>

        <TabsContent value="plans" className="mt-0">
          {renderPlans()}
        </TabsContent>

        <TabsContent value="tasks" className="mt-0">
          {renderDailyTasks()}
        </TabsContent>
      </Tabs>
    </div>
  );
};