import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  X, 
  Heart, 
  Brain, 
  Zap, 
  Users, 
  Activity, 
  Wallet,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { journalService, type JournalEntry } from '@/services/journalService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InkBackground } from '@/components/InkBackground';
import { cn } from '@/lib/utils';

type Dimension = 'psychology' | 'cognitive' | 'efficiency' | 'social' | 'health' | 'finance';

interface DimensionConfig {
  id: Dimension;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  tags: string[];
  description: string;
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
    tags: ['平静', '喜悦', '焦虑', '感恩', '悲伤', '期待'],
    description: '记录内心的波澜与宁静',
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
    tags: ['顿悟', '困惑', '决策', '反思', '学习', '创意'],
    description: '捕捉思维的火花与沉淀',
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
    tags: ['完成', '计划', '拖延', '专注', '习惯', '突破'],
    description: '追踪行动的轨迹与成果',
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
    tags: ['沟通', '陪伴', '冲突', '感谢', '独处', '连接'],
    description: '书写人际间的温暖与成长',
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
    tags: ['运动', '睡眠', '饮食', '休息', '能量', '舒适'],
    description: '关注身体的声音与需求',
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
    tags: ['收入', '支出', '理财', '消费', '节约', '投资'],
    description: '梳理财富的流动与规划',
    symbol: '财',
  },
];

export default function RecordPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [selectedDimension, setSelectedDimension] = useState<Dimension>('psychology');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const currentDimension = DIMENSIONS.find(d => d.id === selectedDimension)!;

  const { data: entries = [] } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: journalService.getEntries,
    enabled: !!user,
  });

  const createEntryMutation = useMutation({
    mutationFn: journalService.createEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      setContent('');
      setSelectedTags([]);
      toast({
        title: '记录已保存',
        description: '你的心声已珍藏',
      });
      textareaRef.current?.focus();
    },
    onError: () => {
      toast({
        title: '保存失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    },
  });

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag].slice(0, 3)
    );
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: '提示',
        description: '请输入记录内容',
      });
      return;
    }

    const newEntry: Omit<JournalEntry, 'id' | 'user_id'> = {
      content,
      timestamp: new Date().toISOString(),
      tags: selectedTags.length > 0 ? selectedTags : [currentDimension.tags[0]],
      dimension: selectedDimension,
    };

    await createEntryMutation.mutateAsync(newEntry);
  };

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
          <h1 
            className="text-xl font-semibold"
            style={{ 
              fontFamily: 'var(--font-serif)',
              color: 'hsl(var(--ink-green))',
            }}
          >
            记录
          </h1>
          <p 
            className="text-sm mt-0.5"
            style={{ color: 'hsl(var(--mountain-green))' }}
          >
            选择一个维度，记录当下的自己
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="content-container py-8 pb-32 relative z-10">
        {/* 维度选择 */}
        <Card 
          className="dao-card p-5 mb-6 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <label 
            className="text-sm font-medium mb-3 block"
            style={{ color: 'hsl(var(--ink-green))' }}
          >
            选择维度
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {DIMENSIONS.map((dim) => (
              <button
                key={dim.id}
                onClick={() => {
                  setSelectedDimension(dim.id);
                  setSelectedTags([]);
                }}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200',
                  selectedDimension === dim.id
                    ? `${dim.bgColor} ${dim.borderColor} border-2 shadow-soft`
                    : 'hover:bg-[hsl(var(--paper-yellow))] border-2 border-transparent'
                )}
              >
                <div 
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium',
                    selectedDimension === dim.id ? dim.bgColor : 'bg-[hsl(var(--light-ink))]'
                  )}
                >
                  <span className={dim.color}>{dim.symbol}</span>
                </div>
                <span 
                  className="text-xs font-medium"
                  style={{ color: 'hsl(var(--ink-green))' }}
                >
                  {dim.shortLabel}
                </span>
              </button>
            ))}
          </div>
          
          {/* 当前维度描述 */}
          <div 
            className="mt-4 p-3 rounded-lg text-sm"
            style={{ 
              background: 'hsl(var(--paper-yellow))',
              color: 'hsl(var(--mountain-green))',
            }}
          >
            <span className="font-medium" style={{ color: 'hsl(var(--ink-green))' }}>
              {currentDimension.label}
            </span>
            <span className="mx-2">·</span>
            {currentDimension.description}
          </div>
        </Card>

        {/* 输入区域 */}
        <Card 
          className="dao-card p-5 mb-6 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`记录你的${currentDimension.shortLabel}...`}
            className="dao-input w-full min-h-[180px] resize-none text-base"
          />
          
          {/* 标签选择 */}
          <div className="mt-4">
            <label 
              className="text-sm font-medium mb-2 block"
              style={{ color: 'hsl(var(--ink-green))' }}
            >
              添加标签
            </label>
            <div className="flex flex-wrap gap-2">
              {currentDimension.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-all duration-200',
                    selectedTags.includes(tag)
                      ? 'text-white shadow-soft'
                      : 'hover:bg-[hsl(var(--paper-yellow))]'
                  )}
                  style={{
                    background: selectedTags.includes(tag) 
                      ? 'hsl(var(--cinnabar))' 
                      : 'hsl(var(--light-ink))',
                    color: selectedTags.includes(tag) 
                      ? 'white' 
                      : 'hsl(var(--mountain-green))',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          {/* 提交按钮 */}
          <div className="flex justify-end mt-5">
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || createEntryMutation.isPending}
              className="btn-primary"
            >
              {createEntryMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  保存记录
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* 最近记录 */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 
            className="text-lg font-medium mb-4"
            style={{ 
              fontFamily: 'var(--font-serif)',
              color: 'hsl(var(--ink-green))',
            }}
          >
            最近记录
          </h2>
          
          <div className="space-y-4">
            {entries.length === 0 ? (
              <Card className="dao-card p-12 text-center">
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
                  暂无记录
                </p>
                <p 
                  className="text-sm mt-1"
                  style={{ color: 'hsl(var(--smoke-gray))' }}
                >
                  开始记录你的第一条想法吧
                </p>
              </Card>
            ) : (
              entries.slice(0, 5).map((entry) => {
                const dim = DIMENSIONS.find(d => d.id === entry.dimension);
                return (
                  <Card key={entry.id} className="dao-card p-4">
                    <div className="flex items-start gap-3">
                      {dim && (
                        <div 
                          className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                            dim.bgColor
                          )}
                        >
                          <span className={cn('text-sm font-medium', dim.color)}>
                            {dim.symbol}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p 
                          className="text-sm leading-relaxed whitespace-pre-wrap"
                          style={{ color: 'hsl(var(--ink-green))' }}
                        >
                          {entry.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span 
                            className="text-xs"
                            style={{ color: 'hsl(var(--smoke-gray))' }}
                          >
                            {new Date(entry.timestamp).toLocaleString('zh-CN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex gap-1">
                              {entry.tags.map((tag) => (
                                <Badge 
                                  key={tag} 
                                  variant="outline" 
                                  className="text-[10px] px-1.5 py-0 border-0"
                                  style={{ 
                                    background: 'hsl(var(--light-ink))',
                                    color: 'hsl(var(--mountain-green))',
                                  }}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
