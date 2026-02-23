import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Plus, Activity, DollarSign, BookOpen, Briefcase, Heart, TrendingUp, Calendar, Target, AlertCircle, Lightbulb, RefreshCw } from 'lucide-react';
import { lifeManagementService, HealthRecord, FinancialRecord, Budget, LearningRecord, WorkTask } from '@/services/lifeManagementService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface LifeManagementDashboardProps {
  className?: string;
}

export const LifeManagementDashboard: React.FC<LifeManagementDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [showFinanceForm, setShowFinanceForm] = useState(false);
  const [showLearningForm, setShowLearningForm] = useState(false);
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const [newHealthRecord, setNewHealthRecord] = useState<Omit<HealthRecord, 'id' | 'user_id' | 'created_at'>>({
    type: 'sleep',
    duration: 480,
    quality: 'good',
    details: '',
    timestamp: new Date().toISOString(),
  });

  const [newFinancialRecord, setNewFinancialRecord] = useState<Omit<FinancialRecord, 'id' | 'user_id' | 'created_at'>>({
    type: 'expense',
    amount: 0,
    category: 'food',
    description: '',
    timestamp: new Date().toISOString(),
  });

  const [newLearningRecord, setNewLearningRecord] = useState<Omit<LearningRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    course_name: '',
    category: 'professional',
    total_hours: 0,
    progress: 0,
    start_date: new Date().toISOString(),
    status: 'in_progress',
  });

  const [newWorkTask, setNewWorkTask] = useState<Omit<WorkTask, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    estimated_time: 1,
    project: '',
  });

  const queryClient = useQueryClient();

  // 获取生活平衡概览
  const { data: lifeBalance, isLoading: balanceLoading, refetch: refetchBalance } = useQuery({
    queryKey: ['life-balance'],
    queryFn: () => lifeManagementService.getLifeBalanceOverview(),
  });

  // 获取健康数据
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['health-data', selectedPeriod],
    queryFn: () => lifeManagementService.analyzeHealthData(selectedPeriod),
  });

  // 获取财务数据
  const { data: financialData, isLoading: financeLoading } = useQuery({
    queryKey: ['financial-data', selectedPeriod],
    queryFn: () => lifeManagementService.analyzeFinancialData(selectedPeriod),
  });

  // 获取学习数据
  const { data: learningData, isLoading: learningLoading } = useQuery({
    queryKey: ['learning-data'],
    queryFn: () => lifeManagementService.analyzeLearningData(),
  });

  // 获取工作数据
  const { data: workData, isLoading: workLoading } = useQuery({
    queryKey: ['work-data', selectedPeriod],
    queryFn: () => lifeManagementService.analyzeWorkData(selectedPeriod),
  });

  // 健康记录mutation
  const addHealthRecordMutation = useMutation({
    mutationFn: (record: typeof newHealthRecord) => lifeManagementService.addHealthRecord(record),
    onSuccess: () => {
      setShowHealthForm(false);
      setNewHealthRecord({
        type: 'sleep',
        duration: 480,
        quality: 'good',
        details: '',
        timestamp: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['health-data'] });
      refetchBalance();
    },
  });

  // 财务记录mutation
  const addFinancialRecordMutation = useMutation({
    mutationFn: (record: typeof newFinancialRecord) => lifeManagementService.addFinancialRecord(record),
    onSuccess: () => {
      setShowFinanceForm(false);
      setNewFinancialRecord({
        type: 'expense',
        amount: 0,
        category: 'food',
        description: '',
        timestamp: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['financial-data'] });
      refetchBalance();
    },
  });

  // 学习记录mutation
  const addLearningRecordMutation = useMutation({
    mutationFn: (record: typeof newLearningRecord) => lifeManagementService.addLearningRecord(record),
    onSuccess: () => {
      setShowLearningForm(false);
      setNewLearningRecord({
        course_name: '',
        category: 'professional',
        total_hours: 0,
        progress: 0,
        start_date: new Date().toISOString(),
        status: 'in_progress',
      });
      queryClient.invalidateQueries({ queryKey: ['learning-data'] });
      refetchBalance();
    },
  });

  // 工作任务mutation
  const addWorkTaskMutation = useMutation({
    mutationFn: (task: typeof newWorkTask) => lifeManagementService.addWorkTask(task),
    onSuccess: () => {
      setShowWorkForm(false);
      setNewWorkTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        estimated_time: 1,
        project: '',
      });
      queryClient.invalidateQueries({ queryKey: ['work-data'] });
      refetchBalance();
    },
  });

  // 处理健康记录添加
  const handleAddHealthRecord = () => {
    if (newHealthRecord.details.trim()) {
      addHealthRecordMutation.mutate(newHealthRecord);
    }
  };

  // 处理财务记录添加
  const handleAddFinancialRecord = () => {
    if (newFinancialRecord.amount > 0 && newFinancialRecord.description.trim()) {
      addFinancialRecordMutation.mutate(newFinancialRecord);
    }
  };

  // 处理学习记录添加
  const handleAddLearningRecord = () => {
    if (newLearningRecord.course_name.trim()) {
      addLearningRecordMutation.mutate(newLearningRecord);
    }
  };

  // 处理工作任务添加
  const handleAddWorkTask = () => {
    if (newWorkTask.title.trim()) {
      addWorkTaskMutation.mutate(newWorkTask);
    }
  };

  // 渲染概览卡片
  const renderOverviewCards = () => {
    if (balanceLoading || !lifeBalance) {
      return <div className="text-center py-8">加载中...</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 健康卡片 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              健康状态
            </CardTitle>
            <CardDescription>整体健康得分</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{lifeBalance.health}</div>
            <Progress value={lifeBalance.health} className="h-2 mb-2" />
            <div className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>
              {lifeBalance.health >= 80 ? '优秀' : lifeBalance.health >= 60 ? '良好' : lifeBalance.health >= 40 ? '一般' : '需要改进'}
            </div>
          </CardContent>
        </Card>

        {/* 财务卡片 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
              财务状况
            </CardTitle>
            <CardDescription>整体财务得分</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{lifeBalance.finance}</div>
            <Progress value={lifeBalance.finance} className="h-2 mb-2" />
            <div className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>
              {lifeBalance.finance >= 80 ? '优秀' : lifeBalance.finance >= 60 ? '良好' : lifeBalance.finance >= 40 ? '一般' : '需要改进'}
            </div>
          </CardContent>
        </Card>

        {/* 学习卡片 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
              学习进度
            </CardTitle>
            <CardDescription>整体学习得分</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{lifeBalance.learning}</div>
            <Progress value={lifeBalance.learning} className="h-2 mb-2" />
            <div className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>
              {lifeBalance.learning >= 80 ? '优秀' : lifeBalance.learning >= 60 ? '良好' : lifeBalance.learning >= 40 ? '一般' : '需要改进'}
            </div>
          </CardContent>
        </Card>

        {/* 工作卡片 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
              工作效率
            </CardTitle>
            <CardDescription>整体工作得分</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{lifeBalance.work}</div>
            <Progress value={lifeBalance.work} className="h-2 mb-2" />
            <div className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>
              {lifeBalance.work >= 80 ? '优秀' : lifeBalance.work >= 60 ? '良好' : lifeBalance.work >= 40 ? '一般' : '需要改进'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染生活平衡概览
  const renderLifeBalanceOverview = () => {
    if (balanceLoading || !lifeBalance) {
      return <div className="text-center py-8">加载中...</div>;
    }

    return (
      <Card className="border-2 border-[hsl(var(--light-ink))] mb-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6" style={{ color: 'hsl(var(--ink-green))' }} />
            生活平衡概览
          </CardTitle>
          <CardDescription>整体生活质量评估</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* 整体得分 */}
            <div className="text-center py-4">
              <div className="text-5xl font-bold mb-2" style={{ color: 'hsl(var(--ink-green))' }}>{lifeBalance.overall}</div>
              <div className="text-lg">
                {lifeBalance.overall >= 80 ? '生活平衡优秀' : lifeBalance.overall >= 60 ? '生活平衡良好' : lifeBalance.overall >= 40 ? '生活平衡一般' : '生活平衡需要改进'}
              </div>
            </div>

            <Separator />

            {/* 各维度得分 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: 'hsl(var(--ink-green))' }}>各维度得分</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">健康</span>
                      <span className="text-sm">{lifeBalance.health}/100</span>
                    </div>
                    <Progress value={lifeBalance.health} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">财务</span>
                      <span className="text-sm">{lifeBalance.finance}/100</span>
                    </div>
                    <Progress value={lifeBalance.finance} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">学习</span>
                      <span className="text-sm">{lifeBalance.learning}/100</span>
                    </div>
                    <Progress value={lifeBalance.learning} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">工作</span>
                      <span className="text-sm">{lifeBalance.work}/100</span>
                    </div>
                    <Progress value={lifeBalance.work} className="h-2" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: 'hsl(var(--ink-green))' }}>改进建议</h3>
                <div className="space-y-2">
                  {lifeBalance.recommendations.map((recommendation, index) => (
                    <div key={index} className="text-sm flex items-start gap-2 p-2 rounded-lg border border-gray-100">
                      <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'hsl(var(--ink-green))' }} />
                      <span>{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* 操作按钮 */}
            <div className="flex justify-center">
              <Button onClick={refetchBalance} disabled={balanceLoading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新评估
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 渲染健康管理
  const renderHealthManagement = () => {
    return (
      <div className="space-y-6">
        {/* 健康记录表单 */}
        {showHealthForm ? (
          <Card className="border-2 border-[hsl(var(--light-ink))] mb-6">
            <CardHeader>
              <CardTitle className="text-lg">记录健康数据</CardTitle>
              <CardDescription>记录你的健康状态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                    记录类型
                  </label>
                  <Select value={newHealthRecord.type} onValueChange={(value) => setNewHealthRecord({ ...newHealthRecord, type: value as HealthRecord['type'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择记录类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sleep">睡眠</SelectItem>
                      <SelectItem value="exercise">运动</SelectItem>
                      <SelectItem value="diet">饮食</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newHealthRecord.type === 'sleep' && (
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                      睡眠时长: {newHealthRecord.duration} 分钟
                    </label>
                    <Slider
                      value={[newHealthRecord.duration]}
                      min={30}
                      max={720}
                      step={30}
                      onValueChange={(value) => setNewHealthRecord({ ...newHealthRecord, duration: value[0] })}
                    />
                  </div>
                )}
                {newHealthRecord.type === 'exercise' && (
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                      运动时长: {newHealthRecord.duration} 分钟
                    </label>
                    <Slider
                      value={[newHealthRecord.duration]}
                      min={5}
                      max={180}
                      step={5}
                      onValueChange={(value) => setNewHealthRecord({ ...newHealthRecord, duration: value[0] })}
                    />
                  </div>
                )}
                {newHealthRecord.type === 'sleep' && (
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                      睡眠质量
                    </label>
                    <Select value={newHealthRecord.quality} onValueChange={(value) => setNewHealthRecord({ ...newHealthRecord, quality: value as HealthRecord['quality'] })}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择睡眠质量" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poor">差</SelectItem>
                        <SelectItem value="fair">一般</SelectItem>
                        <SelectItem value="good">良好</SelectItem>
                        <SelectItem value="excellent">优秀</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                    详细信息
                  </label>
                  <Textarea
                    value={newHealthRecord.details}
                    onChange={(e) => setNewHealthRecord({ ...newHealthRecord, details: e.target.value })}
                    placeholder="输入详细信息..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddHealthRecord} disabled={addHealthRecordMutation.isLoading}>
                    记录数据
                  </Button>
                  <Button variant="outline" onClick={() => setShowHealthForm(false)}>
                    取消
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setShowHealthForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            记录健康数据
          </Button>
        )}

        {/* 健康数据分析 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader>
            <CardTitle className="text-lg">健康数据分析</CardTitle>
            <CardDescription>最近的健康状态</CardDescription>
          </CardHeader>
          <CardContent>
            {healthLoading || !healthData ? (
              <div className="text-center py-8">加载中...</div>
            ) : (
              <div className="space-y-6">
                {/* 睡眠分析 */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: 'hsl(var(--ink-green))' }}>睡眠分析</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">平均睡眠时长</span>
                        <Badge variant="default">{Math.round(healthData.sleep.averageDuration / 60 * 10) / 10} 小时</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">睡眠质量分布</span>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(healthData.sleep.qualityDistribution).map(([quality, count]) => (
                          <div key={quality} className="flex justify-between items-center text-xs">
                            <span>{quality === 'poor' ? '差' : quality === 'fair' ? '一般' : quality === 'good' ? '良好' : '优秀'}</span>
                            <Badge variant="outline">{count} 次</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 运动分析 */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: 'hsl(var(--ink-green))' }}>运动分析</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">总运动时长</span>
                        <Badge variant="default">{healthData.exercise.totalMinutes} 分钟</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">运动频率</span>
                        <Badge variant="outline">{healthData.exercise.frequency} 次</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 饮食分析 */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: 'hsl(var(--ink-green))' }}>饮食分析</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">记录次数</span>
                        <Badge variant="default">{healthData.diet.totalRecords} 次</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">健康选择</span>
                        <Badge variant={healthData.diet.totalRecords > 0 && healthData.diet.healthyChoices / healthData.diet.totalRecords > 0.7 ? 'default' : 'outline'}>
                          {healthData.diet.healthyChoices} 次
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染财务管理
  const renderFinanceManagement = () => {
    return (
      <div className="space-y-6">
        {/* 财务记录表单 */}
        {showFinanceForm ? (
          <Card className="border-2 border-[hsl(var(--light-ink))] mb-6">
            <CardHeader>
              <CardTitle className="text-lg">记录财务数据</CardTitle>
              <CardDescription>记录你的收入或支出</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                    记录类型
                  </label>
                  <Select value={newFinancialRecord.type} onValueChange={(value) => setNewFinancialRecord({ ...newFinancialRecord, type: value as FinancialRecord['type'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择记录类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">收入</SelectItem>
                      <SelectItem value="expense">支出</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                    金额
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newFinancialRecord.amount}
                    onChange={(e) => setNewFinancialRecord({ ...newFinancialRecord, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="输入金额"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                    类别
                  </label>
                  <Select value={newFinancialRecord.category} onValueChange={(value) => setNewFinancialRecord({ ...newFinancialRecord, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择类别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">餐饮</SelectItem>
                      <SelectItem value="transport">交通</SelectItem>
                      <SelectItem value="shopping">购物</SelectItem>
                      <SelectItem value="entertainment">娱乐</SelectItem>
                      <SelectItem value="housing">住房</SelectItem>
                      <SelectItem value="utilities"> utilities</SelectItem>
                      <SelectItem value="healthcare">医疗</SelectItem>
                      <SelectItem value="education">教育</SelectItem>
                      <SelectItem value="salary">工资</SelectItem>
                      <SelectItem value="investment">投资</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                    描述
                  </label>
                  <Textarea
                    value={newFinancialRecord.description}
                    onChange={(e) => setNewFinancialRecord({ ...newFinancialRecord, description: e.target.value })}
                    placeholder="输入详细描述..."
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddFinancialRecord} disabled={addFinancialRecordMutation.isLoading}>
                    记录数据
                  </Button>
                  <Button variant="outline" onClick={() => setShowFinanceForm(false)}>
                    取消
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setShowFinanceForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            记录财务数据
          </Button>
        )}

        {/* 财务数据分析 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader>
            <CardTitle className="text-lg">财务数据分析</CardTitle>
            <CardDescription>最近的财务状况</CardDescription>
          </CardHeader>
          <CardContent>
            {financeLoading || !financialData ? (
              <div className="text-center py-8">加载中...</div>
            ) : (
              <div className="space-y-6">
                {/* 收支概览 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 border border-gray-100 rounded-lg">
                    <div className="text-sm mb-1" style={{ color: 'hsl(var(--mountain-green))' }}>总收入</div>
                    <div className="text-xl font-bold">¥{financialData.totalIncome.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-3 border border-gray-100 rounded-lg">
                    <div className="text-sm mb-1" style={{ color: 'hsl(var(--mountain-green))' }}>总支出</div>
                    <div className="text-xl font-bold">¥{financialData.totalExpense.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-3 border border-gray-100 rounded-lg">
                    <div className="text-sm mb-1" style={{ color: 'hsl(var(--mountain-green))' }}>结余</div>
                    <div className={`text-xl font-bold ${financialData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ¥{financialData.balance.toFixed(2)}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 支出类别分析 */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: 'hsl(var(--ink-green))' }}>支出类别分析</h4>
                  <div className="space-y-2">
                    {Object.entries(financialData.categoryBreakdown).map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm">{category}</span>
                        <Badge variant="outline">¥{amount.toFixed(2)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* 预算状态 */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: 'hsl(var(--ink-green))' }}>预算状态</h4>
                  {financialData.budgetStatus.length > 0 ? (
                    <div className="space-y-3">
                      {financialData.budgetStatus.map((budget, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span>{budget.category}</span>
                            <span>¥{budget.spending.toFixed(2)} / ¥{budget.budget.toFixed(2)}</span>
                          </div>
                          <Progress value={Math.min(100, budget.percentage)} className="h-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-center py-4" style={{ color: 'hsl(var(--smoke-gray))' }}>
                      尚未设置预算
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染学习管理
  const renderLearningManagement = () => {
    return (
      <div className="space-y-6">
        {/* 学习记录表单 */}
        {showLearningForm ? (
          <Card className="border-2 border-[hsl(var(--light-ink))] mb-6">
            <CardHeader>
              <CardTitle className="text-lg">添加学习课程</CardTitle>
              <CardDescription>添加新的学习课程</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                    课程名称
                  </label>
                  <Input
                    value={newLearningRecord.course_name}
                    onChange={(e) => setNewLearningRecord({ ...newLearningRecord, course_name: e.target.value })}
                    placeholder="输入课程名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                    课程类别
                  </label>
                  <Select value={newLearningRecord.category} onValueChange={(value) => setNewLearningRecord({ ...newLearningRecord, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择课程类别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">职业技能</SelectItem>
                      <SelectItem value="academic">学术知识</SelectItem>
                      <SelectItem value="personal">个人发展</SelectItem>
                      <SelectItem value="hobby">兴趣爱好</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                    预计总时长 (小时)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newLearningRecord.total_hours}
                    onChange={(e) => setNewLearningRecord({ ...newLearningRecord, total_hours: parseFloat(e.target.value) || 0 })}
                    placeholder="输入预计总时长"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddLearningRecord} disabled={addLearningRecordMutation.isLoading}>
                    添加课程
                  </Button>
                  <Button variant="outline" onClick={() => setShowLearningForm(false)}>
                    取消
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setShowLearningForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            添加学习课程
          </Button>
        )}

        {/* 学习数据分析 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader>
            <CardTitle className="text-lg">学习数据分析</CardTitle>
            <CardDescription>你的学习进度</CardDescription>
          </CardHeader>
          <CardContent>
            {learningLoading || !learningData ? (
              <div className="text-center py-8">加载中...</div>
            ) : (
              <div className="space-y-6">
                {/* 学习概览 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border border-gray-100 rounded-lg">
                    <div className="text-sm mb-1" style={{ color: 'hsl(var(--mountain-green))' }}>总课程数</div>
                    <div className="text-xl font-bold">{learningData.totalCourses}</div>
                  </div>
                  <div className="text-center p-3 border border-gray-100 rounded-lg">
                    <div className="text-sm mb-1" style={{ color: 'hsl(var(--mountain-green))' }}>已完成</div>
                    <div className="text-xl font-bold">{learningData.completedCourses}</div>
                  </div>
                  <div className="text-center p-3 border border-gray-100 rounded-lg">
                    <div className="text-sm mb-1" style={{ color: 'hsl(var(--mountain-green))' }}>进行中</div>
                    <div className="text-xl font-bold">{learningData.inProgressCourses}</div>
                  </div>
                  <div className="text-center p-3 border border-gray-100 rounded-lg">
                    <div className="text-sm mb-1" style={{ color: 'hsl(var(--mountain-green))' }}>总学习时长</div>
                    <div className="text-xl font-bold">{learningData.totalHours} 小时</div>
                  </div>
                </div>

                <Separator />

                {/* 课程进度 */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: 'hsl(var(--ink-green))' }}>课程进度</h4>
                  <div className="space-y-3">
                    {learningData.progressOverview.map((course, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span>{course.course_name}</span>
                          <Badge variant={course.status === '已完成' ? 'default' : course.status === '进行中' ? 'outline' : 'destructive'}>
                            {course.status}
                          </Badge>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* 类别分布 */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: 'hsl(var(--ink-green))' }}>类别分布</h4>
                  <div className="space-y-2">
                    {Object.entries(learningData.categoryDistribution).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm">{category}</span>
                        <Badge variant="outline">{count} 门课程</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染工作管理
  const renderWorkManagement = () => {
    return (
      <div className="space-y-6">
        {/* 工作任务表单 */}
        {showWorkForm ? (
          <Card className="border-2 border-[hsl(var(--light-ink))] mb-6">
            <CardHeader>
              <CardTitle className="text-lg">添加工作任务</CardTitle>
              <CardDescription>添加新的工作任务</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                    任务标题
                  </label>
                  <Input
                    value={newWorkTask.title}
                    onChange={(e) => setNewWorkTask({ ...newWorkTask, title: e.target.value })}
                    placeholder="输入任务标题"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                    任务描述
                  </label>
                  <Textarea
                    value={newWorkTask.description || ''}
                    onChange={(e) => setNewWorkTask({ ...newWorkTask, description: e.target.value })}
                    placeholder="输入任务描述..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                      优先级
                    </label>
                    <Select value={newWorkTask.priority} onValueChange={(value) => setNewWorkTask({ ...newWorkTask, priority: value as WorkTask['priority'] })}>
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
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                      预计时长 (小时)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={newWorkTask.estimated_time}
                      onChange={(e) => setNewWorkTask({ ...newWorkTask, estimated_time: parseFloat(e.target.value) || 0 })}
                      placeholder="输入预计时长"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                    项目名称
                  </label>
                  <Input
                    value={newWorkTask.project || ''}
                    onChange={(e) => setNewWorkTask({ ...newWorkTask, project: e.target.value })}
                    placeholder="输入项目名称"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddWorkTask} disabled={addWorkTaskMutation.isLoading}>
                    添加任务
                  </Button>
                  <Button variant="outline" onClick={() => setShowWorkForm(false)}>
                    取消
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setShowWorkForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            添加工作任务
          </Button>
        )}

        {/* 工作数据分析 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader>
            <CardTitle className="text-lg">工作数据分析</CardTitle>
            <CardDescription>你的工作效率</CardDescription>
          </CardHeader>
          <CardContent>
            {workLoading || !workData ? (
              <div className="text-center py-8">加载中...</div>
            ) : (
              <div className="space-y-6">
                {/* 工作概览 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border border-gray-100 rounded-lg">
                    <div className="text-sm mb-1" style={{ color: 'hsl(var(--mountain-green))' }}>总任务数</div>
                    <div className="text-xl font-bold">{workData.totalTasks}</div>
                  </div>
                  <div className="text-center p-3 border border-gray-100 rounded-lg">
                    <div className="text-sm mb-1" style={{ color: 'hsl(var(--mountain-green))' }}>已完成</div>
                    <div className="text-xl font-bold">{workData.completedTasks}</div>
                  </div>
                  <div className="text-center p-3 border border-gray-100 rounded-lg">
                    <div className="text-sm mb-1" style={{ color: 'hsl(var(--mountain-green))' }}>进行中</div>
                    <div className="text-xl font-bold">{workData.inProgressTasks}</div>
                  </div>
                  <div className="text-center p-3 border border-gray-100 rounded-lg">
                    <div className="text-sm mb-1" style={{ color: 'hsl(var(--mountain-green))' }}>完成率</div>
                    <div className="text-xl font-bold">{Math.round(workData.completionRate)}%</div>
                  </div>
                </div>

                <Separator />

                {/* 优先级分布 */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: 'hsl(var(--ink-green))' }}>优先级分布</h4>
                  <div className="space-y-2">
                    {Object.entries(workData.priorityDistribution).map(([priority, count]) => (
                      <div key={priority} className="flex justify-between items-center">
                        <span className="text-sm">{priority === 'low' ? '低优先级' : priority === 'medium' ? '中优先级' : '高优先级'}</span>
                        <Badge variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'default' : 'outline'}>
                          {count} 个任务
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* 项目分解 */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: 'hsl(var(--ink-green))' }}>项目分解</h4>
                  <div className="space-y-2">
                    {Object.entries(workData.projectBreakdown).map(([project, count]) => (
                      <div key={project} className="flex justify-between items-center">
                        <span className="text-sm">{project}</span>
                        <Badge variant="outline">{count} 个任务</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'hsl(var(--ink-green))' }}>生活管理中心</h1>
          <p className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>多维度生活管理与平衡</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-auto">
              <SelectValue placeholder="选择周期" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">周</SelectItem>
              <SelectItem value="month">月</SelectItem>
              <SelectItem value="year">年</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refetchBalance} disabled={balanceLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新数据
          </Button>
        </div>
      </div>

      {/* 概览卡片 */}
      {renderOverviewCards()}

      {/* 生活平衡概览 */}
      {renderLifeBalanceOverview()}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="health">健康管理</TabsTrigger>
          <TabsTrigger value="finance">财务管理</TabsTrigger>
          <TabsTrigger value="learning">学习管理</TabsTrigger>
          <TabsTrigger value="work">工作管理</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-0">
          {renderHealthManagement()}
        </TabsContent>

        <TabsContent value="finance" className="mt-0">
          {renderFinanceManagement()}
        </TabsContent>

        <TabsContent value="learning" className="mt-0">
          {renderLearningManagement()}
        </TabsContent>

        <TabsContent value="work" className="mt-0">
          {renderWorkManagement()}
        </TabsContent>
      </Tabs>
    </div>
  );
};