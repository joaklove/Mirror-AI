import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { contextService } from '../../services/contextService';
import { Clock, MapPin, Activity, Mood, Settings, History, Lightbulb, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const ContextDashboard: React.FC = () => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any>(null);
  const [awarenessScore, setAwarenessScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadContextualData();
    }
  }, [user]);

  const loadContextualData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // 并行加载所有数据
      const [suggestionsData, rulesData, patternsData, scoreData] = await Promise.all([
        contextService.getContextualSuggestions(),
        contextService.getContextRules(),
        contextService.analyzeContextPatterns(),
        contextService.getContextAwarenessScore()
      ]);
      
      setSuggestions(suggestionsData);
      setRules(rulesData);
      setPatterns(patternsData);
      setAwarenessScore(scoreData);
    } catch (err) {
      setError('加载情境数据失败，请稍后重试');
      console.error('Error loading contextual data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadContextualData();
  };

  const handleTrackContext = async () => {
    if (!user) return;
    
    try {
      await contextService.trackContext({
        activity: 'browsing',
        deviceInfo: {
          type: 'desktop',
          os: 'windows',
          browser: 'chrome'
        },
        appUsage: {
          screen: 'context-dashboard',
          duration: 60
        }
      });
      
      // 重新加载数据
      loadContextualData();
    } catch (err) {
      console.error('Error tracking context:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">加载情境数据中...</h2>
        <Progress value={50} className="w-72 mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-500 mb-4">{error}</h2>
        <Button onClick={handleRefresh}>
          重试
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 情境感知得分卡片 */}
      <Card className="bg-card shadow-md">
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              情境感知得分
            </h3>
            <Badge className={cn(
              awarenessScore > 70 ? 'bg-green-500 text-white' : 
              awarenessScore > 40 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
            )}>
              {Math.round(awarenessScore)}%
            </Badge>
          </div>
          <Progress 
            value={awarenessScore} 
            className="h-2.5 rounded-full mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              数据丰富度: {patterns?.patterns?.[0] ? '高' : '低'}
            </span>
            <span>
              规则有效性: {rules.length > 0 ? '已配置' : '未配置'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 情境洞察卡片 */}
      <Card className="bg-card shadow-md">
        <CardContent>
          <h3 className="text-lg font-medium mb-4">
            情境洞察
          </h3>
          
          {patterns?.insights && patterns.insights.length > 0 ? (
            <div className="space-y-3">
              {patterns.insights.map((insight: string, index: number) => (
                <div 
                  key={index} 
                  className="flex items-center p-3 border border-border rounded-lg bg-background"
                >
                  <Lightbulb 
                    size={20} 
                    className="mr-3 text-yellow-500" 
                  />
                  <p className="text-sm">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                暂无情境洞察，使用应用一段时间后会生成
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 情境建议卡片 */}
      <Card className="bg-card shadow-md">
        <CardContent>
          <h3 className="text-lg font-medium mb-4">
            情境建议
          </h3>
          
          {suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.slice(0, 5).map((suggestion: any) => (
                <div 
                  key={suggestion.id} 
                  className="flex items-start p-3 border border-border rounded-lg bg-background hover:bg-accent transition-all"
                >
                  <Avatar className="w-10 h-10 bg-primary/10 mr-3 mt-0.5">
                    <span className="text-primary font-medium">{suggestion.title.charAt(0)}</span>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">
                      {suggestion.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {suggestion.description}
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-secondary/10 text-secondary">
                        {suggestion.type}
                      </Badge>
                      <Badge className="bg-primary/10 text-primary">
                        优先级: {suggestion.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                暂无情境建议，使用应用一段时间后会生成
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 情境规则卡片 */}
      <Card className="bg-card shadow-md">
        <CardContent>
          <h3 className="text-lg font-medium mb-4">
            情境规则
          </h3>
          
          {rules.length > 0 ? (
            <div className="space-y-3">
              {rules.map((rule: any) => (
                <div 
                  key={rule.id} 
                  className={cn(
                    'flex items-center p-3 border border-border rounded-lg',
                    rule.enabled ? 'bg-background' : 'bg-muted/50 opacity-70'
                  )}
                >
                  <Settings 
                    size={20} 
                    className={cn(
                      'mr-3',
                      rule.enabled ? 'text-primary' : 'text-muted-foreground'
                    )} 
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">
                      {rule.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {rule.conditions.timeOfDay?.length ? `时间: ${rule.conditions.timeOfDay.join(', ')} ` : ''}
                      {rule.conditions.dayOfWeek?.length ? `星期: ${rule.conditions.dayOfWeek.join(', ')} ` : ''}
                      {rule.conditions.locationType?.length ? `地点: ${rule.conditions.locationType.join(', ')}` : ''}
                    </p>
                  </div>
                  <Badge className={cn(
                    rule.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  )}>
                    {rule.enabled ? '启用' : '禁用'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                暂无情境规则，可在设置中创建
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-4">
        <Button onClick={handleTrackContext}>
          记录当前情境
        </Button>
        <Button variant="secondary" onClick={handleRefresh}>
          刷新数据
        </Button>
      </div>
    </div>
  );
};

export default ContextDashboard;
