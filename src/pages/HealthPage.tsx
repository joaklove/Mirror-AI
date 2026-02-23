import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Activity, 
  Moon, 
  Apple, 
  Droplets, 
  Brain, 
  AlertTriangle, 
  BookOpen, 
  Target, 
  Calendar, 
  BarChart3, 
  Watch, 
  Bell, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Clock, 
  Flame,
  ChevronRight,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { healthService, type HealthData, type HealthHabit, type HealthArticle, type HealthRiskAssessment, type HealthGoal, type HealthReminder } from '@/services/healthService';
import { useAuth } from '@/hooks/useAuth';

const HealthPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [healthHabits, setHealthHabits] = useState<HealthHabit[]>([]);
  const [healthArticles, setHealthArticles] = useState<HealthArticle[]>([]);
  const [healthRiskAssessment, setHealthRiskAssessment] = useState<HealthRiskAssessment | null>(null);
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  const [healthReminders, setHealthReminders] = useState<HealthReminder[]>([]);
  const [healthRecommendations, setHealthRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHealthData();
    }
  }, [user]);

  const loadHealthData = async () => {
    try {
      setLoading(true);

      // 并行加载所有数据
      const [data, habits, articles, riskAssessment, goals, reminders, recommendations] = await Promise.all([
        healthService.getHealthData(),
        healthService.getHealthHabits(),
        healthService.getHealthArticles(),
        healthService.generateHealthRiskAssessment(),
        healthService.getHealthGoals(),
        healthService.getHealthReminders(),
        healthService.generateHealthRecommendations()
      ]);

      setHealthData(data);
      setHealthHabits(habits);
      setHealthArticles(articles);
      setHealthRiskAssessment(riskAssessment);
      setHealthGoals(goals);
      setHealthReminders(reminders);
      setHealthRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">加载健康数据中...</h2>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <Heart className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">健康生活倡导</h1>
      </div>

      {/* 功能标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>概览</span>
          </TabsTrigger>
          <TabsTrigger value="habits" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>习惯</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>数据</span>
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>风险评估</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>目标</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>知识</span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>提醒</span>
          </TabsTrigger>
        </TabsList>

        {/* 健康概览 */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* 健康状态卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>睡眠状态</CardTitle>
                <CardDescription>最近的睡眠情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Moon className="h-6 w-6 text-indigo-500" />
                    <span className="text-2xl font-bold">7.5</span>
                    <span className="text-sm text-muted-foreground">小时</span>
                  </div>
                  <Badge variant="secondary">良好</Badge>
                </div>
                <Progress value={75} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>不足</span>
                  <span>良好</span>
                  <span>充足</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>运动状态</CardTitle>
                <CardDescription>最近的运动情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-6 w-6 text-red-500" />
                    <span className="text-2xl font-bold">35</span>
                    <span className="text-sm text-muted-foreground">分钟</span>
                  </div>
                  <Badge variant="secondary">达标</Badge>
                </div>
                <Progress value={70} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>不足</span>
                  <span>达标</span>
                  <span>充足</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>情绪状态</CardTitle>
                <CardDescription>最近的情绪情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Heart className="h-6 w-6 text-red-500" />
                    <span className="text-2xl font-bold">7.5</span>
                    <span className="text-sm text-muted-foreground">分</span>
                  </div>
                  <Badge variant="secondary">良好</Badge>
                </div>
                <Progress value={75} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>较差</span>
                  <span>良好</span>
                  <span>优秀</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 健康习惯概览 */}
          <Card>
            <CardHeader>
              <CardTitle>健康习惯概览</CardTitle>
              <CardDescription>你的健康习惯养成情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthHabits.map((habit) => (
                  <div key={habit.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center" 
                        style={{ backgroundColor: habit.color }}
                      >
                        {getHabitIcon(habit.icon)}
                      </div>
                      <div>
                        <h5 className="font-medium">{habit.name}</h5>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">连续 {habit.streak} 天</span>
                          <span className="text-sm text-muted-foreground">完成率 {habit.completionRate}%</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="primary">
                      记录
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 健康建议 */}
          <Card>
            <CardHeader>
              <CardTitle>健康生活建议</CardTitle>
              <CardDescription>基于你的健康数据生成的个性化建议</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthRecommendations.slice(0, 4).map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                    <div className="flex-shrink-0">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="secondary" className="mt-4">
                查看更多建议
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 健康习惯 */}
        <TabsContent value="habits" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>健康习惯</CardTitle>
              <CardDescription>培养和追踪你的健康习惯</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthHabits.map((habit) => (
                  <div key={habit.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center" 
                            style={{ backgroundColor: habit.color }}
                          >
                            {getHabitIcon(habit.icon)}
                          </div>
                          <h5 className="font-medium">{habit.name}</h5>
                          <Badge variant="secondary">{getHabitTypeLabel(habit.type)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{habit.description}</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            <Flame className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">连续 {habit.streak} 天</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">完成率 {habit.completionRate}%</span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">完成情况</span>
                            <span className="font-semibold">{habit.totalCompletions} 次</span>
                          </div>
                          <Progress value={habit.completionRate} className="h-2" />
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {habit.benefits.map((benefit, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="primary">
                            记录完成
                          </Button>
                          <Button size="sm" variant="secondary">
                            编辑习惯
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 健康数据 */}
        <TabsContent value="data" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>健康数据</CardTitle>
              <CardDescription>追踪和分析你的健康数据</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthData.map((data) => (
                  <div key={data.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">{getHealthDataTypeLabel(data.type)}</h5>
                          <Badge variant="secondary">{data.source}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl font-bold">{data.value}</span>
                          <span className="text-muted-foreground">{data.unit}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{data.date}</span>
                          </div>
                          {data.time && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{data.time}</span>
                            </div>
                          )}
                        </div>
                        {data.notes && (
                          <p className="text-sm text-muted-foreground mb-3">{data.notes}</p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {data.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button size="sm" variant="secondary">
                        编辑
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 健康风险评估 */}
        <TabsContent value="risk" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>健康风险评估</CardTitle>
              <CardDescription>基于你的健康数据生成的风险评估</CardDescription>
            </CardHeader>
            <CardContent>
              {healthRiskAssessment && (
                <div className="space-y-6">
                  {/* 总体风险评估 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">总体健康风险</span>
                      <span className="font-semibold">{healthRiskAssessment.overallRiskScore}/100</span>
                    </div>
                    <Progress value={healthRiskAssessment.overallRiskScore} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>低风险</span>
                      <span>中等风险</span>
                      <span>高风险</span>
                    </div>
                  </div>

                  <Separator />

                  {/* 风险因素 */}
                  <div>
                    <h4 className="font-medium mb-3">风险因素</h4>
                    <div className="space-y-3">
                      {healthRiskAssessment.riskFactors.map((riskFactor) => (
                        <div key={riskFactor.id} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-medium">{riskFactor.name}</h5>
                            <Badge variant={getRiskLevelVariant(riskFactor.riskLevel)}>
                              {getRiskLevelLabel(riskFactor.riskLevel)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{riskFactor.description}</p>
                          <div className="mb-3">
                            <h6 className="text-sm font-medium mb-1">影响因素</h6>
                            <div className="flex flex-wrap gap-1">
                              {riskFactor.contributingFactors.map((factor, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h6 className="text-sm font-medium mb-1">缓解策略</h6>
                            <div className="space-y-1">
                              {riskFactor.mitigationStrategies.map((strategy, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{strategy}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* 建议 */}
                  <div>
                    <h4 className="font-medium mb-3">建议</h4>
                    <div className="space-y-2">
                      {healthRiskAssessment.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* 下一步 */}
                  <div>
                    <h4 className="font-medium mb-3">下一步</h4>
                    <div className="space-y-2">
                      {healthRiskAssessment.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {healthRiskAssessment.notes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{healthRiskAssessment.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 健康目标 */}
        <TabsContent value="goals" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>健康目标</CardTitle>
              <CardDescription>设定和追踪你的健康目标</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthGoals.map((goal) => (
                  <div key={goal.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">{goal.name}</h5>
                          <Badge variant={getGoalStatusVariant(goal.status)}>
                            {getGoalStatusLabel(goal.status)}
                          </Badge>
                          <Badge variant="secondary">{getHealthDataTypeLabel(goal.type)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">目标: {goal.targetValue}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">当前: {goal.currentValue}</span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">进度</span>
                            <span className="font-semibold">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>
                        <div className="mb-3">
                          <h6 className="text-sm font-medium mb-1">行动项</h6>
                          <div className="space-y-1">
                            {goal.actionItems.map((actionItem, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="flex-shrink-0">
                                  {actionItem.completed ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div>
                                  <span className="text-sm">{actionItem.name}</span>
                                  {actionItem.dueDate && (
                                    <span className="text-xs text-muted-foreground ml-2">截止: {actionItem.dueDate}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="primary">
                            更新进度
                          </Button>
                          <Button size="sm" variant="secondary">
                            编辑目标
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 健康知识 */}
        <TabsContent value="knowledge" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>健康知识</CardTitle>
              <CardDescription>了解健康知识，提升健康意识</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthArticles.map((article) => (
                  <div key={article.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium mb-2">{article.title}</h5>
                        <p className="text-sm text-muted-foreground mb-3">{article.content.substring(0, 100)}...</p>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{article.readingTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{article.publishDate}</span>
                          </div>
                          <Badge variant="secondary">{article.difficulty}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {article.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button size="sm" variant="primary">
                          阅读全文
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 健康提醒 */}
        <TabsContent value="reminders" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>健康提醒</CardTitle>
              <CardDescription>管理你的健康提醒</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthReminders.map((reminder) => (
                  <div key={reminder.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">{reminder.name}</h5>
                          <Badge variant={reminder.active ? 'secondary' : 'outline'}>
                            {reminder.active ? '活跃' : '已关闭'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{reminder.description}</p>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{reminder.schedule.type === 'daily' ? '每天' : reminder.schedule.type === 'weekly' ? '每周' : '自定义'} {reminder.schedule.time}</span>
                          </div>
                          {reminder.nextTrigger && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">下次提醒: {reminder.nextTrigger}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant={reminder.active ? 'secondary' : 'primary'}>
                            {reminder.active ? '暂停' : '启用'}
                          </Button>
                          <Button size="sm" variant="secondary">
                            编辑
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// 辅助函数：获取健康数据类型标签
function getHealthDataTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'physical': '身体',
    'mental': '心理',
    'sleep': '睡眠',
    'nutrition': '营养',
    'exercise': '运动',
    'mood': '情绪',
    'energy': '能量',
    'stress': '压力'
  };
  return labels[type] || type;
}

// 辅助函数：获取健康习惯类型标签
function getHabitTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'sleep': '睡眠',
    'nutrition': '营养',
    'exercise': '运动',
    'hydration': '水分',
    'meditation': '冥想',
    'other': '其他'
  };
  return labels[type] || type;
}

// 辅助函数：获取健康习惯图标
function getHabitIcon(icon: string): React.ReactNode {
  switch (icon) {
    case 'moon':
      return <Moon className="h-5 w-5 text-white" />;
    case 'dumbbell':
      return <Activity className="h-5 w-5 text-white" />;
    case 'droplets':
      return <Droplets className="h-5 w-5 text-white" />;
    case 'brain':
      return <Brain className="h-5 w-5 text-white" />;
    case 'apple':
      return <Apple className="h-5 w-5 text-white" />;
    default:
      return <Heart className="h-5 w-5 text-white" />;
  }
}

// 辅助函数：获取风险等级标签
function getRiskLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    'low': '低风险',
    'medium': '中等风险',
    'high': '高风险'
  };
  return labels[level] || level;
}

// 辅助函数：获取风险等级变体
function getRiskLevelVariant(level: string): string {
  const variants: Record<string, string> = {
    'low': 'success',
    'medium': 'warning',
    'high': 'destructive'
  };
  return variants[level] || 'secondary';
}

// 辅助函数：获取目标状态标签
function getGoalStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'active': '进行中',
    'completed': '已完成',
    'paused': '已暂停',
    'abandoned': '已放弃'
  };
  return labels[status] || status;
}

// 辅助函数：获取目标状态变体
function getGoalStatusVariant(status: string): string {
  const variants: Record<string, string> = {
    'active': 'primary',
    'completed': 'success',
    'paused': 'warning',
    'abandoned': 'destructive'
  };
  return variants[status] || 'secondary';
}

export default HealthPage;
