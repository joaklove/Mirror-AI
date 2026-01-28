// Placeholder file - please paste the complete Index.tsx code here
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Send, Sunrise, Clock, Sparkles, Loader2, X, Trash2, Download, AlertTriangle, Key, Server, Cpu, ExternalLink, LogOut, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/contexts/AuthContext';
import { journalService, settingsService, reportsService, type JournalEntry } from '@/services/journalService';
import { supabase } from '@/integrations/supabase/client';
import { JournalEvents, AIEvents, SettingsEvents, InteractionEvents, AuthEvents, EngagementEvents, ContentEvents, ConversionEvents, DiscoveryEvents, ErrorEvents, PerformanceEvents, AIUsageEvents } from '@/utils/analytics';
import { PostHogJournalEvents, PostHogAIEvents, PostHogAuthEvents, PostHogConversionEvents, PostHogDiscoveryEvents, PostHogErrorEvents, PostHogPerformanceEvents, identifyUser } from '@/utils/posthog';

interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  feishuWebhook?: string;
}

interface AIReport {
  id: string;
  content: string;
  created_at: string | null;
  model?: string | null;
  model_used?: string | null;
  user_id: string;
}

const STORAGE_KEY = 'mirror-ai-journal-entries';
const CONFIG_KEY = 'mirror-ai-config';

const generateRandomTags = (content: string): string[] => {
  const allTags = ['工作', '情绪', '小确幸', '日常', '学习', '健康'];
  
  const tagKeywords: Record<string, string[]> = {
    工作: ['工作', '项目', '会议', '任务', '客户', '同事', '加班', 'deadline'],
    情绪: ['焦虑', '开心', '难过', '激动', '紧张', '压力', '情绪', '心情'],
    小确幸: ['成就', '突破', '完成', '解决', '棒', '好', '成功', '开心'],
    学习: ['学习', '阅读', '文档', '教程', '课程', '研究'],
    健康: ['运动', '健身', '跑步', '睡眠', '休息', '放松'],
    日常: ['天气', '咖啡', '午餐', '晚餐', '逛街', '购物'],
  };

  const matchedTags: string[] = [];
  
  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      matchedTags.push(tag);
    }
  }

  if (matchedTags.length === 0) {
    const randomCount = Math.random() > 0.5 ? 2 : 1;
    const shuffled = [...allTags].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, randomCount);
  }

  return matchedTags.slice(0, 2);
};

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [journalInput, setJournalInput] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMigration, setShowMigration] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportContent, setReportContent] = useState('');
  const reportViewStartTimeRef = useRef<number>(0); // 🆕 使用 Ref 避免闭包陷阱
  const [historyReports, setHistoryReports] = useState<AIReport[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [aiConfig, setAiConfig] = useState<AIConfig>({
    apiKey: '',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'deepseek/deepseek-chat',
    feishuWebhook: 'https://open.feishu.cn/open-apis/bot/v2/hook/a2534087-426e-486e-ba1a-66988f7a329e',
  });

  // 记录页面加载开始时间
  const pageLoadStartTime = useRef<number>(Date.now());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const loadConfig = async () => {
      try {
        // 1. 尝试从 Supabase 加载
        const cloudConfig = await settingsService.getSettings();
        if (cloudConfig && cloudConfig.apiKey) {
          setAiConfig(cloudConfig);
          localStorage.setItem(CONFIG_KEY, JSON.stringify(cloudConfig));
          return;
        }

        // 2. 回退到 localStorage
        const stored = localStorage.getItem(CONFIG_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setAiConfig(parsed);
          
          // 如果有本地配置但云端没有，尝试同步到云端
          if (parsed.apiKey) {
            settingsService.saveSettings(parsed).catch(console.error);
          }
        }
      } catch (error) {
        console.error('Failed to load AI config:', error);
      }
    };

    loadConfig();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    loadData();
    loadHistoryReports();
    
    // PostHog: 识别用户（带错误处理）
    try {
      identifyUser(user.id, {
        email: user.email || '',
        created_at: user.created_at || '',
      });
    } catch (error) {
      console.warn('[PostHog] User identification failed:', error);
    }
  }, [user]);

  // 🆕 计算并追踪晨报生成率（当 entries 变化时）
  useEffect(() => {
    const calculateGenerationRate = () => {
      if (entries.length === 0) return;

      // 获取所有有记录的天数（活跃天数）
      const uniqueDates = new Set(
        entries.map(entry => new Date(entry.timestamp).toDateString())
      );
      const activeDays = uniqueDates.size;

      // 获取生成过晨报的天数（从 localStorage 读取）
      const generatedDatesStr = localStorage.getItem('generated_report_dates') || '[]';
      const generatedDates = JSON.parse(generatedDatesStr) as string[];
      const generatedDays = new Set(generatedDates).size;

      // 计算生成率
      if (activeDays > 0) {
        const rate = (generatedDays / activeDays) * 100;
        
        // 每次 entries 变化时追踪一次
        AIUsageEvents.reportGenerationRate(rate, generatedDays, activeDays);
        PostHogAIEvents.generationRate(rate, generatedDays, activeDays);

        console.log(`[Analytics] 晨报生成率: ${rate.toFixed(2)}% (${generatedDays}/${activeDays}天)`);
      }
    };

    // 延迟计算，确保数据加载完成
    const timer = setTimeout(calculateGenerationRate, 1000);
    return () => clearTimeout(timer);
  }, [entries]);

  const loadData = async () => {
    const startTime = Date.now();
    try {
      setLoading(true);
      const loadedEntries = await journalService.getEntries();
      setEntries(loadedEntries);

      // GA 追踪：数据加载性能
      const loadTime = Date.now() - startTime;
      PerformanceEvents.databaseOperation('Load Entries', loadTime);

      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData && loadedEntries.length === 0) {
        setShowMigration(true);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // GA 追踪：数据加载失败
      ErrorEvents.dataLoadFailed(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
      
      // GA 追踪：页面加载完成
      const totalLoadTime = Date.now() - pageLoadStartTime.current;
      PerformanceEvents.pageLoadTime(totalLoadTime);
      
      // GA 追踪：每日访问
      EngagementEvents.dailyVisit();
    }
  };

  const loadHistoryReports = async () => {
    try {
      const reports = await reportsService.getReports(20);
      setHistoryReports(reports);
    } catch (error) {
      console.error('Failed to load history reports:', error);
    }
  };

  const handleSendEntry = async () => {
    if (journalInput.trim() === '') return;

    const newEntry: Omit<JournalEntry, 'id' | 'user_id'> = {
      content: journalInput,
      timestamp: new Date().toISOString(),
      tags: generateRandomTags(journalInput),
    };

    const startTime = Date.now();
    try {
      const created = await journalService.createEntry(newEntry);
      setEntries([created, ...entries]);
      
      // GA 追踪：性能 - 创建日记
      const createTime = Date.now() - startTime;
      PerformanceEvents.databaseOperation('Create Entry', createTime);
      
      // GA 追踪：创建日记
      const wordCount = journalInput.trim().split(/\s+/).length;
      JournalEvents.create(wordCount, newEntry.tags);
      
      // PostHog 追踪：创建日记
      PostHogJournalEvents.create(wordCount, newEntry.tags);
      
      // GA 追踪：内容质量 - 字数分类
      const category = wordCount < 50 ? 'short' : wordCount < 200 ? 'medium' : 'long';
      ContentEvents.entryWordCount(wordCount, category);
      
      // GA 追踪：标签使用
      newEntry.tags.forEach(tag => ContentEvents.tagUsage(tag));
      
      // GA 追踪：首篇日记（转化漏斗）
      if (entries.length === 0) {
        ConversionEvents.firstEntry();
        // PostHog 追踪：首篇日记
        PostHogConversionEvents.firstEntry();
      }
      
      // GA 追踪：里程碑
      const milestones = [1, 5, 10, 20, 50, 100];
      const newCount = entries.length + 1;
      if (milestones.includes(newCount)) {
        ConversionEvents.milestone('Entries Written', newCount);
      }
      
      // 🆕 追踪每日记录条数
      const today = new Date().toDateString();
      const todayEntries = [created, ...entries].filter(entry => {
        return new Date(entry.timestamp).toDateString() === today;
      });
      
      ContentEvents.dailyEntryCount(todayEntries.length);
      PostHogJournalEvents.dailyCount(todayEntries.length, today);
      
      setJournalInput('');
      
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    } catch (error) {
      console.error('Failed to create entry:', error);
      // GA 追踪：错误
      ErrorEvents.errorOccurred('Create Entry Failed', error instanceof Error ? error.message : 'Unknown');
      alert('保存失败，请重试');
    }
  };

  const handleDeleteEntry = (id: string) => {
    setEntryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (entryToDelete) {
      const startTime = Date.now();
      try {
        await journalService.deleteEntry(entryToDelete);
        setEntries(entries.filter(entry => entry.id !== entryToDelete));
        
        // GA 追踪：性能
        const deleteTime = Date.now() - startTime;
        PerformanceEvents.databaseOperation('Delete Entry', deleteTime);
        
        // GA 追踪：删除日记
        JournalEvents.delete();
        
        setDeleteConfirmOpen(false);
        setEntryToDelete(null);
      } catch (error) {
        console.error('Failed to delete entry:', error);
        // GA 追踪：错误
        ErrorEvents.errorOccurred('Delete Entry Failed', error instanceof Error ? error.message : 'Unknown');
        alert('删除失败，请重试');
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setEntryToDelete(null);
  };

  const handleGenerateReport = async (force = false) => {
    if (!aiConfig.apiKey || aiConfig.apiKey.trim() === '') {
      alert('请先在设置中配置 API Key');
      setShowSettings(true);
      return;
    }

    // 🆕 检查缓存逻辑
    const today = new Date().toISOString().split('T')[0];
    const lastReportDate = localStorage.getItem('last_report_date');
    const lastReportContent = localStorage.getItem('last_report_content');

    if (!force && lastReportDate === today && lastReportContent) {
      setReportContent(lastReportContent);
      setShowReport(true);
      reportViewStartTimeRef.current = Date.now();
      toast({
        title: '📦 加载缓存副本',
        description: '今日晨报已生成，为您展示缓存内容',
      });
      return;
    }

    const recentEntries = journalService.getRecentEntries(entries, 24);

    if (recentEntries.length === 0) {
      alert('请先写几篇日记再来生成晨报');
      return;
    }

    setIsGenerating(true);
    const startTime = Date.now();

    // GA 追踪：开始生成晨报
    AIEvents.generateReport(recentEntries.length, aiConfig.model);
    
    // PostHog 追踪：开始生成晨报
    PostHogAIEvents.generateReport(recentEntries.length, aiConfig.model);

    try {
      const journalText = recentEntries
        .map((entry) => {
          const date = new Date(entry.timestamp);
          const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          return `[${timeStr}] ${entry.content}`;
        })
        .join('\n\n');

      const systemPrompt = `你是一个结合了理性 COO (首席运营官) 和感性心理咨询师的 AI 助手。请根据用户的日记，生成一份 Markdown 格式的晨报。

输出必须包含三个板块：

### 🗺️ 今日作战地图 (基于昨天未完成的任务和今天的规划)
### 🛡️ 战术修正锦囊 (针对昨天低效行为或卡点的具体改进建议)
### ❤️ 心灵护语 & 能量站 (情绪安抚、高光时刻回溯、心理学建议)

请保持语气温暖、坚定且具有行动指导意义。不要输出任何寒暄语，直接输出 Markdown 内容。`;

      const userPrompt = `以下是我过去24小时的日记记录：\n\n${journalText}\n\n请为我生成今日晨报。`;

      const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aiConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `API 调用失败: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const generatedContent = data.choices?.[0]?.message?.content;

      if (!generatedContent) {
        throw new Error('AI 返回内容为空');
      }

      setReportContent(generatedContent);
      setIsGenerating(false);
      setShowReport(true);
      reportViewStartTimeRef.current = Date.now(); // 🆕 更新 Ref
      
      // 🆕 保存到缓存
      localStorage.setItem('last_report_date', today);
      localStorage.setItem('last_report_content', generatedContent);

      // 🆕 推送到飞书
      if (aiConfig.feishuWebhook) {
        fetch(aiConfig.feishuWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            msg_type: 'text',
            content: {
              text: `🌞 Mirror AI 今日晨报已送达：\n\n${generatedContent}`,
            },
          }),
        })
          .then((res) => {
            if (res.ok) {
              toast({
                title: '🚀 晨报已推送到飞书',
                description: '自动化流程执行成功',
              });
            }
          })
          .catch((err) => console.error('Feishu push failed:', err));
      }
      
      // 🆕 保存报告到数据库
      try {
        await reportsService.saveReport(generatedContent, aiConfig.model);
        loadHistoryReports(); // 刷新历史列表
      } catch (saveError) {
        console.error('Failed to save report to cloud:', saveError);
      }
      
      // GA 追踪：生成成功
      const responseTime = Date.now() - startTime;
      AIEvents.reportSuccess(responseTime, aiConfig.model);
      PerformanceEvents.aiResponseTime(responseTime, aiConfig.model);
      InteractionEvents.viewReport();
      
      // PostHog 追踪：生成成功
      PostHogAIEvents.reportSuccess(responseTime, aiConfig.model);
      PostHogPerformanceEvents.aiResponseTime(responseTime, aiConfig.model);
      
      // GA 追踪：首次生成晨报（转化漏斗）
      const hasGeneratedBefore = localStorage.getItem('has_generated_report');
      if (!hasGeneratedBefore) {
        ConversionEvents.firstReport();
        // PostHog 追踪：首次生成晨报
        PostHogConversionEvents.firstReport();
        localStorage.setItem('has_generated_report', 'true');
      }

      // 🆕 记录生成晨报的日期（用于计算生成率）
      const generatedDatesStr = localStorage.getItem('generated_report_dates') || '[]';
      const generatedDates = JSON.parse(generatedDatesStr) as string[];
      
      if (!generatedDates.includes(today)) {
        generatedDates.push(today);
        localStorage.setItem('generated_report_dates', JSON.stringify(generatedDates));
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      setIsGenerating(false);
      
      // GA 追踪：生成失败
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      AIEvents.reportError(errorMessage, aiConfig.model);
      ErrorEvents.errorOccurred('Generate Report Failed', errorMessage);
      
      // GA 追踪：网络错误
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        ErrorEvents.networkError('OpenRouter API');
      }
      
      alert(`生成失败：${errorMessage}`);
    }
  };

  const handleSaveAIConfig = async () => {
    try {
      if (!aiConfig.apiKey || aiConfig.apiKey.trim() === '') {
        toast({
          title: '⚠️ 配置不完整',
          description: '请填写 API Key',
          variant: 'destructive',
        });
        // GA 追踪：配置验证失败
        ErrorEvents.configInvalid('API Key');
        return;
      }
      
      // 检查模型是否切换
      const oldConfig = localStorage.getItem(CONFIG_KEY);
      if (oldConfig) {
        const oldParsed = JSON.parse(oldConfig);
        if (oldParsed.model !== aiConfig.model) {
          // GA 追踪：模型切换
          AIUsageEvents.modelSwitch(oldParsed.model, aiConfig.model);
        }
      }
      
      localStorage.setItem(CONFIG_KEY, JSON.stringify(aiConfig));
      
      // 🆕 同步到云端
      try {
        await settingsService.saveSettings(aiConfig);
      } catch (cloudError) {
        console.error('Failed to sync settings to cloud:', cloudError);
        toast({
          title: '⚠️ 云端同步失败',
          description: '配置已保存在本地，但未能同步到云端',
          variant: 'destructive',
        });
      }
      
      // GA 追踪：保存 AI 配置
      AIEvents.saveConfig(aiConfig.model);
      
      // GA 追踪：完成设置（转化漏斗）
      const hasConfigured = localStorage.getItem('has_configured_ai');
      if (!hasConfigured) {
        ConversionEvents.setupCompleted();
        localStorage.setItem('has_configured_ai', 'true');
      }
      
      toast({
        title: '✅ 配置保存成功',
        description: `已保存 ${aiConfig.model} 模型配置`,
      });
    } catch (error) {
      console.error('Failed to save AI config:', error);
      // GA 追踪：错误
      ErrorEvents.errorOccurred('Save Config Failed', error instanceof Error ? error.message : 'Unknown');
      toast({
        title: '❌ 保存失败',
        description: '请重试',
        variant: 'destructive',
      });
    }
  };

  const handleExportData = async () => {
    try {
      const dataStr = JSON.stringify(entries, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      
      const date = new Date().toISOString().split('T')[0];
      link.download = `mirror-ai-backup-${date}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // GA 追踪：导出数据
      JournalEvents.export(entries.length);
      
      // GA 追踪：功能发现
      const hasExported = localStorage.getItem('has_exported_data');
      if (!hasExported) {
        DiscoveryEvents.featureDiscovered('Export Data');
        localStorage.setItem('has_exported_data', 'true');
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      // GA 追踪：错误
      ErrorEvents.errorOccurred('Export Failed', error instanceof Error ? error.message : 'Unknown');
      alert('导出失败，请重试');
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('⚠️ 危险操作！\n\n确定要清空所有数据吗？此操作无法撤销！')) {
      if (window.confirm('最后确认：真的要删除所有日记吗？')) {
        try {
          const entryCount = entries.length;
          for (const entry of entries) {
            await journalService.deleteEntry(entry.id);
          }
          setEntries([]);
          setShowSettings(false);
          
          // GA 追踪：清空所有数据
          JournalEvents.clearAll(entryCount);
          
          alert('所有数据已清空');
        } catch (error) {
          console.error('Failed to clear data:', error);
          alert('清空失败，请重试');
        }
      }
    }
  };

  const handleMigrateData = async () => {
    const startTime = Date.now();
    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      if (!localData) {
        alert('没有找到本地数据');
        return;
      }

      const parsed = JSON.parse(localData);
      await journalService.batchImport(parsed);
      
      const loadedEntries = await journalService.getEntries();
      setEntries(loadedEntries);
      
      // GA 追踪：数据迁移
      JournalEvents.migrate(parsed.length);
      
      // GA 追踪：性能
      const syncTime = Date.now() - startTime;
      PerformanceEvents.syncTime(syncTime, 'Data Migration');
      
      setShowMigration(false);
      alert('数据迁移成功！');
      
      if (window.confirm('数据已成功同步到云端，是否清除本地缓存？')) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to migrate data:', error);
      // GA 追踪：错误
      ErrorEvents.errorOccurred('Migration Failed', error instanceof Error ? error.message : 'Unknown');
      alert('迁移失败，请重试');
    }
  };

  const handleSignOut = async () => {
    if (window.confirm('确定要退出登录吗？')) {
      try {
        // GA 追踪：登出
        AuthEvents.signOut();
        // PostHog 追踪：登出（包含 reset）
        PostHogAuthEvents.signOut();
        
        await signOut();
        navigate('/auth');
      } catch (error) {
        console.error('Failed to sign out:', error);
        alert('退出失败，请重试');
      }
    }
  };

  const formatSmartTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // 检查是否是今天
    const isToday = date.toDateString() === now.toDateString();
    
    // 检查是否是昨天
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    // 检查是否是今年
    const isThisYear = date.getFullYear() === now.getFullYear();
  
    const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  
    if (isToday) {
      return timeStr; // 今天只显示时间
    } else if (isYesterday) {
      return `昨天 ${timeStr}`;
    } else if (isThisYear) {
      // 今年显示 月-日 时间
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${timeStr}`;
    } else {
      // 跨年显示 年-月-日
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      工作: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      情绪: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      小确幸: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      日常: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      学习: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      健康: 'bg-green-500/20 text-green-300 border-green-500/30',
    };
    return colors[tag] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-rose-400 animate-spin mx-auto" />
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground relative">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-slate-900/30 border-b border-rose-500/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
              Mirror AI
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-white/10"
              onClick={() => {
              setShowSettings(true);
              // GA 追踪：打开设置
              SettingsEvents.open();
            }}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-white/10 hover:text-red-400"
              onClick={handleSignOut}
              title="退出登录"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl pb-32 relative z-10">
        <Card className="p-4 mb-6 bg-slate-900/30 backdrop-blur-xl border border-rose-500/20 shadow-lg">
          <Textarea
            ref={textareaRef}
            value={journalInput}
            onChange={(e) => setJournalInput(e.target.value)}
            placeholder="此刻在想什么？工作卡点、情绪波动或是小确幸..."
            className="min-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-gray-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                // GA 追踪：使用快捷键
                // eslint-disable-next-line react-hooks/rules-of-hooks
                InteractionEvents.useShortcut('Cmd/Ctrl+Enter');
                
                // GA 追踪：功能发现 - 快捷键
                const hasUsedShortcut = localStorage.getItem('has_used_keyboard_shortcut');
                if (!hasUsedShortcut) {
                  DiscoveryEvents.featureDiscovered('Keyboard Shortcut');
                  localStorage.setItem('has_used_keyboard_shortcut', 'true');
                }
                
                handleSendEntry();
              }
            }}
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={handleSendEntry}
              className="bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-400 hover:to-orange-500 text-white rounded-2xl transition-all hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]"
              disabled={journalInput.trim() === ''}
            >
              <Send className="w-4 h-4 mr-2" />
              发送记录
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              今日时间轴
            </h2>
            {historyReports.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              >
                <Sunrise className="w-3 h-3 mr-1" />
                历史报告 ({historyReports.length})
              </Button>
            )}
          </div>

          {entries.length === 0 ? (
            <Card className="p-8 bg-slate-900/30 backdrop-blur-xl border border-rose-500/20 text-center">
              <p className="text-gray-400">还没有日记记录，开始记录你的第一篇吧！</p>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card
                key={entry.id}
                className="p-4 bg-slate-900/30 backdrop-blur-xl border border-rose-500/20 hover:border-rose-500/50 transition-all duration-200 shadow-lg group"
              >
                <div className="flex items-start gap-3 relative">
                  <div className="text-sm font-mono text-rose-400 whitespace-nowrap">
                    {formatSmartTime(entry.timestamp)}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-200 leading-relaxed mb-3">{entry.content}</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={`text-xs ${getTagColor(tag)}`}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      handleDeleteEntry(entry.id);
                    }}
                    className="relative z-50 p-2 text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all cursor-pointer"
                    aria-label="删除记录"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      <div className="fixed bottom-8 right-8 z-20 flex flex-col items-end gap-2">
        {localStorage.getItem('last_report_date') === new Date().toISOString().split('T')[0] && (
          <button
            onClick={() => handleGenerateReport(true)}
            disabled={isGenerating}
            className="text-xs text-gray-500 hover:text-rose-400 transition-colors bg-slate-900/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5"
          >
            {isGenerating ? '正在重新生成...' : '强制重新生成'}
          </button>
        )}
        <Button
          onClick={() => handleGenerateReport(false)}
          disabled={isGenerating}
          className="h-14 px-6 text-base font-medium bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-400 hover:to-orange-500 text-white rounded-full transition-all animate-pulse-glow disabled:opacity-50 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              正在生成...
            </>
          ) : (
            <>
              <Sunrise className="w-5 h-5 mr-2" />
              {localStorage.getItem('last_report_date') === new Date().toISOString().split('T')[0] ? '查看今日晨报' : '生成今日晨报'}
            </>
          )}
        </Button>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-rose-500/20 blur-xl animate-pulse-glow"></div>
              </div>
              <Loader2 className="w-12 h-12 text-rose-400 animate-spin mx-auto relative z-10" />
            </div>
            <div className="space-y-2">
              <p className="text-lg text-gray-200 animate-breathe">正在连接潜意识...</p>
              <p className="text-sm text-gray-400 animate-breathe">正在分析行为模式...</p>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showReport} onOpenChange={(open) => {
        if (!open && reportViewStartTimeRef.current > 0) {
          // GA 追踪：晨报查看时长
          const viewDuration = Math.floor((Date.now() - reportViewStartTimeRef.current) / 1000);
          AIUsageEvents.reportViewDuration(viewDuration, aiConfig.model);
          reportViewStartTimeRef.current = 0; // 重置 Ref
          
          // GA 追踪：关闭晨报
          InteractionEvents.closeReport();
        }
        setShowReport(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900/80 backdrop-blur-xl border border-rose-500/20 shadow-2xl rounded-3xl p-0">
          <DialogTitle className="sr-only">今日晨报</DialogTitle>
          <DialogDescription className="sr-only">
            AI 生成的个性化晨报，包含今日作战地图、战术修正锦囊和心灵护语
          </DialogDescription>
          <button
            onClick={() => setShowReport(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-200" />
          </button>

          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
                <Sunrise className="w-6 h-6 text-rose-400" />
                今日晨报
              </h2>
            </div>

            <div className="prose prose-invert prose-rose max-w-none">
              <ReactMarkdown
                components={{
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent mb-4 mt-6">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-3 mb-6">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start gap-3 pl-0">
                      <span className="text-rose-400 mt-1.5 flex-shrink-0">•</span>
                      <span className="text-gray-300 flex-1">{children}</span>
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-rose-500/70 bg-white/5 backdrop-blur-sm pl-6 pr-4 py-3 my-4 rounded-r-lg">
                      <div className="text-gray-300 italic">{children}</div>
                    </blockquote>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-amber-300">{children}</strong>
                  ),
                }}
              >
                {reportContent}
              </ReactMarkdown>
            </div>

            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setShowReport(false)}
                className="bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-400 hover:to-orange-500 text-white rounded-full px-8 transition-all hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]"
              >
                开始美好的一天
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900/90 backdrop-blur-xl border border-rose-500/20 shadow-2xl rounded-3xl p-0">
          <DialogTitle className="sr-only">历史晨报</DialogTitle>
          <DialogDescription className="sr-only">
            查看过去生成的 AI 晨报记录
          </DialogDescription>
          <button
            onClick={() => setShowHistory(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-200" />
          </button>

          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
                <Clock className="w-6 h-6 text-rose-400" />
                历史晨报
              </h2>
            </div>

            <div className="space-y-6">
              {historyReports.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  暂无历史报告记录
                </div>
              ) : (
                historyReports.map((report) => (
                  <Card key={report.id} className="p-6 bg-white/5 border-rose-500/10 hover:border-rose-500/30 transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-rose-400 font-mono">
                        {new Date(report.created_at).toLocaleString()}
                      </div>
                      <Badge variant="outline" className="text-[10px] opacity-50">
                        {report.model || report.model_used}
                      </Badge>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none line-clamp-6 overflow-hidden relative">
                      <ReactMarkdown>{report.content}</ReactMarkdown>
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                    </div>
                    <Button
                      variant="link"
                      className="text-rose-400 p-0 h-auto mt-2"
                      onClick={() => {
                        setReportContent(report.content);
                        setShowReport(true);
                        setShowHistory(false);
                        reportViewStartTimeRef.current = Date.now(); // 🆕 更新 Ref
                      }}
                    >
                      查看全文 →
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettings} onOpenChange={(open) => {
        setShowSettings(open);
        if (!open) {
          // GA 追踪：关闭设置
          SettingsEvents.close();
        }
      }}>
        <DialogContent className="max-w-lg bg-slate-900/80 backdrop-blur-xl border border-rose-500/20 shadow-2xl rounded-3xl p-0 max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">设置</DialogTitle>
          <DialogDescription className="sr-only">
            配置 AI 模型、管理数据和应用设置
          </DialogDescription>
          <button
            onClick={() => setShowSettings(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-200" />
          </button>

          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
                <Settings className="w-6 h-6 text-rose-400" />
                设置
              </h2>
            </div>

            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-400" />
                  AI 配置
                </h3>

                <div className="space-y-4 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-rose-500/20">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-gray-300">
                    <p className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">使用 OpenRouter 统一访问多种 AI 模型</span>
                    </p>
                    <p className="text-xs text-gray-400 ml-6">
                      前往{' '}
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
                      >
                        OpenRouter
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {' '}申请免费 API Key
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <Key className="w-4 h-4" />
                      API Key
                    </label>
                    <Input
                      type="password"
                      value={aiConfig.apiKey}
                      onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                      placeholder="sk-or-v1-..."
                      className="bg-slate-900/50 border-gray-700 text-gray-200 placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <Server className="w-4 h-4" />
                      Base URL
                    </label>
                    <Input
                      type="text"
                      value={aiConfig.baseUrl}
                      onChange={(e) => setAiConfig({ ...aiConfig, baseUrl: e.target.value })}
                      placeholder="https://openrouter.ai/api/v1"
                      className="bg-slate-900/50 border-gray-700 text-gray-200 placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <Cpu className="w-4 h-4" />
                      模型选择
                    </label>
                    <Select
                      value={aiConfig.model}
                      onValueChange={(value) => setAiConfig({ ...aiConfig, model: value })}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-gray-700 text-gray-200">
                        <SelectValue placeholder="选择模型" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-gray-700">
                        <SelectItem value="deepseek/deepseek-chat" className="text-gray-200">
                          DeepSeek Chat 🟢 推荐
                        </SelectItem>
                        <SelectItem value="google/gemini-flash-1.5" className="text-gray-200">
                          Gemini Flash 1.5 🔵 极速
                        </SelectItem>
                        <SelectItem value="openai/gpt-4o-mini" className="text-gray-200">
                          GPT-4o Mini
                        </SelectItem>
                        <SelectItem value="anthropic/claude-3.5-sonnet" className="text-gray-200">
                          Claude 3.5 Sonnet 🟡 旗舰
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      高性价比推荐 DeepSeek，追求速度选 Gemini Flash
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                      Feishu Webhook URL (可选)
                    </label>
                    <Input
                      type="text"
                      value={aiConfig.feishuWebhook || ''}
                      onChange={(e) => setAiConfig({ ...aiConfig, feishuWebhook: e.target.value })}
                      placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
                      className="bg-slate-900/50 border-gray-700 text-gray-200 placeholder:text-gray-500 text-xs"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      配置后，生成的晨报将自动推送到指定的飞书群组
                    </p>
                  </div>

                  <Button
                    onClick={handleSaveAIConfig}
                    className="w-full bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-400 hover:to-orange-500 text-white"
                  >
                    💾 保存配置
                  </Button>
                  
                  {aiConfig.apiKey && (
                    <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-lg">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span>API Key 已配置</span>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200 mb-3">数据管理</h3>
                
                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-rose-500/20">
                  <div className="flex items-start gap-3 mb-3">
                    <Download className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-200 mb-1">导出数据</h4>
                      <p className="text-sm text-gray-400 mb-3">
                        将所有日记导出为 JSON 文件，可用于数据备份。
                      </p>
                      <Button
                        onClick={handleExportData}
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white rounded-lg transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                        disabled={entries.length === 0}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        导出 JSON 文件
                      </Button>
                      {entries.length === 0 && (
                        <p className="text-xs text-gray-500 mt-2">暂无数据可导出</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-red-950/20 backdrop-blur-sm p-4 rounded-xl border border-red-500/30">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-300 mb-1">危险区域</h4>
                      <p className="text-sm text-gray-400 mb-3">
                        清空所有日记数据。此操作不可撤销，请谨慎操作！
                      </p>
                      <Button
                        onClick={handleClearAllData}
                        className="bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                        disabled={entries.length === 0}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        清空所有数据
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="pt-4 border-t border-white/10">
                <div className="text-center space-y-1">
                  <p className="text-sm text-gray-400">Mirror AI - 心镜</p>
                  <p className="text-xs text-gray-500">记录当下，照见内心</p>
                  <p className="text-xs text-gray-600 mt-2">
                    共 {entries.length} 条记录
                  </p>
                </div>
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md bg-slate-900/95 backdrop-blur-xl border border-red-500/30 shadow-2xl rounded-2xl p-0">
          <DialogTitle className="sr-only">确认删除</DialogTitle>
          <DialogDescription className="sr-only">
            确定要删除这条日记吗？此操作无法撤销
          </DialogDescription>
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-200 mb-2">
                  确认删除
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  确定要删除这条日记吗？此操作无法撤销。
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={cancelDelete}
                variant="outline"
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-white/5 hover:text-gray-200"
              >
                取消
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                确认删除
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMigration} onOpenChange={setShowMigration}>
        <DialogContent className="max-w-md bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 shadow-2xl rounded-2xl p-0">
          <DialogTitle className="sr-only">发现本地数据</DialogTitle>
          <DialogDescription className="sr-only">
            检测到您的浏览器中有本地日记数据，可以同步到云端
          </DialogDescription>
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Upload className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-200 mb-2">
                  发现本地数据
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  检测到您的浏览器中有本地日记数据。是否要将这些数据同步到云端？
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowMigration(false)}
                variant="outline"
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-white/5 hover:text-gray-200"
              >
                稍后再说
              </Button>
              <Button
                onClick={handleMigrateData}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                立即同步
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
