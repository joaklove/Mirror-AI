import { useState, useRef, useEffect, useMemo } from 'react';
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
  Loader2,
  Image,
  Upload,
  XCircle,
  Wand2,
  Mic,
  MicOff,
  Volume2,
  Sunrise,
  Settings,
  LogOut,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import { useInstall } from '@/contexts/InstallContext';
import { journalService, type JournalEntry } from '@/services/journalService';
import { tagService } from '@/services/tagService';
import { quickAnalysisService } from '@/services/quickAnalysisService';
import { voiceService } from '@/services/voiceService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TaijiIcon } from '@/components/TaijiIcon';
import { InkBackground } from '@/components/InkBackground';
import { cn } from '@/lib/utils';
import { getSolarTerm, getShichen, getJournalStreak, STREAK_BADGES } from '@/lib/daoDaily';
import { morningReportService, type MorningReportData } from '@/services/morningReportService';
import { generateEcho, getTodayEcho } from '@/services/echoService';
import type { EchoData } from '@/prompts/echo';

/** 晨报生成的三个仪式阶段 */
const RITUAL_STAGES = [
  { title: '静心', desc: '收拢散落的心绪' },
  { title: '观照', desc: '回望今日的痕迹' },
  { title: '落笔', desc: '汇成一纸晨报' },
] as const;

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
  const dim = DIMENSIONS.find(d => d.id === entry.dimension);
  
  return (
    <Card 
      id={`journal-entry-${entry.id}`}
      className="dao-card p-5 group animate-fade-in-up scroll-mt-24"
      style={{ animationDelay: '0.2s' }}
    >
      <div className="flex items-start gap-4">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ 
            background: dim?.bgColor.replace('bg-[', '').replace(']', '') || 'hsl(var(--paper-yellow))',
            border: '1px solid hsl(var(--light-ink))',
          }}
        >
          <span 
            className="text-lg"
            style={{ color: dim?.color.replace('text-[', '').replace(']', '') || 'hsl(var(--mountain-green))' }}
          >
            {dim?.symbol || '记'}
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
          
          {entry.images && entry.images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {entry.images.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`图片 ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(url, '_blank')}
                />
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-3 mt-3 flex-wrap">
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

/** 把回声正文里的 [note:xxx] 渲染成可点击溯源标记，点击滚动到对应笔记 */
export const EchoContent: React.FC<{ content: string; onJump: (id: string) => void }> = ({ content, onJump }) => {
  const parts = content.split(/(\[note:[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[note:([^\]]+)\]$/);
        if (match) {
          return (
            <button
              key={i}
              onClick={() => onJump(match[1])}
              className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-full text-xs align-baseline transition-transform hover:scale-110"
              style={{
                background: 'hsl(var(--paper-yellow))',
                color: 'hsl(var(--cinnabar))',
                border: '1px solid hsl(var(--cinnabar))',
              }}
              title="跳到这条笔记"
            >
              溯源
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

interface EchoCardProps {
  data: EchoData;
  generating: boolean;
  onRegenerate: () => void;
  onJump: (id: string) => void;
}

export const EchoCard: React.FC<EchoCardProps> = ({ data, generating, onRegenerate, onJump }) => {
  const isSilent = data.type === 'silence';
  const label = data.type === 'echo' ? '回声 · 照见张力' : data.type === 'observation' ? '回声 · 温和观察' : '回声';

  return (
    <Card
      className="dao-card p-5 mb-8 animate-fade-in-up"
      style={{ borderLeft: '3px solid hsl(var(--cinnabar))' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'hsl(var(--paper-yellow))' }}
        >
          <Sparkles className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
        </div>
        <div className="flex-1">
          <h3 className="font-medium mb-2" style={{ color: 'hsl(var(--ink-green))' }}>
            {label}
          </h3>
          {generating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'hsl(var(--cinnabar))' }} />
              <span className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>镜正在回望你的足迹...</span>
            </div>
          ) : isSilent ? (
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--mountain-green))' }}>
              今日尚无可照见的呼应。继续写，镜子会越来越清晰。
            </p>
          ) : (
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--mountain-green))' }}>
              <EchoContent content={data.content} onJump={onJump} />
            </p>
          )}
          <button
            onClick={onRegenerate}
            disabled={generating}
            className="mt-3 text-xs hover:underline disabled:opacity-50"
            style={{ color: 'hsl(var(--smoke-gray))' }}
          >
            再照一次
          </button>
        </div>
      </div>
    </Card>
  );
};

const Home = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { openInstall } = useInstall();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 记录相关状态
  const [selectedDimension, setSelectedDimension] = useState<Dimension>('psychology');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [suggestingTags, setSuggestingTags] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const stopListeningRef = useRef<(() => void) | null>(null);
  const [showQuickAnalysis, setShowQuickAnalysis] = useState(false);
  const [quickAnalysis, setQuickAnalysis] = useState('');
  
  // 其他状态
  const [showReport, setShowReport] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<MorningReportData | null>(null);
  const [reportStage, setReportStage] = useState(0);

  // AI 回声：按需触发（点「照一照」才生成），当日已有结果只读展示、不自动调用 AI
  const [echoData, setEchoData] = useState<EchoData | null>(null);
  const [echoGenerating, setEchoGenerating] = useState(false);

  // 微动效状态
  const [verse] = useState(() => ['心静自然凉', '万物静观皆自得', '行到水穷处，坐看云起时', '道法自然'][Math.floor(Math.random() * 4)]);
  const [rippleKey, setRippleKey] = useState(0);
  const [sealKey, setSealKey] = useState(0);

  const currentDimension = DIMENSIONS.find(d => d.id === selectedDimension)!;

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: journalService.getEntries,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // 账号就绪时只读一次今日缓存用于展示：纯本地读取，不调用 AI、不显示加载态。
  // 真正生成只由用户点「照一照」/「再照一次」触发，刷新页面绝不再自动运行。
  useEffect(() => {
    setEchoData(user ? getTodayEcho(user.id) : null);
  }, [user]);

  // 阶段三：时令彩蛋与修行印记（渲染期不使用随机数）
  const solarTerm = useMemo(() => getSolarTerm(), []);
  const shichen = useMemo(() => getShichen(), []);
  const streak = useMemo(
    () => getJournalStreak(entries.map(entry => entry.timestamp)),
    [entries]
  );

  const createEntryMutation = useMutation({
    mutationFn: journalService.createEntry,
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: ['journal-entries'] });
      const previousEntries = queryClient.getQueryData(['journal-entries']);
      
      const optimisticEntry = {
        id: `temp-${Date.now()}`,
        content: newEntry.content,
        timestamp: newEntry.timestamp,
        tags: newEntry.tags,
        dimension: newEntry.dimension,
        images: newEntry.images,
      };
      
      queryClient.setQueryData(['journal-entries'], (old: any[]) => {
        return [optimisticEntry, ...(old || [])];
      });
      
      return { previousEntries };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      const savedContent = content;
      setContent('');
      setSelectedTags([]);
      setImages([]);
      setShowQuickAnalysis(true);
      setSealKey(k => k + 1);

      try {
        const analysis = await quickAnalysisService.analyze(savedContent);
        if (analysis) {
          setQuickAnalysis(analysis);
        }
      } catch (error) {
        console.error('Quick analysis error:', error);
      }
      
      toast({
        title: '记录已保存',
        description: '你的心声已珍藏',
      });
      textareaRef.current?.focus();
    },
    onError: (err, newEntry, context) => {
      queryClient.setQueryData(['journal-entries'], context?.previousEntries);
      toast({
        title: '保存失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });

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

  useEffect(() => {
    return () => {
      if (stopListeningRef.current) {
        stopListeningRef.current();
      }
    };
  }, []);

  // 晨报仪式：生成中三阶段轮播，与 2s 生成时长对齐
  useEffect(() => {
    if (!isGenerating) {
      setReportStage(0);
      return;
    }
    const timers = RITUAL_STAGES.slice(1).map((_, i) =>
      window.setTimeout(() => setReportStage(i + 1), (i + 1) * 650)
    );
    return () => timers.forEach(window.clearTimeout);
  }, [isGenerating]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if user is logged in
    if (!user) {
      toast({
        title: '请先登录',
        description: '上传图片需要先登录账号',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await journalService.uploadImage(file);
        uploadedUrls.push(url);
      }
      setImages(prev => [...prev, ...uploadedUrls]);
      toast({
        title: '图片上传成功',
        description: `已上传 ${uploadedUrls.length} 张图片`,
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: '上传失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceRecord = async () => {
    if (isListening) {
      if (stopListeningRef.current) {
        stopListeningRef.current();
        stopListeningRef.current = null;
      }
      setIsListening(false);
      return;
    }

    if (!voiceService.isSupported()) {
      toast({
        title: '不支持语音',
        description: '请使用 Chrome 或 Edge 浏览器',
        variant: 'destructive',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      toast({
        title: '需要麦克风权限',
        description: '请在浏览器设置中允许访问麦克风，然后重试',
        variant: 'destructive',
      });
      return;
    }

    setIsListening(true);
    setInterimTranscript('');

    try {
      stopListeningRef.current = await voiceService.startListening(
        (result) => {
          if (result.isFinal) {
            setContent(prev => prev + result.transcript);
            setInterimTranscript('');
          } else {
            setInterimTranscript(result.transcript);
          }
        },
        (error) => {
          toast({
            title: '语音识别错误',
            description: error,
            variant: 'destructive',
          });
          setIsListening(false);
        },
        () => {
          setIsListening(false);
          setInterimTranscript('');
        }
      );
    } catch (error) {
      toast({
        title: '语音识别错误',
        description: '无法启动语音识别',
        variant: 'destructive',
      });
      setIsListening(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag].slice(0, 3)
    );
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      toast({
        title: '提示',
        description: '请输入记录内容或上传图片',
      });
      return;
    }

    const newEntry: Omit<JournalEntry, 'id' | 'user_id'> = {
      content,
      timestamp: new Date().toISOString(),
      tags: selectedTags.length > 0 ? selectedTags : [currentDimension.tags[0]],
      dimension: selectedDimension,
      images: images.length > 0 ? images : undefined,
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

  // 按需生成回声：force=false 先查当日缓存（首次「照一照」），force=true 强制重照
  const handleEcho = async (force: boolean = false) => {
    if (!user) return;
    setEchoGenerating(true);
    try {
      const echoNickname = user.email?.split('@')[0] || '你';
      const result = await generateEcho({ entries, userId: user.id, nickname: echoNickname, force });
      if (result) setEchoData(result);
    } catch (error) {
      console.error('Echo generate failed:', error);
    } finally {
      setEchoGenerating(false);
    }
  };

  const handleEchoJump = (noteId: string) => {
    const el = document.getElementById(`journal-entry-${noteId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-[hsl(var(--cinnabar))]');
      window.setTimeout(() => el.classList.remove('ring-2', 'ring-[hsl(var(--cinnabar))]'), 2000);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const nickname = user?.email?.split('@')[0] || '朋友';
      // 仪式动效至少展示 1.3s，与真实 AI 调用并行，避免一闪而过
      const [data] = await Promise.all([
        morningReportService.generate(entries, nickname),
        new Promise(resolve => setTimeout(resolve, 1300)),
      ]);
      setReportData(data);
      setShowReport(true);
    } catch (error) {
      console.error('Generate report error:', error);
      toast({
        title: '晨报生成失败',
        description: '请稍后再试',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
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
    <div className="min-h-screen relative" data-season={solarTerm.season}>
      <InkBackground intensity="light" />
      
      <main className="py-8 pb-32 relative z-10 max-w-4xl mx-auto px-4">
        {/* 顶部问候语 */}
        <div className="mb-5 animate-fade-in-up flex items-start justify-between gap-3">
          <div className="min-w-0">
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
              className="text-sm mt-1 animate-verse-breathe"
              style={{ color: 'hsl(var(--smoke-gray))' }}
            >
              「{verse}」
            </p>
            <p
              className="text-xs mt-2"
              style={{ color: 'hsl(var(--stone-green))' }}
            >
              {shichen.name} · {shichen.phrase}　｜　{shichen.egg}
            </p>
          </div>
          {/* 安装到桌面入口：小众浏览器也能找到 */}
          <button
            onClick={openInstall}
            aria-label="安装到桌面"
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full transition-transform hover:scale-105 active:scale-95"
            style={{
              background: 'hsl(var(--paper-yellow))',
              border: '1px solid hsl(var(--light-ink))',
              color: 'hsl(var(--ink-green))',
            }}
          >
            <Download className="w-3.5 h-3.5" style={{ color: 'hsl(var(--cinnabar))' }} />
            <span className="text-xs">装到桌面</span>
          </button>
        </div>

        {/* 时令签 + 修行印记（阶段三） */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 animate-fade-in-up"
          style={{ animationDelay: '0.15s' }}
        >
          {/* 节气主题卡：随季节换肤 */}
          <Card className="dao-card season-card p-4 flex items-center gap-4">
            <div
              className="season-seal flex-shrink-0"
              key={solarTerm.name}
              aria-hidden="true"
            >
              {solarTerm.symbol}
            </div>
            <div className="min-w-0">
              <p
                className="text-base font-medium"
                style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--ink-green))' }}
              >
                时令 · {solarTerm.name}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: 'hsl(var(--smoke-gray))' }}
              >
                {solarTerm.phrase}
              </p>
            </div>
          </Card>

          {/* 连续记录成就徽章 */}
          <Card className="dao-card season-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-shrink-0 text-center">
                <div
                  className="text-2xl font-semibold leading-none badge-count"
                  style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--cinnabar))' }}
                >
                  {streak}
                </div>
                <div
                  className="text-[10px] mt-1"
                  style={{ color: 'hsl(var(--smoke-gray))' }}
                >
                  连续记录日
                </div>
              </div>
              <div className="h-10 w-px flex-shrink-0" style={{ background: 'hsl(var(--light-ink))' }} />
              <div className="flex gap-2 flex-wrap justify-end">
                {STREAK_BADGES.map((badge) => {
                  const earned = streak >= badge.days;
                  return (
                    <div
                      key={`${badge.days}-${earned ? 'earned' : 'locked'}`}
                      title={earned ? `${badge.name} · ${badge.hint}` : `再记 ${badge.days - streak} 日解锁「${badge.name}」`}
                      className={cn(
                        'badge-seal flex flex-col items-center justify-center',
                        earned ? 'earned' : 'locked'
                      )}
                    >
                      <span className="text-xs font-medium">{badge.name}</span>
                      <span className="text-[9px] mt-0.5">{badge.days} 日</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* 记录卡片 */}
        <Card
          className="dao-card p-5 mb-8 animate-fade-in-up"
          style={{ animationDelay: '0.1s', position: 'relative' }}
        >
          <label 
            className="text-sm font-medium mb-3 block"
            style={{ color: 'hsl(var(--ink-green))' }}
          >
            选择维度
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
            {DIMENSIONS.map((dim) => (
              <button
                key={dim.id}
                onClick={() => {
                  setSelectedDimension(dim.id);
                  setSelectedTags([]);
                  setRippleKey(k => k + 1);
                }}
                className={cn(
                  'relative overflow-hidden flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200',
                  selectedDimension === dim.id
                    ? `${dim.bgColor} ${dim.borderColor} border-2 shadow-soft`
                    : 'hover:bg-[hsl(var(--paper-yellow))] border-2 border-transparent'
                )}
              >
                {selectedDimension === dim.id && rippleKey > 0 && (
                  <span key={rippleKey} className="ink-ripple" aria-hidden="true" />
                )}
                <div
                  className={cn(
                    'relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium',
                    selectedDimension === dim.id ? dim.bgColor : 'bg-[hsl(var(--light-ink))]'
                  )}
                >
                  <span className={dim.color}>{dim.symbol}</span>
                </div>
                <span
                  className="relative z-10 text-xs font-medium"
                  style={{ color: 'hsl(var(--ink-green))' }}
                >
                  {dim.shortLabel}
                </span>
              </button>
            ))}
          </div>
          
          <div 
            className="mt-4 p-3 rounded-lg text-sm mb-6"
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

          <div className="relative mb-4 ink-focus">
            <Textarea
              ref={textareaRef}
              value={content + (interimTranscript ? interimTranscript : '')}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`记录你的${currentDimension.shortLabel}...`}
              className={cn(
                "dao-input w-full min-h-[180px] resize-none text-base",
                isListening && "border-red-400"
              )}
            />

            {sealKey > 0 && (
              <div key={sealKey} className="seal-stamp" aria-hidden="true">已珍藏</div>
            )}

            <Button
              type="button"
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              onClick={handleVoiceRecord}
              className={cn(
                "absolute bottom-3 right-3 rounded-full w-10 h-10 transition-all",
                isListening && "animate-pulse bg-red-500 hover:bg-red-600"
              )}
              title={isListening ? "停止录音" : "开始语音输入"}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          {isListening && (
            <div 
              className="mt-3 p-3 rounded-lg flex items-center gap-2 animate-pulse mb-4"
              style={{ 
                background: 'hsla(350,60%,50%,0.1)',
                border: '1px solid hsla(350,60%,50%,0.3)',
              }}
            >
              <Volume2 className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>
                正在录音... 说话即可识别
              </span>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          
          {images.length > 0 && (
            <div className="mt-4 mb-4">
              <div className="flex flex-wrap gap-2">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`上传图片 ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-4 mb-6 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImages}
              className="btn-secondary"
            >
              {uploadingImages ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Image className="w-4 h-4 mr-2" />
              )}
              添加图片
            </Button>
            <span className="text-xs" style={{ color: 'hsl(var(--smoke-gray))' }}>
              最多 5MB
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                if (!content.trim()) {
                  toast({
                    title: '提示',
                    description: '请先输入记录内容',
                  });
                  return;
                }
                setSuggestingTags(true);
                try {
                  const suggested = await tagService.suggestTags(content, currentDimension.label);
                  if (suggested.length > 0) {
                    setSelectedTags(prev => [...new Set([...prev, ...suggested])].slice(0, 3));
                    toast({
                      title: 'AI 标签建议',
                      description: `已添加：${suggested.join(', ')}`,
                    });
                  } else {
                    toast({
                      title: '无法生成标签',
                      description: '请稍后重试',
                    });
                  }
                } catch (error) {
                  toast({
                    title: '生成失败',
                    description: '请稍后重试',
                    variant: 'destructive',
                  });
                } finally {
                  setSuggestingTags(false);
                }
              }}
              disabled={suggestingTags || !content.trim()}
              className="btn-secondary ml-2"
            >
              {suggestingTags ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              AI 建议
            </Button>
          </div>
          
          <div className="mt-4 mb-6">
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
          
          <div className="flex justify-end mt-5">
            <Button
              onClick={handleSubmit}
              disabled={(!content.trim() && images.length === 0) || createEntryMutation.isPending || uploadingImages}
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

        {/* 快速分析卡片 */}
        {showQuickAnalysis && (
          <Card 
            className="dao-card p-5 mb-8 animate-fade-in-up border-2"
            style={{ borderColor: 'hsl(var(--cinnabar))' }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'hsl(var(--paper-yellow))' }}
              >
                <Sparkles className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              </div>
              <div className="flex-1">
                <h3 
                  className="font-medium mb-2"
                  style={{ color: 'hsl(var(--ink-green))' }}
                >
                  即时洞察
                </h3>
                {quickAnalysis ? (
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: 'hsl(var(--mountain-green))' }}
                  >
                    {quickAnalysis}
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'hsl(var(--cinnabar))' }} />
                    <span className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>
                      AI 正在分析...
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setShowQuickAnalysis(false)}
                  className="mt-3 text-xs hover:underline"
                  style={{ color: 'hsl(var(--smoke-gray))' }}
                >
                  关闭
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* AI 回声：按需触发——点「照一照」才生成；已有当日结果静态展示，刷新不再自动运行 */}
        {echoGenerating ? (
          <EchoCard
            data={{ type: 'echo', content: '', sourceIds: [] }}
            generating
            onRegenerate={() => handleEcho(true)}
            onJump={handleEchoJump}
          />
        ) : echoData ? (
          <EchoCard
            data={echoData}
            generating={false}
            onRegenerate={() => handleEcho(true)}
            onJump={handleEchoJump}
          />
        ) : (
          <Card
            className="dao-card p-5 mb-8 animate-fade-in-up"
            style={{ borderLeft: '3px solid hsl(var(--cinnabar))' }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'hsl(var(--paper-yellow))' }}
              >
                <Sparkles className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-2" style={{ color: 'hsl(var(--ink-green))' }}>
                  回声 · 照见张力
                </h3>
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'hsl(var(--mountain-green))' }}>
                  回望最近的记录，看看过去的自己与今天，有没有呼应与张力。
                </p>
                <Button
                  size="sm"
                  onClick={() => handleEcho(false)}
                  disabled={entries.length === 0}
                  className="btn-primary"
                >
                  照一照
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 最近记录 */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 
              className="text-lg font-medium"
              style={{ 
                fontFamily: 'var(--font-serif)',
                color: 'hsl(var(--ink-green))',
              }}
            >
              最近记录
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

      {/* 生成晨报按钮：右下角小型悬浮按钮，图标为主，hover 出文字提示 */}
      <div className="fixed bottom-6 right-6 z-20 group">
        <Button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          aria-label="生成今日晨报"
          className="h-14 w-14 !rounded-full !p-0 flex items-center justify-center transition-transform hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--ink-green)) 0%, hsl(var(--mountain-green)) 100%)',
            color: 'white',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
          }}
        >
          {isGenerating ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Sunrise className="w-6 h-6" />
          )}
        </Button>
        <span
          className="pointer-events-none absolute bottom-[4.5rem] right-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs opacity-0 shadow-soft transition-opacity group-hover:opacity-100 dao-glass"
          style={{ color: 'hsl(var(--ink-green))' }}
        >
          生成今日晨报
        </span>
      </div>

      {/* 生成中遮罩：三阶段仪式动效 */}
      {isGenerating && (
        <div className="fixed inset-0 z-30 dao-glass flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="ritual-halo"
                  style={{ animationDelay: `${i * 0.8}s` }}
                  aria-hidden="true"
                />
              ))}
              <TaijiIcon size={64} animated glow />
            </div>
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
                key={reportStage}
                className="text-sm ritual-stage"
                style={{ color: 'hsl(var(--mountain-green))' }}
              >
                {RITUAL_STAGES[reportStage].title} · {RITUAL_STAGES[reportStage].desc}
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                {RITUAL_STAGES.map((stage, i) => (
                  <span
                    key={stage.title}
                    className={cn('ritual-dot', i === reportStage && 'active')}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 晨报对话框 */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent 
          className="max-w-2xl max-h-[85vh] overflow-y-auto dao-card p-0 border-0"
        >
          <DialogTitle className="sr-only">今日晨报</DialogTitle>
          <DialogDescription className="sr-only">
            AI 生成的个性化晨报
          </DialogDescription>
          
          <div className="p-8 report-unfold">
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
            
            {reportData && (
              <div className="space-y-5" style={{ fontFamily: 'var(--font-sans)' }}>
                {/* 开场白 */}
                {reportData.greeting && (
                  <p
                    className="text-lg leading-relaxed text-center"
                    style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--ink-green))' }}
                  >
                    {reportData.greeting}
                  </p>
                )}

                {/* 情绪底色 */}
                {reportData.mood && (
                  <div
                    className="p-4 rounded-lg"
                    style={{ background: 'hsl(var(--paper-yellow))' }}
                  >
                    <div className="flex items-start gap-3">
                      <Heart className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'hsl(var(--cinnabar))' }} />
                      <div>
                        <div className="text-xs mb-1" style={{ color: 'hsl(var(--smoke-gray))' }}>今日心境</div>
                        <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--ink-green))' }}>
                          {reportData.mood}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 真实瞬间 */}
                {reportData.highlights.length > 0 && (
                  <div>
                    <div className="text-xs mb-2" style={{ color: 'hsl(var(--smoke-gray))' }}>此刻留痕</div>
                    <ul className="space-y-2">
                      {reportData.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: 'hsl(var(--ink-green))' }}>
                          <span style={{ color: 'hsl(var(--cinnabar))' }}>·</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 温和观察 */}
                {reportData.insight && (
                  <div>
                    <div className="text-xs mb-1" style={{ color: 'hsl(var(--smoke-gray))' }}>一面镜子</div>
                    <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--mountain-green))' }}>
                      {reportData.insight}
                    </p>
                  </div>
                )}

                {/* 今日小动作 */}
                {reportData.suggestion && (
                  <div
                    className="p-4 rounded-lg border"
                    style={{ background: 'hsla(9, 52%, 53%, 0.04)', borderColor: 'hsla(9, 52%, 53%, 0.2)' }}
                  >
                    <div className="flex items-start gap-3">
                      <Sunrise className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'hsl(var(--cinnabar))' }} />
                      <div>
                        <div className="text-xs mb-1" style={{ color: 'hsl(var(--cinnabar))' }}>今日一行</div>
                        <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--ink-green))' }}>
                          {reportData.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 收尾 */}
                {reportData.closing && (
                  <p
                    className="text-sm text-center pt-2 leading-relaxed"
                    style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--smoke-gray))' }}
                  >
                    {reportData.closing}
                  </p>
                )}
              </div>
            )}
            
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

      {/* 删除确认对话框 */}
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

export default Home;