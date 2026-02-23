import React, { useState, useEffect } from 'react';
import { predictiveAIService } from '@/services/predictiveAIService';
import { journalService } from '@/services/journalService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowUpRight, ArrowDownRight, AlertTriangle, Lightbulb, Target, TrendingUp } from 'lucide-react';

const PredictiveDashboard: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const entries = await journalService.getEntries();
      const result = await predictiveAIService.generatePredictiveAnalysis(entries);
      setAnalysisResult(result);
      await predictiveAIService.saveAnalysisResult(result);
    } catch (err) {
      setError('生成预测分析失败，请重试');
      console.error('Error generating analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateAnalysis();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <ArrowUpRight className="text-green-500" />;
      case 'declining':
        return <ArrowDownRight className="text-red-500" />;
      default:
        return <TrendingUp className="text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-500';
      case 'declining':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mist">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">预测性分析</h1>
          <p className="text-muted-foreground">基于您的日记记录，预测未来行为和生活趋势</p>
        </div>
        <Button onClick={generateAnalysis} disabled={loading}>
          重新生成分析
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>分析概览</CardTitle>
              <CardDescription>预测性分析的整体结果</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">行为预测准确率</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={analysisResult.accuracy} className="flex-1" />
                    <span className="text-sm font-semibold">{analysisResult.accuracy.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">预测的行为模式</p>
                  <p className="text-lg font-semibold">{analysisResult.behaviorPredictions.length}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">生活趋势分析</p>
                  <p className="text-lg font-semibold">{analysisResult.lifeTrends.length}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">智能预警</p>
                  <p className="text-lg font-semibold">{analysisResult.alerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="behavior" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="behavior">行为预测</TabsTrigger>
              <TabsTrigger value="trends">生活趋势</TabsTrigger>
              <TabsTrigger value="alerts">智能预警</TabsTrigger>
              <TabsTrigger value="coach">AI教练</TabsTrigger>
            </TabsList>

            <TabsContent value="behavior" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>用户行为预测</CardTitle>
                  <CardDescription>基于您的历史行为模式，预测未来可能的行为</CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult.behaviorPredictions.length > 0 ? (
                    <div className="space-y-4">
                      {analysisResult.behaviorPredictions.map((prediction: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">{prediction.behavior}</h3>
                            <Badge variant="outline">
                              概率: {((prediction.probability) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-muted-foreground">置信度</p>
                              <Progress value={prediction.confidence * 100} className="flex-1" />
                              <span className="text-sm font-semibold">{((prediction.confidence) * 100).toFixed(1)}%</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">影响因素</p>
                              <div className="flex flex-wrap gap-2">
                                {prediction.factors.map((factor: string, factorIndex: number) => (
                                  <Badge key={factorIndex} variant="secondary">
                                    {factor}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">暂无足够数据进行行为预测</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>生活趋势分析</CardTitle>
                  <CardDescription>分析您在各个生活维度的趋势变化</CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult.lifeTrends.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisResult.lifeTrends.map((trend: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">
                              {trend.dimension === 'psychology' ? '心理' :
                               trend.dimension === 'cognitive' ? '认知' :
                               trend.dimension === 'efficiency' ? '效率' :
                               trend.dimension === 'social' ? '社交' :
                               trend.dimension === 'health' ? '健康' :
                               trend.dimension === 'finance' ? '财务' : trend.dimension}
                            </h3>
                            <div className="flex items-center space-x-1">
                              {getTrendIcon(trend.trend)}
                              <span className={`text-sm font-semibold ${getTrendColor(trend.trend)}`}>
                                {trend.trend === 'improving' ? '改善中' :
                                 trend.trend === 'declining' ? '下降中' : '稳定'}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-muted-foreground">评分</p>
                              <Progress value={trend.score} className="flex-1" />
                              <span className="text-sm font-semibold">{trend.score.toFixed(0)}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">变化率</p>
                              <p className={`text-sm ${trend.changeRate > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {trend.changeRate > 0 ? '+' : ''}{(trend.changeRate * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">预测</p>
                              <p className="text-sm text-muted-foreground">{trend.prediction}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">暂无足够数据进行生活趋势分析</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>智能预警</CardTitle>
                  <CardDescription>提前24小时识别潜在问题并提供建议</CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult.alerts.length > 0 ? (
                    <div className="space-y-4">
                      {analysisResult.alerts.map((alert: any, index: number) => (
                        <Alert key={index} className={getAlertColor(alert.type)}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>{alert.title}</AlertTitle>
                          <AlertDescription>
                            <p>{alert.description}</p>
                            <p className="text-sm mt-2">预计时间: {new Date(alert.predictedTime).toLocaleString()}</p>
                            <div className="mt-2">
                              <p className="text-sm font-medium">建议行动:</p>
                              <ul className="list-disc list-inside text-sm mt-1">
                                {alert.recommendedActions.map((action: string, actionIndex: number) => (
                                  <li key={actionIndex}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">暂无预警信息，一切正常</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coach" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI教练建议</CardTitle>
                  <CardDescription>基于您的生活趋势和行为预测，提供个性化建议</CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult.coachSuggestions.length > 0 ? (
                    <div className="space-y-4">
                      {analysisResult.coachSuggestions.map((suggestion: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">{suggestion.title}</h3>
                              <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                            </div>
                            <Badge className={suggestion.priority === 'high' ? 'bg-red-100 text-red-800' : suggestion.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}>
                              {suggestion.priority === 'high' ? '高' : suggestion.priority === 'medium' ? '中' : '低'}优先级
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-sm text-muted-foreground">预计影响</p>
                              <Progress value={suggestion.estimatedImpact} className="mt-1" />
                              <p className="text-sm font-semibold text-right mt-1">{suggestion.estimatedImpact}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">实施难度</p>
                              <p className="text-sm font-semibold mt-1">
                                {suggestion.implementationDifficulty === 'easy' ? '简单' :
                                 suggestion.implementationDifficulty === 'moderate' ? '中等' : '困难'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">暂无AI教练建议</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    生成详细教练计划
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default PredictiveDashboard;
