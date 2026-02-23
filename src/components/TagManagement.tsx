import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Tag, 
  Plus, 
  X, 
  Edit3, 
  Check, 
  Trash2,
  Search,
  Hash
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { journalService } from '@/services/journalService';
import { InkBackground } from '@/components/InkBackground';
import { cn } from '@/lib/utils';

interface CustomTag {
  name: string;
  category: string;
  count: number;
}

const DEFAULT_TAG_CATEGORIES = [
  { id: 'psychology', name: '心理/情绪', tags: ['平静', '喜悦', '焦虑', '感恩', '悲伤', '期待', '失落', '愤怒', '恐惧', '孤独', '满足', '欣慰'] },
  { id: 'cognitive', name: '认知/思维', tags: ['顿悟', '困惑', '决策', '反思', '学习', '创意', '思考', '成长', '突破', '迷茫'] },
  { id: 'efficiency', name: '效率/行动', tags: ['完成', '计划', '拖延', '专注', '习惯', '突破', '行动', '坚持', '懈怠'] },
  { id: 'social', name: '社交/关系', tags: ['沟通', '陪伴', '冲突', '感谢', '独处', '连接', '合作', '支持', '疏远'] },
  { id: 'health', name: '健康/身体', tags: ['运动', '睡眠', '饮食', '休息', '能量', '舒适', '疲惫', '酸痛', '恢复'] },
  { id: 'finance', name: '财务/资源', tags: ['收入', '支出', '理财', '消费', '节约', '投资', '预算'] },
];

export function TagManagementPage() {
  const { user } = useAuth();
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('psychology');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    try {
      const entries = await journalService.getEntries();
      const tagCounts: Record<string, number> = {};
      
      entries.forEach(entry => {
        (entry.tags || []).forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const allTags: CustomTag[] = [];
      
      DEFAULT_TAG_CATEGORIES.forEach(category => {
        category.tags.forEach(tag => {
          if (tagCounts[tag]) {
            allTags.push({
              name: tag,
              category: category.name,
              count: tagCounts[tag]
            });
          }
        });
      });

      const savedCustomTags = localStorage.getItem('custom_tags');
      if (savedCustomTags) {
        const parsed = JSON.parse(savedCustomTags);
        parsed.forEach((tag: CustomTag) => {
          if (!allTags.find(t => t.name === tag.name)) {
            allTags.push(tag);
          }
        });
      }

      setCustomTags(allTags.sort((a, b) => b.count - a.count));
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomTag = () => {
    if (!newTagName.trim()) return;
    
    const exists = customTags.find(t => t.name === newTagName.trim());
    if (exists) {
      return;
    }

    const newTag: CustomTag = {
      name: newTagName.trim(),
      category: '自定义',
      count: 0
    };

    const updated = [...customTags, newTag];
    setCustomTags(updated);
    localStorage.setItem('custom_tags', JSON.stringify(updated.filter(t => t.category === '自定义')));
    setNewTagName('');
  };

  const handleDeleteTag = (tagName: string) => {
    const updated = customTags.filter(t => t.name !== tagName);
    setCustomTags(updated);
    localStorage.setItem('custom_tags', JSON.stringify(updated.filter(t => t.category === '自定义')));
  };

  const handleEditTag = (tag: CustomTag) => {
    setEditingTag(tag.name);
    setEditValue(tag.name);
  };

  const handleSaveEdit = (oldName: string) => {
    if (!editValue.trim() || editValue.trim() === oldName) {
      setEditingTag(null);
      return;
    }

    const exists = customTags.find(t => t.name === editValue.trim());
    if (exists) {
      setEditingTag(null);
      return;
    }

    const updated = customTags.map(t => 
      t.name === oldName ? { ...t, name: editValue.trim() } : t
    );
    setCustomTags(updated);
    localStorage.setItem('custom_tags', JSON.stringify(updated.filter(t => t.category === '自定义')));
    setEditingTag(null);
  };

  const filteredTags = searchQuery 
    ? customTags.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : customTags;

  const categoryTags = filteredTags.filter(t => t.category === DEFAULT_TAG_CATEGORIES.find(c => c.id === selectedCategory)?.name);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'hsl(var(--cinnabar))' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <InkBackground intensity="light" />
      
      <header 
        className="sticky top-0 z-10 dao-glass shadow-sm"
        style={{ borderBottom: '1px solid hsl(var(--light-ink))' }}
      >
        <div className="content-container py-4 px-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
            <h1 
              className="text-lg font-semibold"
              style={{ 
                fontFamily: 'var(--font-serif)',
                color: 'hsl(var(--ink-green))',
                marginBottom: '0.25rem',
              }}
            >
              标签管理
            </h1>
          </div>
          <p 
            className="text-xs"
            style={{ color: 'hsl(var(--mountain-green))' }}
          >
            管理你的自定义标签
          </p>
        </div>
      </header>

      <main className="content-container py-8 pb-32 relative z-10 space-y-6">
        <Card className="dao-card animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--ink-green))' }}>
              <Plus className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              添加自定义标签
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="输入新标签名称"
                className="dao-input flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
              />
              <Button onClick={handleAddCustomTag} className="btn-primary">
                添加
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="dao-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(var(--ink-green))' }}>
              <Search className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
              搜索标签
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索标签..."
              className="dao-input"
            />
          </CardContent>
        </Card>

        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {DEFAULT_TAG_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all',
                  selectedCategory === cat.id
                    ? 'btn-primary'
                    : 'dao-card hover:shadow-soft'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryTags.length === 0 ? (
              <div className="text-center py-8 w-full" style={{ color: 'hsl(var(--smoke-gray))' }}>
                <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>暂无标签</p>
              </div>
            ) : (
              categoryTags.map(tag => (
                <div
                  key={tag.name}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full dao-card group"
                >
                  {editingTag === tag.name ? (
                    <>
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-6 w-24 text-sm px-1"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(tag.name)}
                        onBlur={() => handleSaveEdit(tag.name)}
                      />
                      <button onClick={() => handleSaveEdit(tag.name)}>
                        <Check className="w-4 h-4" style={{ color: 'hsl(var(--cinnabar))' }} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span 
                        className="text-sm"
                        style={{ color: 'hsl(var(--ink-green))' }}
                      >
                        {tag.name}
                      </span>
                      {tag.count > 0 && (
                        <Badge 
                          variant="outline" 
                          className="ml-1 text-xs"
                          style={{ 
                            background: 'hsl(var(--light-ink))',
                            color: 'hsl(var(--mountain-green))',
                          }}
                        >
                          {tag.count}
                        </Badge>
                      )}
                      {tag.category === '自定义' && (
                        <div className="flex gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditTag(tag)}>
                            <Edit3 className="w-3 h-3" style={{ color: 'hsl(var(--mountain-green))' }} />
                          </button>
                          <button onClick={() => handleDeleteTag(tag.name)}>
                            <Trash2 className="w-3 h-3" style={{ color: 'hsl(350,60%,50%)' }} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <Card className="dao-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle style={{ color: 'hsl(var(--ink-green))' }}>
              标签统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg" style={{ background: 'hsl(var(--paper-yellow))' }}>
                <div className="text-2xl font-bold" style={{ color: 'hsl(var(--ink-green))' }}>
                  {customTags.length}
                </div>
                <div className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>
                  总标签数
                </div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ background: 'hsl(var(--paper-yellow))' }}>
                <div className="text-2xl font-bold" style={{ color: 'hsl(var(--ink-green))' }}>
                  {customTags.filter(t => t.count > 0).length}
                </div>
                <div className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>
                  已使用
                </div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ background: 'hsl(var(--paper-yellow))' }}>
                <div className="text-2xl font-bold" style={{ color: 'hsl(var(--ink-green))' }}>
                  {customTags.reduce((sum, t) => sum + t.count, 0)}
                </div>
                <div className="text-sm" style={{ color: 'hsl(var(--smoke-gray))' }}>
                  使用次数
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
