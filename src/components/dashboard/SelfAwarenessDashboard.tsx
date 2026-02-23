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
import { Plus, Brain, TrendingUp, Activity, Target, AlertCircle, Lightbulb, Calendar, RefreshCw } from 'lucide-react';
import { selfAwarenessService, EmotionRecord, SelfAwarenessReport, BehaviorPattern, Strength, BlindSpot, GrowthSuggestion } from '@/services/selfAwarenessService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SelfAwarenessDashboardProps {
  className?: string;
}

export const SelfAwarenessDashboard: React.FC<SelfAwarenessDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEmotionForm, setShowEmotionForm] = useState(false);
  const [newEmotion, setNewEmotion] = useState({
    emotion: 'happy',
    intensity: 7,
    trigger: '',
    context: '',
    timestamp: new Date().toISOString(),
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const queryClient = useQueryClient();

  // 获取最新的自我认知报告
  const { data: latestReport, isLoading: reportLoading, refetch: refetchReport } = useQuery({
    queryKey: ['self-awareness-report', selectedPeriod],
    queryFn: () => selfAwarenessService.generateSelfAwarenessReport(selectedPeriod),
  });

  // 获取报告历史
  const { data: reportHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['self-awareness-history'],
    queryFn: () => selfAwarenessService.getSelfAwarenessReports(),
  });

  // 记录情绪的mutation
  const recordEmotionMutation = useMutation({
    mutationFn: (emotion: typeof newEmotion) => selfAwarenessService.recordEmotion(emotion),
    onSuccess: () => {
      setShowEmotionForm(false);
      setNewEmotion({
        emotion: 'happy',
        intensity: 7,
        trigger: '',
        context: '',
        timestamp: new Date().toISOString(),
      });
    },
  });

  // 处理情绪记录
  const handleRecordEmotion = () => {
    if (newEmotion.trigger.trim()) {
      recordEmotionMutation.mutate(newEmotion);
    }
  };

  // 处理报告生成
  const handleGenerateReport = () => {
    refetchReport();
  };

  // 渲染概览卡片
  const renderOverviewCards = () => {
    if (reportLoading || !latestReport) {
      return <div className="text-center py-8">加载中...</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 行为模式卡片 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
              行为模式
            </CardTitle>
            <CardDescription>识别的模式数量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{latestReport.behavior_patterns.length}</div>
            <div className="space-y-1">
              {latestReport.behavior_patterns.slice(0, 2).map((pattern, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{pattern.pattern_type}:</span>
                  <span style={{ color: 'hsl(var(--mountain-green))' }}> {pattern.impact === 'positive' ? '积极' : pattern.impact === 'negative' ? '消极' : '中性'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 情绪趋势卡片 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
              情绪趋势
            </CardTitle>
            <CardDescription>主导情绪</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{latestReport.emotion_trends.dominant_emotions.length}</div>
            <div className="space-y-1">
              {latestReport.emotion_trends.dominant_emotions.slice(0, 3).map((emotion, index) => (
                <Badge key={index} variant="outline" className="mb-1">{emotion}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 优势卡片 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
              核心优势
            </CardTitle>
            <CardDescription>识别的优势数量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{latestReport.strengths.length}</div>
            <div className="space-y-1">
              {latestReport.strengths.slice(0, 2).map((strength, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{strength.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 成长建议卡片 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
              成长建议
            </CardTitle>
            <CardDescription>个性化建议数量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{latestReport.growth_suggestions.length}</div>
            <div className="space-y-1">
              {latestReport.growth_suggestions.slice(0, 2).map((suggestion, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{suggestion.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染行为模式分析
  const renderBehaviorPatterns = () => {
    if (reportLoading || !latestReport) {
      return <div className="text-center py-8">加载中...</div>;
    }

    if (latestReport.behavior_patterns.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-sm mb-4" style={{ color: 'hsl(var(--smoke-gray))' }}>尚未识别行为模式</p>
          <p className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>继续记录日记，系统将分析你的行为模式</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {latestReport.behavior_patterns.map((pattern) => (
          <Card key={pattern.id} className="border-2 border-[hsl(var(--light-ink))]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pattern.pattern_type}</CardTitle>
                <Badge variant={pattern.impact === 'positive' ? 'default' : pattern.impact === 'negative' ? 'destructive' : 'outline'}>
                  {pattern.impact === 'positive' ? '积极' : pattern.impact === 'negative' ? '消极' : '中性'}
                </Badge>
              </div>
              <CardDescription>{pattern.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>频率</span>
                  <Badge variant="outline">
                    {pattern.frequency === 3 ? '高频' : pattern.frequency === 2 ? '中频' : '低频'}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'hsl(var(--ink-green))' }}>例子</h4>
                  <div className="space-y-1">
                    {pattern.examples.map((example, index) => (
                      <div key={index} className="text-sm flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: 'hsl(var(--ink-green))' }}></div>
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // 渲染情绪追踪
  const renderEmotionTracking = () => {
    return (
      <div className="space-y-6">
        {/* 情绪记录表单 */}
        {showEmotionForm ? (
          <Card className="border-2 border-[hsl(var(--light-ink))] mb-6">
            <CardHeader>
              <CardTitle className="text-lg">记录情绪</CardTitle>
              <CardDescription>记录你的当前情绪状态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                    情绪类型
                  </label>
                  <Select value={newEmotion.emotion} onValueChange={(value) => setNewEmotion({ ...newEmotion, emotion: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择情绪" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="happy">开心</SelectItem>
                      <SelectItem value="sad">难过</SelectItem>
                      <SelectItem value="angry">愤怒</SelectItem>
                      <SelectItem value="anxious">焦虑</SelectItem>
                      <SelectItem value="calm">平静</SelectItem>
                      <SelectItem value="excited">兴奋</SelectItem>
                      <SelectItem value="tired">疲惫</SelectItem>
                      <SelectItem value="grateful">感恩</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                    情绪强度: {newEmotion.intensity}
                  </label>
                  <Slider
                    value={[newEmotion.intensity]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setNewEmotion({ ...newEmotion, intensity: value[0] })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                    触发因素
                  </label>
                  <Input
                    value={newEmotion.trigger}
                    onChange={(e) => setNewEmotion({ ...newEmotion, trigger: e.target.value })}
                    placeholder="是什么触发了这种情绪？"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>
                    情境
                  </label>
                  <Textarea
                    value={newEmotion.context}
                    onChange={(e) => setNewEmotion({ ...newEmotion, context: e.target.value })}
                    placeholder="当时的情境是怎样的？"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRecordEmotion} disabled={recordEmotionMutation.isLoading}>
                    记录情绪
                  </Button>
                  <Button variant="outline" onClick={() => setShowEmotionForm(false)}>
                    取消
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setShowEmotionForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            记录情绪
          </Button>
        )}

        {/* 情绪趋势 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader>
            <CardTitle className="text-lg">情绪趋势</CardTitle>
            <CardDescription>最近的情绪变化</CardDescription>
          </CardHeader>
          <CardContent>
            {reportLoading || !latestReport ? (
              <div className="text-center py-8">加载中...</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'hsl(var(--ink-green))' }}>主导情绪</h4>
                  <div className="flex flex-wrap gap-2">
                    {latestReport.emotion_trends.dominant_emotions.map((emotion, index) => (
                      <Badge key={index} variant="default">{emotion}</Badge>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'hsl(var(--ink-green))' }}>情绪变化</h4>
                  {latestReport.emotion_trends.emotion_changes.slice(0, 5).map((change, index) => (
                    <div key={index} className="flex items-center justify-between py-1 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: 'hsl(var(--mountain-green))' }} />
                        <span className="text-sm">{new Date(change.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{change.emotion}</Badge>
                        <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>强度: {change.intensity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染优势与盲点
  const renderStrengthsAndBlindSpots = () => {
    if (reportLoading || !latestReport) {
      return <div className="text-center py-8">加载中...</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 优势 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
              核心优势
            </CardTitle>
            <CardDescription>你的独特优势</CardDescription>
          </CardHeader>
          <CardContent>
            {latestReport.strengths.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>尚未识别优势</p>
              </div>
            ) : (
              <div className="space-y-4">
                {latestReport.strengths.map((strength) => (
                  <div key={strength.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{strength.name}</h4>
                      <Badge variant="default">{strength.confidence}% 确定</Badge>
                    </div>
                    <p className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>{strength.description}</p>
                    <div>
                      <h5 className="text-xs font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>证据</h5>
                      <div className="text-xs space-y-1">
                        {strength.evidence.map((evidence, index) => (
                          <div key={index} className="flex items-start gap-1">
                            <div className="w-1 h-1 rounded-full mt-1" style={{ background: 'hsl(var(--ink-green))' }}></div>
                            <span>{evidence}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 盲点 */}
        <Card className="border-2 border-[hsl(var(--light-ink))]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
              成长盲点
            </CardTitle>
            <CardDescription>需要改进的领域</CardDescription>
          </CardHeader>
          <CardContent>
            {latestReport.blind_spots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>尚未识别盲点</p>
              </div>
            ) : (
              <div className="space-y-4">
                {latestReport.blind_spots.map((blindSpot) => (
                  <div key={blindSpot.id} className="space-y-2">
                    <h4 className="font-medium">{blindSpot.name}</h4>
                    <p className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>{blindSpot.description}</p>
                    <p className="text-sm"><span className="font-medium">影响:</span> {blindSpot.impact}</p>
                    <div>
                      <h5 className="text-xs font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>改进建议</h5>
                      <div className="text-xs space-y-1">
                        {blindSpot.improvement_suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-1">
                            <div className="w-1 h-1 rounded-full mt-1" style={{ background: 'hsl(var(--cinnabar))' }}></div>
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染成长建议
  const renderGrowthSuggestions = () => {
    if (reportLoading || !latestReport) {
      return <div className="text-center py-8">加载中...</div>;
    }

    if (latestReport.growth_suggestions.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-sm mb-4" style={{ color: 'hsl(var(--smoke-gray))' }}>尚未生成成长建议</p>
          <p className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>系统将基于你的优势和盲点生成个性化建议</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {latestReport.growth_suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="border-2 border-[hsl(var(--light-ink))]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" style={{ color: 'hsl(var(--ink-green))' }} />
                  {suggestion.title}
                </CardTitle>
                <Badge variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'default' : 'outline'}>
                  {suggestion.priority === 'high' ? '高' : suggestion.priority === 'medium' ? '中' : '低'}优先级
                </Badge>
              </div>
              <CardDescription>{suggestion.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>类别</span>
                  <Badge variant="outline">{suggestion.category}</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'hsl(var(--ink-green))' }}>可操作步骤</h4>
                  <div className="space-y-1">
                    {suggestion.actionable_steps.map((step, index) => (
                      <div key={index} className="text-sm flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: 'hsl(var(--ink-green))' }}></div>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink-green))' }}>预期结果</h4>
                  <p className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>{suggestion.expected_outcome}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // 渲染完整报告
  const renderCompleteReport = () => {
    if (reportLoading || !latestReport) {
      return <div className="text-center py-8">加载中...</div>;
    }

    return (
      <Card className="border-2 border-[hsl(var(--light-ink))]">
        <CardHeader>
          <CardTitle className="text-xl">{latestReport.title}</CardTitle>
          <CardDescription>生成时间: {new Date(latestReport.created_at).toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* 整体洞察 */}
            <div>
              <h3 className="text-lg font-medium mb-4" style={{ color: 'hsl(var(--ink-green))' }}>整体洞察</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--mountain-green))' }}>
                {latestReport.overall_insights}
              </p>
            </div>

            <Separator />

            {/* 各部分摘要 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: 'hsl(var(--ink-green))' }}>行为模式</h3>
                <div className="space-y-2">
                  {latestReport.behavior_patterns.slice(0, 3).map((pattern) => (
                    <div key={pattern.id} className="text-sm">
                      <span className="font-medium">{pattern.pattern_type}:</span>
                      <span style={{ color: 'hsl(var(--mountain-green))' }}> {pattern.impact === 'positive' ? '积极' : pattern.impact === 'negative' ? '消极' : '中性'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: 'hsl(var(--ink-green))' }}>情绪趋势</h3>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium" style={{ color: 'hsl(var(--ink-green))' }}>主导情绪</h4>
                  <div className="flex flex-wrap gap-1">
                    {latestReport.emotion_trends.dominant_emotions.map((emotion, index) => (
                      <Badge key={index} variant="outline">{emotion}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: 'hsl(var(--ink-green))' }}>核心优势</h3>
                <div className="space-y-2">
                  {latestReport.strengths.map((strength) => (
                    <div key={strength.id} className="text-sm">
                      <span className="font-medium">{strength.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: 'hsl(var(--ink-green))' }}>成长盲点</h3>
                <div className="space-y-2">
                  {latestReport.blind_spots.map((blindSpot) => (
                    <div key={blindSpot.id} className="text-sm">
                      <span className="font-medium">{blindSpot.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* 成长建议 */}
            <div>
              <h3 className="text-lg font-medium mb-4" style={{ color: 'hsl(var(--ink-green))' }}>成长建议</h3>
              <div className="space-y-3">
                {latestReport.growth_suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="text-sm">
                    <span className="font-medium">{suggestion.title}:</span>
                    <span style={{ color: 'hsl(var(--mountain-green))' }}> {suggestion.description}</span>
                  </div>
                ))}
              </div>
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
          <h1 className="text-2xl font-semibold" style={{ color: 'hsl(var(--ink-green))' }}>自我认知中心</h1>
          <p className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>探索你的内心世界，促进个人成长</p>
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
          <Button onClick={handleGenerateReport} disabled={reportLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            生成报告
          </Button>
        </div>
      </div>

      {/* 概览卡片 */}
      {renderOverviewCards()}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 mb-6">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="behavior">行为模式</TabsTrigger>
          <TabsTrigger value="emotion">情绪追踪</TabsTrigger>
          <TabsTrigger value="strengths">优势与盲点</TabsTrigger>
          <TabsTrigger value="growth">成长建议</TabsTrigger>
          <TabsTrigger value="report">完整报告</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          {renderCompleteReport()}
        </TabsContent>

        <TabsContent value="behavior" className="mt-0">
          {renderBehaviorPatterns()}
        </TabsContent>

        <TabsContent value="emotion" className="mt-0">
          {renderEmotionTracking()}
        </TabsContent>

        <TabsContent value="strengths" className="mt-0">
          {renderStrengthsAndBlindSpots()}
        </TabsContent>

        <TabsContent value="growth" className="mt-0">
          {renderGrowthSuggestions()}
        </TabsContent>

        <TabsContent value="report" className="mt-0">
          {renderCompleteReport()}
        </TabsContent>
      </Tabs>
    </div>
  );
};