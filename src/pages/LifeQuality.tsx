import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  HeartHandshake, 
  Calendar, 
  Scale, 
  Target, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Clock, 
  MapPin, 
  DollarSign, 
  Activity,
  BookOpen,
  Camera,
  Coffee,
  Music,
  Mountain,
  Lightbulb,
  LifeBuoy,
  Palette
} from 'lucide-react';
import { lifeQualityService, type LifeSatisfactionAssessment, type Hobby as HobbyType, type LeisureActivity, type LifeBalanceAnalysis, type LifeQualityPlan, type LifeQualityActionItem } from '@/services/lifeQualityService';
import { journalService } from '@/services/journalService';
import { useAuth } from '@/hooks/useAuth';

const LifeQuality: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('satisfaction');
  const [satisfactionAssessment, setSatisfactionAssessment] = useState<LifeSatisfactionAssessment | null>(null);
  const [hobbies, setHobbies] = useState<HobbyType[]>([]);
  const [leisureActivities, setLeisureActivities] = useState<LeisureActivity[]>([]);
  const [lifeBalance, setLifeBalance] = useState<LifeBalanceAnalysis | null>(null);
  const [lifeQualityPlan, setLifeQualityPlan] = useState<LifeQualityPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLifeQualityData();
    }
  }, [user]);

  const loadLifeQualityData = async () => {
    try {
      setLoading(true);

      // 获取日记条目
      const entries = await journalService.getEntries();

      // 并行加载所有数据
      const [satisfactionData, hobbiesData, activitiesData, balanceData, planData] = await Promise.all([
        lifeQualityService.assessLifeSatisfaction(entries),
        lifeQualityService.discoverHobbies(entries),
        lifeQualityService.getLeisureActivityRecommendations(entries),
        lifeQualityService.analyzeLifeBalance(entries),
        lifeQualityService.getLifeQualityPlan()
      ]);

      setSatisfactionAssessment(satisfactionData);
      setHobbies(hobbiesData);
      setLeisureActivities(activitiesData);
      setLifeBalance(balanceData);
      setLifeQualityPlan(planData);
    } catch (error) {
      console.error('Error loading life quality data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateActionItem = async (actionItemId: string, updates: Partial<LifeQualityActionItem>) => {
    try {
      await lifeQualityService.updateLifeQualityActionItem(actionItemId, updates);
      if (lifeQualityPlan) {
        setLifeQualityPlan({
          ...lifeQualityPlan,
          actionItems: lifeQualityPlan.actionItems.map(item => 
            item.id === actionItemId ? { ...item, ...updates } : item
          )
        });
      }
    } catch (error) {
      console.error('Error updating action item:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">加载生活品质数据中...</h2>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <HeartHandshake className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">生活品质提升</h1>
      </div>

      {/* 功能标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="satisfaction" className="flex items-center gap-2">
            <HeartHandshake className="h-4 w-4" />
            <span>生活满意度</span>
          </TabsTrigger>
          <TabsTrigger value="hobbies" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>兴趣爱好</span>
          </TabsTrigger>
          <TabsTrigger value="leisure" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>休闲活动</span>
          </TabsTrigger>
          <TabsTrigger value="balance" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            <span>生活平衡</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>提升计划</span>
          </TabsTrigger>
        </TabsList>

        {/* 生活满意度评估 */}
        <TabsContent value="satisfaction" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>生活满意度评估</CardTitle>
              <CardDescription>基于你的日记内容生成的生活满意度分析</CardDescription>
            </CardHeader>
            <CardContent>
              {satisfactionAssessment && (
                <div className="space-y-6">
                  {/* 总体满意度得分 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">总体生活满意度</span>
                      <span className="font-semibold">{satisfactionAssessment.overallScore}/100</span>
                    </div>
                    <Progress value={satisfactionAssessment.overallScore} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>需要改进</span>
                      <span>一般</span>
                      <span>满意</span>
                      <span>非常满意</span>
                    </div>
                  </div>

                  <Separator />

                  {/* 各维度得分 */}
                  <div>
                    <h4 className="font-medium mb-3">各维度得分</h4>
                    <div className="space-y-3">
                      {Object.entries(satisfactionAssessment.dimensionScores).map(([dimension, score]) => (
                        <div key={dimension}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">{getDimensionName(dimension)}</span>
                            <span className="text-sm font-medium">{score}/100</span>
                          </div>
                          <Progress value={score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* 优势与改进领域 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 优势 */}
                    <div>
                      <h4 className="font-medium mb-3">优势领域</h4>
                      <div className="space-y-2">
                        {satisfactionAssessment.strengths.map((strength, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{strength}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 改进领域 */}
                    <div>
                      <h4 className="font-medium mb-3">改进领域</h4>
                      <div className="space-y-2">
                        {satisfactionAssessment.areasForImprovement.map((area, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                            <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{area}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 洞察与建议 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 洞察 */}
                    <div>
                      <h4 className="font-medium mb-3">洞察</h4>
                      <div className="space-y-2">
                        {satisfactionAssessment.insights.map((insight, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 建议 */}
                    <div>
                      <h4 className="font-medium mb-3">建议</h4>
                      <div className="space-y-2">
                        {satisfactionAssessment.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 兴趣爱好发现 */}
        <TabsContent value="hobbies" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>兴趣爱好发现</CardTitle>
              <CardDescription>基于你的日记内容推荐的兴趣爱好</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hobbies.map((hobby) => (
                  <div key={hobby.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">{hobby.name}</h5>
                          <Badge variant="secondary">{hobby.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{hobby.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getDifficultyLabel(hobby.difficulty)}
                          </Badge>
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTimeCommitmentLabel(hobby.timeCommitment)}
                          </Badge>
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {getCostLabel(hobby.cost)}
                          </Badge>
                        </div>
                        <div className="mb-3">
                          <h6 className="text-sm font-medium mb-1">益处</h6>
                          <div className="flex flex-wrap gap-1">
                            {hobby.benefits.map((benefit, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium mb-1">推荐资源</h6>
                          <div className="flex flex-wrap gap-1">
                            {hobby.resources.map((resource, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2 ml-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">匹配度</span>
                        </div>
                        <span className="text-lg font-bold">{hobby.matchScore}%</span>
                        <Button size="sm" variant="primary">
                          了解更多
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 休闲活动推荐 */}
        <TabsContent value="leisure" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>休闲活动推荐</CardTitle>
              <CardDescription>基于你的日记内容推荐的休闲活动</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leisureActivities.map((activity) => (
                  <div key={activity.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">{activity.name}</h5>
                          <Badge variant="secondary">{activity.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{activity.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{activity.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{activity.cost}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{activity.recommendedFrequency}</span>
                          </div>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium mb-1">益处</h6>
                          <div className="flex flex-wrap gap-1">
                            {activity.benefits.map((benefit, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2 ml-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">匹配度</span>
                        </div>
                        <span className="text-lg font-bold">{activity.matchScore}%</span>
                        <Button size="sm" variant="primary">
                          尝试一下
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 生活平衡分析 */}
        <TabsContent value="balance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>生活平衡分析</CardTitle>
              <CardDescription>基于你的日记内容生成的生活平衡分析</CardDescription>
            </CardHeader>
            <CardContent>
              {lifeBalance && (
                <div className="space-y-6">
                  {/* 生活平衡得分 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">生活平衡得分</span>
                      <span className="font-semibold">{lifeBalance.balanceScore}/100</span>
                    </div>
                    <Progress value={lifeBalance.balanceScore} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>不平衡</span>
                      <span>基本平衡</span>
                      <span>平衡</span>
                      <span>非常平衡</span>
                    </div>
                  </div>

                  <Separator />

                  {/* 不平衡领域 */}
                  {lifeBalance.imbalanceAreas.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">不平衡领域</h4>
                      <div className="space-y-2">
                        {lifeBalance.imbalanceAreas.map((area, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                            <Scale className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{area}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* 平衡建议 */}
                  <div>
                    <h4 className="font-medium mb-3">平衡建议</h4>
                    <div className="space-y-3">
                      {lifeBalance.balanceRecommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                          <div className="flex-shrink-0">
                            <ArrowRight className="h-5 w-5 text-primary" />
                          </div>
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* 平衡小贴士 */}
                  <div>
                    <h4 className="font-medium mb-3">平衡小贴士</h4>
                    <div className="space-y-2">
                      {lifeBalance.balanceTips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 生活品质提升计划 */}
        <TabsContent value="plan" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>生活品质提升计划</CardTitle>
              <CardDescription>基于你的生活满意度和平衡分析制定的提升计划</CardDescription>
            </CardHeader>
            <CardContent>
              {lifeQualityPlan && (
                <div className="space-y-6">
                  {/* 计划概览 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">计划进度</span>
                      <span className="font-semibold">{lifeQualityPlan.progress}%</span>
                    </div>
                    <Progress value={lifeQualityPlan.progress} className="h-2" />
                  </div>

                  <Separator />

                  {/* 计划目标 */}
                  <div>
                    <h4 className="font-medium mb-3">计划目标</h4>
                    <div className="space-y-2">
                      {lifeQualityPlan.goals.map((goal, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-sm">{goal}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* 行动项 */}
                  <div>
                    <h4 className="font-medium mb-3">行动项</h4>
                    <div className="space-y-3">
                      {lifeQualityPlan.actionItems.map((actionItem) => (
                        <div key={actionItem.id} className="p-3 border rounded-lg hover:bg-muted transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-sm mb-1">{actionItem.title}</h5>
                              <p className="text-sm text-muted-foreground mb-2">{actionItem.description}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {getDimensionName(actionItem.relatedDimension)}
                                </Badge>
                                <Badge variant={actionItem.priority === 'high' ? 'destructive' : actionItem.priority === 'medium' ? 'warning' : 'secondary'} className="text-xs">
                                  {actionItem.priority === 'high' ? '高优先级' : actionItem.priority === 'medium' ? '中优先级' : '低优先级'}
                                </Badge>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant={actionItem.completed ? 'secondary' : 'primary'}
                              onClick={() => handleUpdateActionItem(actionItem.id, { completed: !actionItem.completed })}
                            >
                              {actionItem.completed ? '已完成' : '标记完成'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* 预期成果 */}
                  <div>
                    <h4 className="font-medium mb-3">预期成果</h4>
                    <div className="space-y-2">
                      {lifeQualityPlan.expectedOutcomes.map((outcome, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm">{outcome}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// 辅助函数：获取维度名称
function getDimensionName(dimension: string): string {
  const dimensionNames: Record<string, string> = {
    'health': '健康',
    'relationships': '人际关系',
    'career': '职业发展',
    'leisure': '休闲生活',
    'personal-growth': '个人成长',
    'environment': '环境适应',
    'finances': '财务管理',
    'sense-of-purpose': '人生意义'
  };
  return dimensionNames[dimension] || dimension;
}

// 辅助函数：获取难度标签
function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    'beginner': '入门',
    'intermediate': '中级',
    'advanced': '高级'
  };
  return labels[difficulty] || difficulty;
}

// 辅助函数：获取时间投入标签
function getTimeCommitmentLabel(timeCommitment: string): string {
  const labels: Record<string, string> = {
    'low': '低',
    'medium': '中',
    'high': '高'
  };
  return labels[timeCommitment] || timeCommitment;
}

// 辅助函数：获取成本标签
function getCostLabel(cost: string): string {
  const labels: Record<string, string> = {
    'low': '低',
    'medium': '中',
    'high': '高'
  };
  return labels[cost] || cost;
}

export default LifeQuality;
