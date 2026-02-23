import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Activity, DollarSign, BookOpen, Briefcase, User, Download, Upload, RefreshCw, Settings } from 'lucide-react';
import { dataIntegrationService, PersonalDataProfile } from '@/services/dataIntegrationService';
import { JournalEntry } from '@/services/journalService';
import { useQuery } from '@tanstack/react-query';

interface DataDashboardProps {
  className?: string;
}

export const DataDashboard: React.FC<DataDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');

  // 获取整合数据
  const { data: integratedData, isLoading: dataLoading } = useQuery({
    queryKey: ['integrated-data'],
    queryFn: () => dataIntegrationService.getIntegratedData(),
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  // 获取个人数据画像
  const { data: personalProfile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['personal-profile'],
    queryFn: () => dataIntegrationService.generatePersonalProfile(),
    staleTime: 30 * 60 * 1000, // 30分钟
  });

  // 计算统计数据
  const calculateStats = () => {
    if (!integratedData) return null;

    const { journal_entries, health_records, financial_records, learning_records, work_records } = integratedData;

    // 日记统计
    const journalStats = {
      total: journal_entries.length,
      recent: journal_entries.filter((e) => {
        const entryDate = new Date(e.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate > weekAgo;
      }).length,
      longestEntry: journal_entries.reduce((max, e) => e.content.length > max.length ? e : max, { content: '' }).content.length,
    };

    // 健康统计
    const healthStats = {
      total: health_records.length,
      sleep: health_records.filter(r => r.type === 'sleep').length,
      exercise: health_records.filter(r => r.type === 'exercise').length,
      diet: health_records.filter(r => r.type === 'diet').length,
    };

    // 财务统计
    const financialStats = {
      total: financial_records.length,
      income: financial_records
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0),
      expense: financial_records
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0),
      balance: financial_records
        .reduce((sum, r) => r.type === 'income' ? sum + r.amount : sum - r.amount, 0),
    };

    // 学习统计
    const learningStats = {
      total: learning_records.length,
      inProgress: learning_records.filter(r => r.progress < 100).length,
      completed: learning_records.filter(r => r.progress === 100).length,
      totalHours: learning_records.reduce((sum, r) => sum + r.total_hours, 0),
    };

    // 工作统计
    const workStats = {
      total: work_records.length,
      todo: work_records.filter(r => r.status === 'todo').length,
      inProgress: work_records.filter(r => r.status === 'in_progress').length,
      completed: work_records.filter(r => r.status === 'completed').length,
      completionRate: work_records.length > 0 
        ? Math.round((work_records.filter(r => r.status === 'completed').length / work_records.length) * 100)
        : 0,
    };

    return {
      journal: journalStats,
      health: healthStats,
      financial: financialStats,
      learning: learningStats,
      work: workStats,
    };
  };

  const stats = calculateStats();

  // 渲染概览卡片
  const renderOverviewCards = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 日记卡片 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
              日记记录
            </CardTitle>
            <CardDescription>最近的思考与感悟</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>总计</span>
                <Badge variant="outline">{stats.journal.total}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>本周</span>
                <Badge variant="outline">{stats.journal.recent}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>最长记录</span>
                <Badge variant="outline">{stats.journal.longestEntry}字</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 健康卡片 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
              健康数据
            </CardTitle>
            <CardDescription>身体状态的记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>睡眠记录</span>
                <Badge variant="outline">{stats.health.sleep}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>运动记录</span>
                <Badge variant="outline">{stats.health.exercise}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>饮食记录</span>
                <Badge variant="outline">{stats.health.diet}</Badge>
              </div>
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
            <CardDescription>收入与支出的平衡</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>总收入</span>
                <Badge variant="outline">¥{stats.financial.income.toFixed(2)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>总支出</span>
                <Badge variant="outline">¥{stats.financial.expense.toFixed(2)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>结余</span>
                <Badge variant={stats.financial.balance >= 0 ? "default" : "destructive"}>
                  ¥{stats.financial.balance.toFixed(2)}
                </Badge>
              </div>
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
            <CardDescription>知识的积累与成长</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>课程总数</span>
                <Badge variant="outline">{stats.learning.total}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>进行中</span>
                <Badge variant="outline">{stats.learning.inProgress}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>已完成</span>
                <Badge variant="outline">{stats.learning.completed}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>总学习时长</span>
                <Badge variant="outline">{stats.learning.totalHours.toFixed(1)}小时</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 工作卡片 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
              工作任务
            </CardTitle>
            <CardDescription>任务的管理与完成</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>任务总数</span>
                <Badge variant="outline">{stats.work.total}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>待处理</span>
                <Badge variant="outline">{stats.work.todo}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>进行中</span>
                <Badge variant="outline">{stats.work.inProgress}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>已完成</span>
                <Badge variant="outline">{stats.work.completed}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>完成率</span>
                <Badge variant="default">{stats.work.completionRate}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 个人画像卡片 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
              个人画像
            </CardTitle>
            <CardDescription>基于数据的自我认知</CardDescription>
          </CardHeader>
          <CardContent>
            {personalProfile ? (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>优势</h4>
                  <div className="flex flex-wrap gap-1">
                    {personalProfile.strengths.slice(0, 3).map((strength, index) => (
                      <Badge key={index} variant="default">{strength}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>成长领域</h4>
                  <div className="flex flex-wrap gap-1">
                    {personalProfile.growth_areas.slice(0, 3).map((area, index) => (
                      <Badge key={index} variant="outline">{area}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>生活方式</h4>
                  <p className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>
                    {personalProfile.lifestyle.sleep_pattern}睡眠 · {personalProfile.lifestyle.exercise_frequency}运动 · {personalProfile.lifestyle.work_hours}小时工作
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>生成中...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染数据导入/导出部分
  const renderDataManagement = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 数据导入 */}
          <Card className="border-2 border-[hsl(var(--light-ink))]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
                数据导入
              </CardTitle>
              <CardDescription>从其他平台导入数据</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'hsl(var(--ink-green))' }}>支持的数据源</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">日记应用</Badge>
                    <Badge variant="outline">健康应用</Badge>
                    <Badge variant="outline">财务软件</Badge>
                    <Badge variant="outline">学习平台</Badge>
                    <Badge variant="outline">工作工具</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'hsl(var(--ink-green))' }}>导入格式</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">JSON</Badge>
                    <Badge variant="outline">CSV</Badge>
                    <Badge variant="outline">Excel</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  选择文件导入
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 数据导出 */}
          <Card className="border-2 border-[hsl(var(--light-ink))]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
                数据导出
              </CardTitle>
              <CardDescription>导出你的个人数据</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'hsl(var(--ink-green))' }}>导出格式</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">JSON</Badge>
                    <Badge variant="outline">CSV</Badge>
                    <Badge variant="outline">PDF</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'hsl(var(--ink-green))' }}>导出范围</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">全部数据</Badge>
                    <Badge variant="outline">最近30天</Badge>
                    <Badge variant="outline">特定维度</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  导出数据
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 数据备份 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
              数据备份
            </CardTitle>
            <CardDescription>定期备份你的数据</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium" style={{ color: 'hsl(var(--ink-green))' }}>自动备份</h4>
                  <p className="text-xs" style={{ color: 'hsl(var(--mountain-green))' }}>每7天自动备份一次</p>
                </div>
                <Button variant="outline" size="sm">
                  立即备份
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium" style={{ color: 'hsl(var(--ink-green))' }}>备份历史</h4>
                  <p className="text-xs" style={{ color: 'hsl(var(--mountain-green))' }}>查看和恢复之前的备份</p>
                </div>
                <Button variant="outline" size="sm">
                  查看历史
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染个人画像详情
  const renderPersonalProfile = () => {
    if (!personalProfile) {
      return (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>生成个人画像中...</p>
        </div>
      );
    }

    return (
      <Card className="border-2 border-[hsl(var(--light-ink))]">
        <CardHeader>
          <CardTitle className="text-xl" style={{ color: 'hsl(var(--ink-green))' }}>个人数据画像</CardTitle>
          <CardDescription>基于你的数据生成的全面自我认知</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 基本信息 */}
            <div>
              <h3 className="text-lg font-medium mb-3" style={{ color: 'hsl(var(--ink-green))' }}>基本信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>姓名</span>
                    <span className="text-sm font-medium">{personalProfile.basic_info.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>年龄</span>
                    <span className="text-sm font-medium">{personalProfile.basic_info.age}岁</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>性别</span>
                    <span className="text-sm font-medium">{personalProfile.basic_info.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>所在地</span>
                    <span className="text-sm font-medium">{personalProfile.basic_info.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 生活方式 */}
            <div>
              <h3 className="text-lg font-medium mb-3" style={{ color: 'hsl(var(--ink-green))' }}>生活方式</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>睡眠模式</span>
                    <Badge variant="outline">{personalProfile.lifestyle.sleep_pattern}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>运动频率</span>
                    <Badge variant="outline">{personalProfile.lifestyle.exercise_frequency}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>饮食类型</span>
                    <Badge variant="outline">{personalProfile.lifestyle.diet_type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>工作时长</span>
                    <Badge variant="outline">{personalProfile.lifestyle.work_hours}小时/天</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>学习时长</span>
                    <Badge variant="outline">{personalProfile.lifestyle.learning_hours}小时/周</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* 偏好 */}
            <div>
              <h3 className="text-lg font-medium mb-3" style={{ color: 'hsl(var(--ink-green))' }}>个人偏好</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>沟通风格</span>
                    <Badge variant="outline">{personalProfile.preferences.communication_style}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>学习风格</span>
                    <Badge variant="outline">{personalProfile.preferences.learning_style}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>工作风格</span>
                    <Badge variant="outline">{personalProfile.preferences.work_style}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>目标设定</span>
                    <Badge variant="outline">{personalProfile.preferences.goal_setting}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* 优势与成长 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3" style={{ color: 'hsl(var(--ink-green))' }}>优势</h3>
                <div className="space-y-2">
                  {personalProfile.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--ink-green))' }}></div>
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3" style={{ color: 'hsl(var(--ink-green))' }}>成长领域</h3>
                <div className="space-y-2">
                  {personalProfile.growth_areas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--cinnabar))' }}></div>
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 更新按钮 */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => refetchProfile()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                更新画像
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (dataLoading || profileLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>加载数据中...</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'hsl(var(--ink-green))' }}>数据中心</h1>
          <p className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>你的个人数据仪表盘</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            设置
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="management">数据管理</TabsTrigger>
          <TabsTrigger value="profile">个人画像</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          {renderOverviewCards()}
        </TabsContent>

        <TabsContent value="management" className="mt-0">
          {renderDataManagement()}
        </TabsContent>

        <TabsContent value="profile" className="mt-0">
          {renderPersonalProfile()}
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <Card className="border-2 border-[hsl(var(--light-ink))]">
            <CardHeader>
              <CardTitle>数据设置</CardTitle>
              <CardDescription>管理你的数据偏好和隐私设置</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'hsl(var(--ink-green))' }}>数据收集</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">收集日记数据</span>
                      <Badge variant="default">已开启</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">收集健康数据</span>
                      <Badge variant="default">已开启</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">收集财务数据</span>
                      <Badge variant="outline">已关闭</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">收集学习数据</span>
                      <Badge variant="default">已开启</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">收集工作数据</span>
                      <Badge variant="outline">已关闭</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'hsl(var(--ink-green))' }}>隐私设置</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">本地优先存储</span>
                      <Badge variant="default">已开启</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">端到端加密</span>
                      <Badge variant="default">已开启</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">数据匿名化</span>
                      <Badge variant="default">已开启</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};