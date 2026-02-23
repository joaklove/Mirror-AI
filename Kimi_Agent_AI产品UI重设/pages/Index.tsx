import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Sunrise, Clock, Loader2, X, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import { journalService, settingsService, reportsService, type JournalEntry } from '@/services/journalService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThrottle } from '@/hooks/use-throttle';
import { TaijiIcon } from '@/components/TaijiIcon';
import { InkBackground } from '@/components/InkBackground';
import { cn } from '@/lib/utils';

// 日记输入组件
interface JournalInputProps {
  journalInput: string;
  setJournalInput: (value: string) => void;
  entries: JournalEntry[];
  handleSendEntry: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

const JournalInput: React.FC<JournalInputProps> = ({
  journalInput,
  setJournalInput,
  handleSendEntry,
  textareaRef,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendEntry();
    }
  };

  return (
    <Card 
      className="dao-card p-5 mb-6 animate-fade-in-up"
      style={{ animationDelay: '0.1s' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4" style={{ color: 'hsl(var(--cinnabar))' }} />
        <span 
          className="text-sm font-medium"
          style={{ color: 'hsl(var(--mountain-green))' }}
        >
          今日感悟
        </span>
      </div>
      
      <textarea
        ref={textareaRef}
        value={journalInput}
        onChange={(e) => setJournalInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="写下此刻的心情与想法..."
        className="dao-input w-full min-h-[120px] resize-none text-base"
        style={{ fontFamily: 'var(--font-sans)' }}
      />
      
      <div className="flex items-center justify-between mt-4">
        <span 
          className="text-xs"
          style={{ color: 'hsl(var(--smoke-gray))' }}
        >
          按 Enter 发送，Shift + Enter 换行
        </span>
        <Button
          onClick={handleSendEntry}
          disabled={!journalInput.trim()}
          className="btn-primary"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          记录
        </Button>
      </div>
    </Card>
  );
};

// 日记条目组件
interface JournalEntryCardProps {
  entry: JournalEntry;
  onDelete: (id: string) => void;
  getTagColor: (tag: string) => string;
  formatSmartTime: (timestamp: string) => string;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  onDelete,
  getTagColor,
  formatSmartTime,
}) => {
  return (
    <Card 
      className="dao-card p-5 group animate-fade-in-up"
      style={{ animationDelay: '0.2s' }}
    >
      <div className="flex items-start gap-4">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ 
            background: 'hsl(var(--paper-yellow))',
            border: '1px solid hsl(var(--light-ink))',
          }}
        >
          <span 
            className="text-lg"
            style={{ color: 'hsl(var(--mountain-green))' }}
          >
            {entry.dimension === 'psychology' && '心'}
            {entry.dimension === 'cognitive' && '思'}
            {entry.dimension === 'efficiency' && '行'}
            {entry.dimension === 'social' && '人'}
            {entry.dimension === 'health' && '身'}
            {entry.dimension === 'finance' && '财'}
            {!entry.dimension && '记'}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <p 
            className="text-base leading-relaxed whitespace-pre-wrap"
            style={{ 
              color: 'hsl(var(--ink-green))',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {entry.content}
          </p>
          
          <div className="flex items-center gap-3 mt-3">
            <span 
              className="text-xs"
              style={{ color: 'hsl(var(--smoke-gray))' }}
            >
              {formatSmartTime(entry.timestamp)}
            </span>
            
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {entry.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline"
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full border-0',
                      getTagColor(tag)
                    )}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onDelete(entry.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-[hsl(var(--paper-yellow))]"
          style={{ color: 'hsl(var(--smoke-gray))' }}
          title="删除"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
};

// 生成报告按钮组件
interface ReportGeneratorProps {
  isGenerating: boolean;
  onGenerateReport: () => void;
  hasGeneratedToday: boolean;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  isGenerating,
  onGenerateReport,
  hasGeneratedToday,
}) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
      <Button
        onClick={onGenerateReport}
        disabled={isGenerating}
        className={cn(
          'btn-primary px-8 py-6 text-lg shadow-elevated transition-all',
          hasGeneratedToday && 'opacity-80'
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <Sunrise className="w-5 h-5 mr-2" />
            {hasGeneratedToday ? '再次生成晨报' : '生成今日晨报'}
          </>
        )}
      </Button>
    </div>
  );
};

// 主页面组件
const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [journalInput, setJournalInput] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 获取日记条目
  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: journalService.getEntries,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // 获取历史报告
  const { data: historyReports = [] } = useQuery({
    queryKey: ['history-reports'],
    queryFn: () => reportsService.getReports(20),
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });

  // 创建日记
  const createEntryMutation = useMutation({
    mutationFn: journalService.createEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      setJournalInput('');
      toast({
        title: '记录成功',
        description: '你的心声已保存',
      });
    },
    onError: () => {
      toast({
        title: '记录失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    },
  });

  // 删除日记
  const deleteEntryMutation = useMutation({
    mutationFn: journalService.deleteEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      setDeleteConfirmOpen(false);
      setEntryToDelete(null);
      toast({
        title: '已删除',
        description: '记录已移除',
      });
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSendEntry = async () => {
    if (!journalInput.trim()) return;

    const newEntry: Omit<JournalEntry, 'id' | 'user_id'> = {
      content: journalInput,
      timestamp: new Date().toISOString(),
      tags: generateRandomTags(journalInput),
    };

    await createEntryMutation.mutateAsync(newEntry);
  };

  const handleDeleteEntry = (id: string) => {
    setEntryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (entryToDelete) {
      await deleteEntryMutation.mutateAsync(entryToDelete);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // 模拟生成报告
    setTimeout(() => {
      setReportContent(`## 今日晨报

### 整体情绪分析
今日记录显示出平和的心态，情绪波动较小，保持了一贯的稳定性。

### 关键事件回顾
- 完成了重要的工作任务
- 与朋友进行了愉快的交流
- 保持了规律的作息

### 个人成长洞察
从记录中可以看出，你正在逐步建立良好的生活习惯，这种持续的积累将带来长远的改变。

### 今日行动建议
1. 继续保持当前的节奏
2. 留出时间进行自我反思
3. 关注身体的信号，适时休息

### 能量水平评估
今日能量水平：★★★★☆

### 冥想/反思主题
**「静水流深」** - 在平静的表面下，蕴含着深邃的力量。`);
      setIsGenerating(false);
      setShowReport(true);
    }, 2000);
  };

  const formatSmartTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    if (isToday) return `今天 ${timeStr}`;
    if (isYesterday) return `昨天 ${timeStr}`;
    return `${date.getMonth() + 1}月${date.getDate()}日 ${timeStr}`;
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      工作: 'bg-[hsla(36,27%,94%,1)] text-[hsl(var(--ink-green))]',
      情绪: 'bg-[hsla(9,52%,53%,0.1)] text-[hsl(var(--cinnabar))]',
      小确幸: 'bg-[hsla(45,80%,60%,0.15)] text-[hsl(45,60%,45%)]',
      日常: 'bg-[hsl(var(--light-ink))] text-[hsl(var(--mountain-green))]',
      学习: 'bg-[hsla(168,16%,42%,0.1)] text-[hsl(var(--mountain-green))]',
      健康: 'bg-[hsla(108,23%,33%,0.1)] text-[hsl(var(--stone-green))]',
    };
    return colors[tag] || 'bg-[hsl(var(--light-ink))] text-[hsl(var(--smoke-gray))]';
  };

  const generateRandomTags = (content: string): string[] => {
    const allTags = ['工作', '情绪', '小确幸', '日常', '学习', '健康'];
    const shuffled = [...allTags].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.random() > 0.5 ? 2 : 1);
  };

  if (entriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <TaijiIcon size={48} animated />
          <p style={{ color: 'hsl(var(--smoke-gray))' }}>加载中...</p>
        </div>
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
        <div className="content-container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TaijiIcon size={36} animated={false} />
            <div>
              <h1 
                className="text-xl font-semibold"
                style={{ 
                  fontFamily: 'var(--font-serif)',
                  color: 'hsl(var(--ink-green))',
                }}
              >
                心镜 AI
              </h1>
              <p 
                className="text-xs"
                style={{ color: 'hsl(var(--mountain-green))' }}
              >
                照见内心 · 道法自然
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-xl hover:bg-[hsl(var(--paper-yellow))]"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-5 h-5" style={{ color: 'hsl(var(--mountain-green))' }} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-xl hover:bg-[hsl(var(--paper-yellow))]"
              onClick={() => signOut?.().then(() => navigate('/auth'))}
            >
              <LogOut className="w-5 h-5" style={{ color: 'hsl(var(--mountain-green))' }} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="content-container py-8 pb-32 relative z-10">
        {/* 欢迎语 */}
        <div className="mb-8 animate-fade-in-up">
          <p 
            className="text-lg"
            style={{ 
              color: 'hsl(var(--mountain-green))',
              fontFamily: 'var(--font-serif)',
            }}
          >
            {new Date().getHours() < 12 ? '早安，' : new Date().getHours() < 18 ? '午安，' : '晚安，'}
            <span style={{ color: 'hsl(var(--ink-green))' }}>
              {user?.email?.split('@')[0] || '朋友'}
            </span>
          </p>
          <p 
            className="text-sm mt-1"
            style={{ color: 'hsl(var(--smoke-gray))' }}
          >
            「{['心静自然凉', '万物静观皆自得', '行到水穷处，坐看云起时', '道法自然'][Math.floor(Math.random() * 4)]}」
          </p>
        </div>

        {/* 日记输入 */}
        <JournalInput
          journalInput={journalInput}
          setJournalInput={setJournalInput}
          entries={entries}
          handleSendEntry={handleSendEntry}
          textareaRef={textareaRef}
        />

        {/* 日记列表 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 
              className="text-lg font-medium"
              style={{ 
                fontFamily: 'var(--font-serif)',
                color: 'hsl(var(--ink-green))',
              }}
            >
              近期记录
            </h2>
            <span 
              className="text-sm"
              style={{ color: 'hsl(var(--smoke-gray))' }}
            >
              共 {entries.length} 条
            </span>
          </div>
          
          {entries.length === 0 ? (
            <Card 
              className="dao-card p-12 text-center animate-fade-in-up"
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
                还没有记录
              </p>
              <p 
                className="text-sm mt-1"
                style={{ color: 'hsl(var(--smoke-gray))' }}
              >
                写下第一条想法，开启内心之旅
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {entries.slice(0, 10).map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={handleDeleteEntry}
                  getTagColor={getTagColor}
                  formatSmartTime={formatSmartTime}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 生成报告按钮 */}
      <ReportGenerator
        isGenerating={isGenerating}
        onGenerateReport={handleGenerateReport}
        hasGeneratedToday={localStorage.getItem('last_report_date') === new Date().toISOString().split('T')[0]}
      />

      {/* 生成中加载动画 */}
      {isGenerating && (
        <div className="fixed inset-0 z-30 dao-glass flex items-center justify-center">
          <div className="text-center space-y-6">
            <TaijiIcon size={64} animated glow />
            <div className="space-y-2">
              <h3 
                className="text-xl font-medium animate-breathe"
                style={{ 
                  fontFamily: 'var(--font-serif)',
                  color: 'hsl(var(--ink-green))',
                }}
              >
                正在感悟天地之道
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'hsl(var(--mountain-green))' }}
              >
                静心等待 · 智慧将至
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 报告弹窗 */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent 
          className="max-w-2xl max-h-[85vh] overflow-y-auto dao-card p-0 border-0"
        >
          <DialogTitle className="sr-only">今日晨报</DialogTitle>
          <DialogDescription className="sr-only">
            AI 生成的个性化晨报
          </DialogDescription>
          
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sunrise className="w-6 h-6" style={{ color: 'hsl(var(--cinnabar))' }} />
              <h2 
                className="text-2xl font-semibold"
                style={{ 
                  fontFamily: 'var(--font-serif)',
                  color: 'hsl(var(--ink-green))',
                }}
              >
                今日晨报
              </h2>
            </div>
            
            <div 
              className="prose prose-slate max-w-none"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <div 
                className="whitespace-pre-wrap leading-relaxed"
                style={{ color: 'hsl(var(--ink-green))' }}
              >
                {reportContent}
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setShowReport(false)}
                className="btn-primary px-8"
              >
                开始美好的一天
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="dao-card max-w-sm">
          <DialogTitle className="sr-only">确认删除</DialogTitle>
          <div className="text-center py-4">
            <p 
              className="text-lg font-medium mb-2"
              style={{ color: 'hsl(var(--ink-green))' }}
            >
              确认删除这条记录？
            </p>
            <p 
              className="text-sm mb-6"
              style={{ color: 'hsl(var(--smoke-gray))' }}
            >
              此操作无法撤销
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                className="btn-secondary"
              >
                取消
              </Button>
              <Button
                onClick={confirmDelete}
                className="btn-primary"
                style={{ 
                  background: 'hsl(var(--cinnabar))',
                }}
              >
                删除
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
};

export default Index;
