import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Heart, 
  Zap, 
  Users, 
  Activity, 
  Wallet,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { journalService } from '@/services/journalService';
import { useQuery } from '@tanstack/react-query';
import { InkBackground } from '@/components/InkBackground';
import { cn } from '@/lib/utils';

type Dimension = 'psychology' | 'cognitive' | 'efficiency' | 'social' | 'health' | 'finance';
type TimeRange = 'week' | 'month' | 'year';

interface DimensionConfig {
  id: Dimension;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  symbol: string;
}

const DIMENSIONS: DimensionConfig[] = [
  { 
    id: 'psychology', 
    label: '心理 / 情绪', 
    shortLabel: '心理',
    icon: Heart, 
    color: 'text-[hsl(350,60%,50%)]',
    bgColor: 'bg-[hsla(350,60%,50%,0.08)]',
    borderColor: 'border-[hsla(350,60%,50%,0.3)]',
    symbol: '心',
  },
  { 
    id: 'cognitive', 
    label: '认知 / 思维', 
    shortLabel: '认知',
    icon: Brain, 
    color: 'text-[hsl(200,60%,50%)]',
    bgColor: 'bg-[hsla(200,60%,50%,0.08)]',
    borderColor: 'border-[hsla(200,60%,50%,0.3)]',
    symbol: '思',
  },
  { 
    id: 'efficiency', 
    label: '效率 / 行动', 
    shortLabel: '效率',
    icon: Zap, 
    color: 'text-[hsl(45,80%,50%)]',
    bgColor: 'bg-[hsla(45,80%,50%,0.08)]',
    borderColor: 'border-[hsla(45,80%,50%,0.3)]',
    symbol: '行',
  },
  { 
    id: 'social', 
    label: '社交 / 关系', 
    shortLabel: '社交',
    icon: Users, 
    color: 'text-[hsl(270,50%,55%)]',
    bgColor: 'bg-[hsla(270,50%,55%,0.08)]',
    borderColor: 'border-[hsla(270,50%,55%,0.3)]',
    symbol: '人',
  },
  { 
    id: 'health', 
    label: '健康 / 身体', 
    shortLabel: '健康',
    icon: Activity, 
    color: 'text-[hsl(150,50%,40%)]',
    bgColor: 'bg-[hsla(150,50%,40%,0.08)]',
    borderColor: 'border-[hsla(150,50%,40%,0.3)]',
    symbol: '身',
  },
  { 
    id: 'finance', 
    label: '财务 / 资源', 
    shortLabel: '财务',
    icon: Wallet, 
    color: 'text-[hsl(30,40%,45%)]',
    bgColor: 'bg-[hsla(30,40%,45%,0.08)]',
    borderColor: 'border-[hsla(30,40%,45%,0.3)]',
    symbol: '财',
  },
];

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'year', label: '本年' },
];

export default function AnalysisPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [selectedDimension, setSelectedDimension] = useState<Dimension | 'all'>('all');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => journalService.getEntries(),
    enabled: !!user,
  });

  const getEntriesForPeriod = (range: TimeRange) => {
    const now = new Date();
    const startOfPeriod = new Date();
    
    switch (range) {
      case 'week':
        startOfPeriod.setDate(now.getDate() - 7);
        break;
      case 'month':
        startOfPeriod.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startOfPeriod.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return entries.filter(entry => new Date(entry.timestamp) >= startOfPeriod);
  };

  const periodEntries = getEntriesForPeriod(timeRange);

  const getDimensionStats = (dimension: Dimension) => {
    const dimEntries = periodEntries.filter(e => e.dimension === dimension);
    const totalEntries = periodEntries.length;
    const percentage = totalEntries > 0 ? (dimEntries.length / totalEntries) * 100 : 0;
    
    const tagCounts: Record<string, number> = {};
    dimEntries.forEach(entry => {
      entry.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
    
    return {
      count: dimEntries.length,
      percentage,
      topTags,
    };
  };

  const getTrend = (dimension: Dimension): 'up' | 'down' | 'stable' => {
    const now = new Date();
    const halfPeriod = new Date();
    const range = timeRange === 'week' ? 3.5 : timeRange === 'month' ? 15 : 180;
    halfPeriod.setDate(now.getDate() - range);
    
    const firstHalf = entries.filter(e => {
      const date = new Date(e.timestamp);
      return e.dimension === dimension && date >= halfPeriod && date <= now;
    }).length;
    
    const secondHalf = periodEntries.filter(e => e.dimension === dimension).length;
    
    if (secondHalf > firstHalf * 1.2) return 'up';
    if (secondHalf < firstHalf * 0.8) return 'down';
    return 'stable';
  };

  const getAllStats = () => {
    const totalEntries = periodEntries.length;
    const dimensions = DIMENSIONS.map(dim => {
      const stats = getDimensionStats(dim.id);
      return {
        ...dim,
        ...stats,
        trend: getTrend(dim.id),
      };
    });
    
    return { totalEntries, dimensions };
  };

  const stats = getAllStats();

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-3.5 h-3.5 text-[hsl(150,50%,40%)]" />;
      case 'down':
        return <ArrowDown className="w-3.5 h-3.5 text-[hsl(350,60%,50%)]" />;
      default:
        return <Minus className="w-3.5 h-3.5 text-[hsl(var(--smoke-gray))]" />;
    }
  };

  const filteredStats = selectedDimension === 'all' 
    ? stats.dimensions 
    : stats.dimensions.filter(d => d.id === selectedDimension);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div 
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ 
            borderColor: 'hsl(var(--mountain-green))',
            borderTopColor: 'transparent',
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* 水墨背景 */}
      <InkBackground intensity="light" />
      
      {/* Header */}
      <header 
        className="sticky top-0 z-10 dao-glass"
        style={{ borderBottom: '1px solid hsl(var(--light-ink))' }}
      >
        <div className="content-container py-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" style={{ color: 'hsl(var(--cinnabar))' }} />
            <h1 
              className="text-xl font-semibold"
              style={{ 
                fontFamily: 'var(--font-serif)',
                color: 'hsl(var(--ink-green))',
              }}
            >
              分析
            </h1>
          </div>
          <p 
            className="text-sm mt-0.5"
            style={{ color: 'hsl(var(--mountain-green))' }}
          >
            查看你的多维度记录统计
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="content-container py-8 pb-32 relative z-10">
        {/* 时间范围选择 */}
        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList 
              className="p-1 rounded-xl"
              style={{ 
                background: 'hsl(var(--paper-yellow))',
                border: '1px solid hsl(var(--light-ink))',
              }}
            >
              {TIME_RANGES.map(range => (
                <TabsTrigger 
                  key={range.value} 
                  value={range.value}
                  className="px-4 py-2 rounded-lg text-sm data-[state=active]:bg-[hsl(var(--cinnabar))] data-[state=active]:text-white data-[state=active]:shadow-soft transition-all"
                >
                  {range.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* 总览卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setSelectedDimension('all')}
            className={cn(
              'p-4 rounded-xl transition-all duration-200 text-left',
              selectedDimension === 'all'
                ? 'shadow-soft'
                : 'hover:shadow-subtle'
            )}
            style={{
              background: selectedDimension === 'all' 
                ? 'hsl(var(--paper-yellow))' 
                : 'hsl(var(--cloud-white))',
              border: selectedDimension === 'all' 
                ? '2px solid hsl(var(--cinnabar))' 
                : '1px solid hsl(var(--light-ink))',
            }}
          >
            <div 
              className="text-2xl font-semibold"
              style={{ color: 'hsl(var(--ink-green))' }}
            >
              {stats.totalEntries}
            </div>
            <div 
              className="text-xs mt-1"
              style={{ color: 'hsl(var(--smoke-gray))' }}
            >
              总记录
            </div>
          </button>
          
          {DIMENSIONS.map(dim => {
            const dimStats = getDimensionStats(dim.id);
            return (
              <button
                key={dim.id}
                onClick={() => setSelectedDimension(dim.id)}
                className={cn(
                  'p-4 rounded-xl transition-all duration-200 text-left',
                  selectedDimension === dim.id
                    ? 'shadow-soft'
                    : 'hover:shadow-subtle'
                )}
                style={{
                  background: selectedDimension === dim.id 
                    ? 'hsl(var(--paper-yellow))' 
                    : 'hsl(var(--cloud-white))',
                  border: selectedDimension === dim.id 
                    ? `2px solid ${dim.color.replace('text-', '').replace('[', '').replace(']', '')}` 
                    : '1px solid hsl(var(--light-ink))',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-lg font-medium', dim.color)}>
                    {dim.symbol}
                  </span>
                  {getTrendIcon(getTrend(dim.id))}
                </div>
                <div 
                  className="text-xl font-semibold"
                  style={{ color: 'hsl(var(--ink-green))' }}
                >
                  {dimStats.count}
                </div>
                <div 
                  className="text-xs mt-0.5"
                  style={{ color: 'hsl(var(--smoke-gray))' }}
                >
                  {dim.shortLabel}
                </div>
              </button>
            );
          })}
        </div>

        {/* 详细统计 */}
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {filteredStats.map(dim => (
            <Card key={dim.id} className="dao-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-base">
                  <div 
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      dim.bgColor
                    )}
                  >
                    <span className={cn('text-lg font-medium', dim.color)}>
                      {dim.symbol}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span style={{ color: 'hsl(var(--ink-green))' }}>
                      {dim.label}
                    </span>
                    <span 
                      className="text-sm font-normal ml-2"
                      style={{ color: 'hsl(var(--smoke-gray))' }}
                    >
                      {dim.count} 条
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* 占比进度条 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span style={{ color: 'hsl(var(--mountain-green))' }}>
                      占比
                    </span>
                    <span style={{ color: 'hsl(var(--ink-green))' }}>
                      {dim.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div 
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: 'hsl(var(--light-ink))' }}
                  >
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${dim.percentage}%`,
                        background: dim.color.replace('text-', '').replace('[', '').replace(']', ''),
                      }}
                    />
                  </div>
                </div>
                
                {/* 热门标签 */}
                {dim.topTags.length > 0 && (
                  <div>
                    <div 
                      className="text-xs mb-2"
                      style={{ color: 'hsl(var(--smoke-gray))' }}
                    >
                      热门标签
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {dim.topTags.map(({ tag, count }) => (
                        <span 
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                          style={{ 
                            background: 'hsl(var(--light-ink))',
                            color: 'hsl(var(--mountain-green))',
                          }}
                        >
                          {tag}
                          <span style={{ color: 'hsl(var(--smoke-gray))' }}>
                            {count}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 空状态 */}
        {stats.totalEntries === 0 && (
          <Card 
            className="dao-card p-12 text-center mt-6 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ 
                background: 'hsl(var(--paper-yellow))',
                border: '1px solid hsl(var(--light-ink))',
              }}
            >
              <Sparkles className="w-8 h-8" style={{ color: 'hsl(var(--light-ink))' }} />
            </div>
            <p style={{ color: 'hsl(var(--mountain-green))' }}>
              暂无记录数据
            </p>
            <p 
              className="text-sm mt-1"
              style={{ color: 'hsl(var(--smoke-gray))' }}
            >
              开始记录后，这里会显示你的分析数据
            </p>
          </Card>
        )}

        {/* 道家格言 */}
        <div 
          className="mt-8 text-center animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          <p 
            className="text-sm italic"
            style={{ color: 'hsl(var(--smoke-gray))' }}
          >
            「知人者智，自知者明。胜人者有力，自胜者强。」
          </p>
          <p 
            className="text-xs mt-1"
            style={{ color: 'hsl(var(--smoke-gray))', opacity: 0.7 }}
          >
            ——《道德经》
          </p>
        </div>
      </main>
    </div>
  );
}
