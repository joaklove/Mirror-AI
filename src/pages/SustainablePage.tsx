import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Leaf, 
  Activity, 
  BarChart3, 
  Calendar, 
  BookOpen, 
  Target, 
  ShoppingBag, 
  Users, 
  Lightbulb, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  Clock, 
  Droplets, 
  Recycle, 
  Bike, 
  Apple, 
  AlertCircle, 
  Flame, 
  Zap, 
  Globe, 
  Award, 
  TrendingDown, 
  DollarSign,
  MapPin
} from 'lucide-react';
import { sustainableService, type SustainabilityData, type SustainableHabit, type SustainableArticle, type CarbonFootprint, type SustainabilityChallenge, type SustainableProduct, type SustainabilityEvent } from '@/services/sustainableService';
import { useAuth } from '@/contexts/AuthContext';

const SustainablePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sustainabilityData, setSustainabilityData] = useState<SustainabilityData[]>([]);
  const [sustainableHabits, setSustainableHabits] = useState<SustainableHabit[]>([]);
  const [sustainableArticles, setSustainableArticles] = useState<SustainableArticle[]>([]);
  const [carbonFootprint, setCarbonFootprint] = useState<CarbonFootprint | null>(null);
  const [sustainabilityChallenges, setSustainabilityChallenges] = useState<SustainabilityChallenge[]>([]);
  const [sustainableProducts, setSustainableProducts] = useState<SustainableProduct[]>([]);
  const [sustainabilityEvents, setSustainabilityEvents] = useState<SustainabilityEvent[]>([]);
  const [sustainabilityRecommendations, setSustainabilityRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSustainabilityData();
    }
  }, [user]);

  const loadSustainabilityData = async () => {
    try {
      setLoading(true);

      // 并行加载所有数据
      const [data, habits, articles, footprint, challenges, products, events, recommendations] = await Promise.all([
        sustainableService.getSustainabilityData(),
        sustainableService.getSustainableHabits(),
        sustainableService.getSustainableArticles(),
        sustainableService.calculateCarbonFootprint(),
        sustainableService.getSustainabilityChallenges(),
        sustainableService.getSustainableProducts(),
        sustainableService.getSustainabilityEvents(),
        sustainableService.generateSustainabilityRecommendations()
      ]);

      setSustainabilityData(data);
      setSustainableHabits(habits);
      setSustainableArticles(articles);
      setCarbonFootprint(footprint);
      setSustainabilityChallenges(challenges);
      setSustainableProducts(products);
      setSustainabilityEvents(events);
      setSustainabilityRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading sustainability data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">加载可持续生活数据中...</h2>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <Leaf className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">可持续生活</h1>
      </div>

      {/* 功能标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-8">
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
          <TabsTrigger value="footprint" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>碳足迹</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>挑战</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>知识</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span>产品</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>活动</span>
          </TabsTrigger>
        </TabsList>

        {/* 可持续生活概览 */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* 可持续生活状态卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>碳足迹</CardTitle>
                <CardDescription>最近的碳排放情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-6 w-6 text-green-500" />
                    <span className="text-2xl font-bold">4.5</span>
                    <span className="text-sm text-muted-foreground">kg CO₂</span>
                  </div>
                  <Badge variant="secondary">中等</Badge>
                </div>
                <Progress value={45} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>低</span>
                  <span>中等</span>
                  <span>高</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>能源消耗</CardTitle>
                <CardDescription>最近的能源使用情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-yellow-500" />
                    <span className="text-2xl font-bold">8.2</span>
                    <span className="text-sm text-muted-foreground">kWh</span>
                  </div>
                  <Badge variant="secondary">中等</Badge>
                </div>
                <Progress value={41} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>低</span>
                  <span>中等</span>
                  <span>高</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>用水量</CardTitle>
                <CardDescription>最近的用水情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-6 w-6 text-blue-500" />
                    <span className="text-2xl font-bold">120</span>
                    <span className="text-sm text-muted-foreground">L</span>
                  </div>
                  <Badge variant="secondary">低</Badge>
                </div>
                <Progress value={24} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>低</span>
                  <span>中等</span>
                  <span>高</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 可持续生活习惯概览 */}
          <Card>
            <CardHeader>
              <CardTitle>可持续生活习惯概览</CardTitle>
              <CardDescription>你的可持续生活习惯养成情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sustainableHabits.map((habit) => (
                  <div key={habit.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center" 
                        style={{ backgroundColor: habit.color }}
                      >
                        {getSustainableHabitIcon(habit.icon)}
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

          {/* 可持续生活建议 */}
          <Card>
            <CardHeader>
              <CardTitle>可持续生活建议</CardTitle>
              <CardDescription>基于你的可持续生活数据生成的个性化建议</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sustainabilityRecommendations.slice(0, 4).map((recommendation, index) => (
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

        {/* 可持续生活习惯 */}
        <TabsContent value="habits" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>可持续生活习惯</CardTitle>
              <CardDescription>培养和追踪你的可持续生活习惯</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sustainableHabits.map((habit) => (
                  <div key={habit.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center" 
                            style={{ backgroundColor: habit.color }}
                          >
                            {getSustainableHabitIcon(habit.icon)}
                          </div>
                          <h5 className="font-medium">{habit.name}</h5>
                          <Badge variant="secondary">{getSustainableHabitTypeLabel(habit.type)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{habit.description}</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">连续 {habit.streak} 天</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">完成率 {habit.completionRate}%</span>
                          </div>
                        </div>
                        {habit.carbonReduction && (
                          <div className="flex items-center gap-1 mb-3">
                            <TrendingDown className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-500">碳减排 {habit.carbonReduction} kg CO₂</span>
                          </div>
                        )}
                        <div className="mb-3">
                          <h6 className="text-sm font-medium mb-1">环境影响</h6>
                          <p className="text-xs text-muted-foreground">{habit.environmentalImpact}</p>
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

        {/* 可持续生活数据 */}
        <TabsContent value="data" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>可持续生活数据</CardTitle>
              <CardDescription>追踪和分析你的可持续生活数据</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sustainabilityData.map((data) => (
                  <div key={data.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">{getSustainabilityDataTypeLabel(data.type)}</h5>
                          <Badge variant="secondary">{data.source}</Badge>
                          <Badge variant={getImpactVariant(data.impact)}>
                            {getImpactLabel(data.impact)}
                          </Badge>
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

        {/* 碳足迹 */}
        <TabsContent value="footprint" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>碳足迹分析</CardTitle>
              <CardDescription>基于你的生活方式生成的碳足迹分析</CardDescription>
            </CardHeader>
            <CardContent>
              {carbonFootprint && (
                <div className="space-y-6">
                  {/* 总体碳足迹 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">总体碳足迹</span>
                      <span className="font-semibold">{carbonFootprint.totalEmissions} kg CO₂</span>
                    </div>
                    <Progress value={(carbonFootprint.totalEmissions / 10) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>低</span>
                      <span>中等</span>
                      <span>高</span>
                    </div>
                  </div>

                  <Separator />

                  {/* 碳足迹分解 */}
                  <div>
                    <h4 className="font-medium mb-3">碳足迹分解</h4>
                    <div className="space-y-3">
                      {carbonFootprint.breakdown.map((item, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium">{item.category}</h5>
                            <span className="text-sm">{item.emissions} kg CO₂ ({item.percentage}%)</span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* 碳足迹趋势 */}
                  <div>
                    <h4 className="font-medium mb-3">碳足迹趋势</h4>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-5 w-5 text-green-500" />
                        <span className="font-medium">本周碳足迹较上周减少了 {Math.abs(carbonFootprint.trends.change)} kg CO₂</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{carbonFootprint.trends.direction === 'decrease' ? '良好趋势，继续保持！' : '需要注意，碳足迹有所增加。'}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* 建议 */}
                  <div>
                    <h4 className="font-medium mb-3">减少碳足迹建议</h4>
                    <div className="space-y-2">
                      {carbonFootprint.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* 改进领域 */}
                  <div>
                    <h4 className="font-medium mb-3">改进领域</h4>
                    <div className="space-y-2">
                      {carbonFootprint.improvementAreas.map((area, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {carbonFootprint.notes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{carbonFootprint.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 可持续生活挑战 */}
        <TabsContent value="challenges" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>可持续生活挑战</CardTitle>
              <CardDescription>参与可持续生活挑战，培养环保习惯</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sustainabilityChallenges.map((challenge) => (
                  <div key={challenge.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center" 
                            style={{ backgroundColor: challenge.color }}
                          >
                            {getChallengeIcon(challenge.icon)}
                          </div>
                          <h5 className="font-medium">{challenge.name}</h5>
                          <Badge variant={getDifficultyVariant(challenge.difficulty)}>
                            {getDifficultyLabel(challenge.difficulty)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{challenge.duration} 天</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{challenge.participants} 人参与</span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">成功率</span>
                            <span className="font-semibold">{challenge.successRate}%</span>
                          </div>
                          <Progress value={challenge.successRate} className="h-2" />
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {challenge.benefits.map((benefit, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="primary">
                            参与挑战
                          </Button>
                          <Button size="sm" variant="secondary">
                            查看详情
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

        {/* 可持续生活知识 */}
        <TabsContent value="knowledge" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>可持续生活知识</CardTitle>
              <CardDescription>了解可持续生活的知识和技巧</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sustainableArticles.map((article) => (
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
                        <div className="mb-3">
                          <h6 className="text-sm font-medium mb-1">环境影响</h6>
                          <p className="text-xs text-muted-foreground">{article.environmentalImpact}</p>
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

        {/* 可持续消费产品 */}
        <TabsContent value="products" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>可持续消费产品</CardTitle>
              <CardDescription>选择环保、可持续的产品</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sustainableProducts.map((product) => (
                  <div key={product.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">{product.name}</h5>
                          <Badge variant="secondary">{product.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{product.price} {product.currency}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{product.sustainabilityRating}/5 分</span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <h6 className="text-sm font-medium mb-1">品牌</h6>
                          <span className="text-sm">{product.brand}</span>
                        </div>
                        <div className="mb-3">
                          <h6 className="text-sm font-medium mb-1">环境影响</h6>
                          <p className="text-xs text-muted-foreground">{product.environmentalImpact}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.certifications.map((certification, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {certification}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="primary">
                            查看详情
                          </Button>
                          {product.purchaseLink && (
                            <Button size="sm" variant="secondary">
                              购买
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 可持续生活社区活动 */}
        <TabsContent value="events" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>可持续生活社区活动</CardTitle>
              <CardDescription>参与可持续生活相关的社区活动</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sustainabilityEvents.map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">{event.name}</h5>
                          <Badge variant="secondary">{event.type === 'online' ? '线上' : '线下'}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                        <div className="flex flex-col gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{event.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{event.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{event.participants} 人参与</span>
                          </div>
                          {event.maxParticipants && (
                            <span className="text-sm text-muted-foreground">上限: {event.maxParticipants} 人</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {event.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {event.registrationLink && (
                            <Button size="sm" variant="primary">
                              报名参加
                            </Button>
                          )}
                          <Button size="sm" variant="secondary">
                            查看详情
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

// 辅助函数：获取可持续生活数据类型标签
function getSustainabilityDataTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'carbon': '碳足迹',
    'energy': '能源消耗',
    'water': '用水量',
    'waste': '垃圾产生量',
    'transportation': '交通出行',
    'food': '食物消费',
    'consumption': '消费'  
  };
  return labels[type] || type;
}

// 辅助函数：获取可持续生活习惯类型标签
function getSustainableHabitTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'energy': '能源',
    'water': '水资源',
    'waste': '垃圾',
    'transportation': '交通',
    'food': '食物',
    'consumption': '消费',
    'other': '其他'
  };
  return labels[type] || type;
}

// 辅助函数：获取可持续生活习惯图标
function getSustainableHabitIcon(icon: string): React.ReactNode {
  switch (icon) {
    case 'bicycle':
      return <Bike className="h-5 w-5 text-white" />;
    case 'droplets':
      return <Droplets className="h-5 w-5 text-white" />;
    case 'recycle':
      return <Recycle className="h-5 w-5 text-white" />;
    case 'leaf':
      return <Leaf className="h-5 w-5 text-white" />;
    case 'zap':
      return <Zap className="h-5 w-5 text-white" />;
    case 'apple':
      return <Apple className="h-5 w-5 text-white" />;
    case 'lightbulb':
      return <Lightbulb className="h-5 w-5 text-white" />;
    default:
      return <Leaf className="h-5 w-5 text-white" />;
  }
}

// 辅助函数：获取挑战图标
function getChallengeIcon(icon: string): React.ReactNode {
  switch (icon) {
    case 'leaf':
      return <Leaf className="h-5 w-5 text-white" />;
    case 'recycle':
      return <Recycle className="h-5 w-5 text-white" />;
    case 'lightbulb':
      return <Lightbulb className="h-5 w-5 text-white" />;
    default:
      return <Leaf className="h-5 w-5 text-white" />;
  }
}

// 辅助函数：获取影响标签
function getImpactLabel(impact: string): string {
  const labels: Record<string, string> = {
    'low': '低影响',
    'medium': '中等影响',
    'high': '高影响'
  };
  return labels[impact] || impact;
}

// 辅助函数：获取影响变体
function getImpactVariant(impact: string): string {
  const variants: Record<string, string> = {
    'low': 'success',
    'medium': 'warning',
    'high': 'destructive'
  };
  return variants[impact] || 'secondary';
}

// 辅助函数：获取难度标签
function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  };
  return labels[difficulty] || difficulty;
}

// 辅助函数：获取难度变体
function getDifficultyVariant(difficulty: string): string {
  const variants: Record<string, string> = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'destructive'
  };
  return variants[difficulty] || 'secondary';
}

export default SustainablePage;