import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { recommendationService } from '../../services/recommendationService';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const RecommendationDashboard: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [userLevel, setUserLevel] = useState<string>('beginner');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadRecommendations();
      loadUserLevel();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await recommendationService.generateRecommendations(user.uid);
      setRecommendations(result);
    } catch (err) {
      setError('加载推荐失败，请稍后重试');
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserLevel = async () => {
    if (!user) return;
    
    try {
      const level = await recommendationService.getUserLevel(user.uid);
      setUserLevel(level);
    } catch (err) {
      console.error('Error loading user level:', err);
    }
  };

  const handleFeatureClick = async (featureId: string) => {
    if (!user) return;
    
    try {
      await recommendationService.trackFeatureUsage({
        featureId,
        action: 'click',
        duration: 0
      });
      
      // 这里可以添加导航到相应功能的逻辑
      console.log('Navigating to feature:', featureId);
    } catch (err) {
      console.error('Error tracking feature usage:', err);
    }
  };

  const levelColors = {
    beginner: 'bg-blue-500 text-white',
    intermediate: 'bg-purple-500 text-white',
    advanced: 'bg-amber-500 text-white',
    expert: 'bg-green-500 text-white'
  };

  const levelLabels = {
    beginner: '初级用户',
    intermediate: '中级用户',
    advanced: '高级用户',
    expert: '专家用户'
  };

  const getLevelProgress = (level: string) => {
    const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const index = levels.indexOf(level);
    return ((index + 1) / levels.length) * 100;
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">加载推荐中...</h2>
        <Progress value={50} className="w-72 mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-500 mb-4">{error}</h2>
        <Button onClick={loadRecommendations}>
          重试
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 用户级别卡片 */}
      <Card className="bg-card shadow-md">
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              用户级别
            </h3>
            <Badge className={levelColors[userLevel as keyof typeof levelColors]}>
              {levelLabels[userLevel as keyof typeof levelLabels]}
            </Badge>
          </div>
          <div className="mb-2">
            <Progress 
              value={getLevelProgress(userLevel)} 
              className="h-2 rounded-full"
            />
          </div>
          <p className="text-sm text-muted-foreground text-right">
            完成度: {Math.round(getLevelProgress(userLevel))}%
          </p>
        </CardContent>
      </Card>

      {/* 功能推荐卡片 */}
      <Card className="bg-card shadow-md">
        <CardContent>
          <h3 className="text-lg font-medium mb-4">
            为你推荐
          </h3>
          
          {recommendations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                暂无推荐内容
              </p>
              <Button onClick={loadRecommendations} variant="secondary">
                刷新推荐
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div 
                  key={rec.featureId} 
                  className={cn(
                    'flex items-center p-4 border border-border rounded-lg',
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/30',
                    'hover:bg-accent transition-all'
                  )}
                >
                  <div className="flex flex-col items-center mr-4">
                    <Avatar className="w-12 h-12 bg-primary/10 mb-2">
                      <span className="text-primary font-medium">{rec.title.charAt(0)}</span>
                    </Avatar>
                    <p className="text-xs text-muted-foreground">
                      匹配度 {Math.round(rec.score / 15 * 100)}%
                    </p>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">
                      {rec.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {rec.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rec.reason}
                    </p>
                  </div>
                  
                  <Button 
                    size="sm" 
                    onClick={() => handleFeatureClick(rec.featureId)}
                  >
                    探索
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 功能发现卡片 */}
      <Card className="bg-card shadow-md">
        <CardContent>
          <h3 className="text-lg font-medium mb-4">
            功能发现
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {
              [
                { id: 'habit-tracker', title: '习惯追踪', description: '养成良好的习惯', icon: '🌱', level: 'intermediate' },
                { id: 'life-balance', title: '生活平衡', description: '分析生活的各个方面', icon: '⚖️', level: 'intermediate' },
                { id: 'personality-analysis', title: '性格分析', description: '了解你的性格特点', icon: '🧠', level: 'advanced' },
                { id: 'financial-goals', title: '财务目标', description: '设定和追踪财务目标', icon: '💰', level: 'intermediate' },
                { id: 'health-tracker', title: '健康追踪', description: '追踪你的健康指标', icon: '🏥', level: 'intermediate' },
                { id: 'time-management', title: '时间管理', description: '更有效地管理时间', icon: '⏰', level: 'advanced' }
              ].map((feature) => (
                <Card 
                  key={feature.id}
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => handleFeatureClick(feature.id)}
                >
                  <CardContent>
                    <div className="text-center mb-4">
                      <span className="text-3xl">{feature.icon}</span>
                    </div>
                    <h4 className="font-medium text-center mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-muted-foreground text-center mb-3">
                      {feature.description}
                    </p>
                    <Badge className={cn(
                      'mx-auto block',
                      feature.level === 'beginner' ? 'bg-blue-100 text-blue-800' : 
                      feature.level === 'intermediate' ? 'bg-purple-100 text-purple-800' : 
                      'bg-amber-100 text-amber-800'
                    )}
                    >
                      {feature.level === 'beginner' ? '初级' : feature.level === 'intermediate' ? '中级' : '高级'}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationDashboard;
