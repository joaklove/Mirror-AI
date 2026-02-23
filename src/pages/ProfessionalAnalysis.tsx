import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  BrainCircuit, 
  Briefcase, 
  DollarSign, 
  Heart, 
  GraduationCap, 
  Users, 
  BookOpen, 
  User, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Star
} from 'lucide-react';
import { professionalService, type ProfessionalDomain, type DomainAnalysis, type ActionItem, type DomainResource, type DomainExpert } from '@/services/professionalService';
import { journalService } from '@/services/journalService';
import { useAuth } from '@/hooks/useAuth';

const ProfessionalAnalysis: React.FC = () => {
  const { user } = useAuth();
  const [activeDomain, setActiveDomain] = useState<ProfessionalDomain>('mental-health');
  const [analysis, setAnalysis] = useState<DomainAnalysis | null>(null);
  const [resources, setResources] = useState<DomainResource[]>([]);
  const [experts, setExperts] = useState<DomainExpert[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 领域配置
  const domains: { value: ProfessionalDomain; label: string; icon: React.ReactNode }[] = [
    { value: 'mental-health', label: '心理健康', icon: <BrainCircuit className="h-5 w-5" /> },
    { value: 'career', label: '职业发展', icon: <Briefcase className="h-5 w-5" /> },
    { value: 'finance', label: '财务管理', icon: <DollarSign className="h-5 w-5" /> },
    { value: 'health', label: '身体健康', icon: <Heart className="h-5 w-5" /> },
    { value: 'education', label: '教育学习', icon: <GraduationCap className="h-5 w-5" /> },
    { value: 'relationships', label: '人际关系', icon: <Users className="h-5 w-5" /> }
  ];

  useEffect(() => {
    if (user) {
      loadDomainData(activeDomain);
    }
  }, [activeDomain, user]);

  const loadDomainData = async (domain: ProfessionalDomain) => {
    try {
      setLoading(true);

      // 并行加载所有数据
      const [entries, resourcesData, expertsData] = await Promise.all([
        journalService.getEntries(),
        professionalService.getDomainResources(domain),
        professionalService.getDomainExperts(domain)
      ]);

      // 获取领域分析
      const analysisData = await professionalService.getDomainAnalysis(domain, entries);

      setAnalysis(analysisData);
      setResources(resourcesData);
      setExperts(expertsData);
      setActionItems(analysisData.actionItems);
    } catch (error) {
      console.error('Error loading domain data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateActionItem = async (actionItemId: string, updates: Partial<ActionItem>) => {
    try {
      await professionalService.updateActionItem(actionItemId, updates);
      setActionItems(prev => prev.map(item => 
        item.id === actionItemId ? { ...item, ...updates } : item
      ));
    } catch (error) {
      console.error('Error updating action item:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">加载专业领域数据中...</h2>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">专业领域分析</h1>
      </div>

      {/* 领域选择标签页 */}
      <Tabs value={activeDomain} onValueChange={(value) => setActiveDomain(value as ProfessionalDomain)} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6">
          {domains.map((domain) => (
            <TabsTrigger key={domain.value} value={domain.value} className="flex items-center gap-2">
              {domain.icon}
              <span>{domain.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeDomain} className="space-y-6 mt-6">
          {/* 领域概览 */}
          <Card>
            <CardHeader>
              <CardTitle>{domains.find(d => d.value === activeDomain)?.label} 概览</CardTitle>
              <CardDescription>基于你的日记内容生成的专业领域分析</CardDescription>
            </CardHeader>
            <CardContent>
              {analysis && (
                <div className="space-y-6">
                  {/* 领域得分 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">领域得分</span>
                      <span className="font-semibold">{analysis.score}/100</span>
                    </div>
                    <Progress value={analysis.score} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>需要改进</span>
                      <span>良好</span>
                      <span>优秀</span>
                    </div>
                  </div>

                  <Separator />

                  {/* 领域洞察 */}
                  <div>
                    <h4 className="font-medium mb-3">领域洞察</h4>
                    <div className="space-y-2">
                      {analysis.insights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* 优势与改进领域 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 优势 */}
                    <div>
                      <h4 className="font-medium mb-3">优势</h4>
                      <div className="space-y-2">
                        {analysis.strengths.map((strength, index) => (
                          <Badge key={index} variant="secondary" className="mb-1">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* 改进领域 */}
                    <div>
                      <h4 className="font-medium mb-3">改进领域</h4>
                      <div className="space-y-2">
                        {analysis.areasForImprovement.map((area, index) => (
                          <Badge key={index} variant="outline" className="mb-1">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 建议与行动项 */}
          <Card>
            <CardHeader>
              <CardTitle>建议与行动项</CardTitle>
              <CardDescription>基于分析结果的个性化建议和可执行行动</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 建议 */}
                <div>
                  <h4 className="font-medium mb-3">建议</h4>
                  <div className="space-y-3">
                    {analysis?.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <div className="flex-shrink-0">
                          <ArrowRight className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 行动项 */}
                <div>
                  <h4 className="font-medium mb-3">行动项</h4>
                  <div className="space-y-3">
                    {actionItems.map((actionItem) => (
                      <div key={actionItem.id} className="p-3 border rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm mb-1">{actionItem.title}</h5>
                            <p className="text-sm text-muted-foreground mb-2">{actionItem.description}</p>
                            <Badge variant="secondary" className="text-xs">
                              {actionItem.priority === 'high' ? '高优先级' : 
                               actionItem.priority === 'medium' ? '中优先级' : '低优先级'}
                            </Badge>
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
              </div>
            </CardContent>
          </Card>

          {/* 专业资源 */}
          <Card>
            <CardHeader>
              <CardTitle>专业资源</CardTitle>
              <CardDescription>相关领域的专业资源推荐</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {resources.map((resource) => (
                    <div key={resource.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium">{resource.title}</h5>
                        <Badge variant="secondary">
                          {resource.type === 'article' ? '文章' :
                           resource.type === 'video' ? '视频' :
                           resource.type === 'podcast' ? '播客' :
                           resource.type === 'tool' ? '工具' : '课程'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                      <div className="flex items-center justify-between">
                        <Button variant="secondary" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            查看资源
                          </a>
                        </Button>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium">相关性</span>
                          <span className="text-xs font-semibold">{Math.round(resource.relevanceScore)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* 领域专家 */}
          <Card>
            <CardHeader>
              <CardTitle>领域专家</CardTitle>
              <CardDescription>相关领域的专业专家推荐</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {experts.map((expert) => (
                  <div key={expert.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name}`} />
                        <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{expert.name}</h5>
                          <Badge variant="secondary">{expert.title}</Badge>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < Math.round(expert.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                            />
                          ))}
                          <span className="text-sm ml-1">{expert.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{expert.bio}</p>
                        <div className="flex flex-wrap gap-2">
                          {expert.expertise.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        {expert.contactInfo && (
                          <div className="flex gap-2 mt-3">
                            {expert.contactInfo.email && (
                              <Button variant="secondary" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                联系专家
                              </Button>
                            )}
                            {expert.contactInfo.website && (
                              <Button variant="secondary" size="sm" asChild>
                                <a href={expert.contactInfo.website} target="_blank" rel="noopener noreferrer">
                                  访问网站
                                </a>
                              </Button>
                            )}
                          </div>
                        )}
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

export default ProfessionalAnalysis;
