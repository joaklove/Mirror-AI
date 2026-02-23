import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  CalendarCheck, 
  BrainCircuit, 
  Trophy, 
  BookOpen, 
  Lightbulb, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Clock, 
  Calendar, 
  Flame, 
  BarChart3, 
  TrendingUp, 
  Award,
  Bookmark,
  ListTodo,
  ChevronRight,
  AlertCircle,
  Heart
} from 'lucide-react';
import { personalGrowthService, type Goal, type Habit, type Skill, type Achievement, type GrowthInsight } from '@/services/personalGrowthService';
import { useAuth } from '@/hooks/useAuth';

const PersonalGrowth: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('goals');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [insights, setInsights] = useState<GrowthInsight[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPersonalGrowthData();
    }
  }, [user]);

  const loadPersonalGrowthData = async () => {
    try {
      setLoading(true);

      // 并行加载所有数据
      const [goalsData, habitsData, skillsData, achievementsData, insightsData, recommendationsData] = await Promise.all([
        personalGrowthService.getGoals(),
        personalGrowthService.getHabits(),
        personalGrowthService.getSkills(),
        personalGrowthService.getAchievements(),
        personalGrowthService.getGrowthInsights(),
        personalGrowthService.generatePersonalizedGrowthRecommendations()
      ]);

      setGoals(goalsData);
      setHabits(habitsData);
      setSkills(skillsData);
      setAchievements(achievementsData);
      setInsights(insightsData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Error loading personal growth data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">加载个人成长数据中...</h2>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <TrendingUp className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">个人成长生态</h1>
      </div>

      {/* 功能标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>目标</span>
          </TabsTrigger>
          <TabsTrigger value="habits" className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            <span>习惯</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            <span>技能</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>成就</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span>洞察</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>建议</span>
          </TabsTrigger>
        </TabsList>

        {/* 目标管理 */}
        <TabsContent value="goals" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>目标管理</CardTitle>
              <CardDescription>设定和追踪你的个人成长目标</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">{goal.title}</h5>
                          <Badge variant={getGoalStatusVariant(goal.status)}>
                            {getGoalStatusLabel(goal.status)}
                          </Badge>
                          <Badge variant="secondary">{getGoalTypeLabel(goal.type)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{goal.targetDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{goal.priority === 'high' ? '高' : goal.priority === 'medium' ? '中' : '低'}优先级</span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">进度</span>
                            <span className="font-semibold">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {goal.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="primary">
                            查看详情
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

          {/* 目标统计 */}
          <Card>
            <CardHeader>
              <CardTitle>目标统计</CardTitle>
              <CardDescription>你的目标完成情况统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">总目标数</div>
                  <div className="text-2xl font-bold">{goals.length}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">进行中</div>
                  <div className="text-2xl font-bold">{goals.filter(g => g.status === 'active').length}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">已完成</div>
                  <div className="text-2xl font-bold">{goals.filter(g => g.status === 'completed').length}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">平均进度</div>
                  <div className="text-2xl font-bold">{Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 习惯养成 */}
        <TabsContent value="habits" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>习惯养成</CardTitle>
              <CardDescription>培养和追踪你的个人习惯</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {habits.map((habit) => (
                  <div key={habit.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">{habit.title}</h5>
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
                          {habit.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="primary">
                            记录完成
                          </Button>
                          <Button size="sm" variant="secondary">
                            查看详情
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2 ml-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center" 
                          style={{ backgroundColor: habit.color }}
                        >
                          {getHabitIcon(habit.icon)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 习惯统计 */}
          <Card>
            <CardHeader>
              <CardTitle>习惯统计</CardTitle>
              <CardDescription>你的习惯养成情况统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">总习惯数</div>
                  <div className="text-2xl font-bold">{habits.length}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">最长连续</div>
                  <div className="text-2xl font-bold">{Math.max(...habits.map(h => h.streak), 0)} 天</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">总完成次数</div>
                  <div className="text-2xl font-bold">{habits.reduce((sum, h) => sum + h.totalCompletions, 0)}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">平均完成率</div>
                  <div className="text-2xl font-bold">{Math.round(habits.reduce((sum, h) => sum + h.completionRate, 0) / habits.length)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 技能学习 */}
        <TabsContent value="skills" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>技能学习</CardTitle>
              <CardDescription>学习和提升你的技能</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">{skill.name}</h5>
                          <Badge variant="secondary">{skill.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{skill.description}</p>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{getSkillLevelLabel(skill.currentLevel)} → {getSkillLevelLabel(skill.targetLevel)}</span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">学习进度</span>
                            <span className="font-semibold">{skill.progress}%</span>
                          </div>
                          <Progress value={skill.progress} className="h-2" />
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {skill.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="primary">
                            学习资源
                          </Button>
                          <Button size="sm" variant="secondary">
                            练习活动
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 技能统计 */}
          <Card>
            <CardHeader>
              <CardTitle>技能统计</CardTitle>
              <CardDescription>你的技能学习情况统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">总技能数</div>
                  <div className="text-2xl font-bold">{skills.length}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">高级技能</div>
                  <div className="text-2xl font-bold">{skills.filter(s => s.currentLevel === 'advanced' || s.currentLevel === 'expert').length}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">学习资源</div>
                  <div className="text-2xl font-bold">{skills.reduce((sum, s) => sum + s.learningResources.length, 0)}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">平均进度</div>
                  <div className="text-2xl font-bold">{Math.round(skills.reduce((sum, s) => sum + s.progress, 0) / skills.length)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 成就系统 */}
        <TabsContent value="achievements" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>成就系统</CardTitle>
              <CardDescription>追踪和庆祝你的个人成就</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">{achievement.title}</h5>
                          <Badge variant="secondary">{getAchievementTypeLabel(achievement.type)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{achievement.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm">{achievement.points} 积分</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {achievement.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2 ml-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Award className="h-6 w-6 text-yellow-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 成就统计 */}
          <Card>
            <CardHeader>
              <CardTitle>成就统计</CardTitle>
              <CardDescription>你的成就获取情况统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">总成就数</div>
                  <div className="text-2xl font-bold">{achievements.length}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">总积分</div>
                  <div className="text-2xl font-bold">{achievements.reduce((sum, a) => sum + a.points, 0)}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">目标成就</div>
                  <div className="text-2xl font-bold">{achievements.filter(a => a.type === 'goal').length}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">习惯成就</div>
                  <div className="text-2xl font-bold">{achievements.filter(a => a.type === 'habit').length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 成长洞察 */}
        <TabsContent value="insights" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>成长洞察</CardTitle>
              <CardDescription>基于你的活动生成的个性化洞察</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">{insight.title}</h5>
                          <Badge variant={getInsightImpactVariant(insight.impact)}>
                            {getInsightImpactLabel(insight.impact)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                        {insight.actionable && insight.actionSuggestion && (
                          <div className="p-3 bg-primary/5 rounded-lg mb-3">
                            <div className="flex items-start gap-2">
                              <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <p className="text-sm">{insight.actionSuggestion}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{insight.date}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2 ml-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Lightbulb className="h-6 w-6 text-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 个性化建议 */}
        <TabsContent value="recommendations" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>个性化建议</CardTitle>
              <CardDescription>基于你的成长数据生成的个性化建议</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 学习路径推荐 */}
          <Card>
            <CardHeader>
              <CardTitle>学习路径推荐</CardTitle>
              <CardDescription>基于你的兴趣和目标推荐的学习路径</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium mb-2">前端开发者路径</h5>
                      <p className="text-sm text-muted-foreground mb-3">从零基础到前端开发工程师的学习路径，包含HTML、CSS、JavaScript、React等技能</p>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">6个月</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BrainCircuit className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">初级</span>
                        </div>
                      </div>
                      <Button size="sm" variant="primary">
                        查看详情
                      </Button>
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

// 辅助函数：获取目标类型标签
function getGoalTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'short-term': '短期',
    'medium-term': '中期',
    'long-term': '长期'
  };
  return labels[type] || type;
}

// 辅助函数：获取习惯类型标签
function getHabitTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'daily': '每日',
    'weekly': '每周',
    'custom': '自定义'
  };
  return labels[type] || type;
}

// 辅助函数：获取习惯图标
function getHabitIcon(icon: string): React.ReactNode {
  switch (icon) {
    case 'sun':
      return <CalendarCheck className="h-6 w-6 text-white" />;
    case 'moon':
      return <Heart className="h-6 w-6 text-white" />;
    case 'book':
      return <BookOpen className="h-6 w-6 text-white" />;
    default:
      return <ListTodo className="h-6 w-6 text-white" />;
  }
}

// 辅助函数：获取技能等级标签
function getSkillLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    'beginner': '初级',
    'intermediate': '中级',
    'advanced': '高级',
    'expert': '专家'
  };
  return labels[level] || level;
}

// 辅助函数：获取成就类型标签
function getAchievementTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'goal': '目标',
    'habit': '习惯',
    'skill': '技能',
    'milestone': '里程碑',
    'custom': '自定义'
  };
  return labels[type] || type;
}

// 辅助函数：获取洞察影响标签
function getInsightImpactLabel(impact: string): string {
  const labels: Record<string, string> = {
    'low': '低影响',
    'medium': '中等影响',
    'high': '高影响'
  };
  return labels[impact] || impact;
}

// 辅助函数：获取洞察影响变体
function getInsightImpactVariant(impact: string): string {
  const variants: Record<string, string> = {
    'low': 'secondary',
    'medium': 'warning',
    'high': 'primary'
  };
  return variants[impact] || 'secondary';
}

export default PersonalGrowth;
