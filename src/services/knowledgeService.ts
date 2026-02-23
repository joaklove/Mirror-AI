import { supabase } from '@/integrations/supabase/client';
import { llmService, Message as LLMMessage } from './llmService';

// 知识条目类型定义
export interface KnowledgeItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  created_at: string;
  updated_at: string;
  importance: 'low' | 'medium' | 'high';
  source?: string;
  summary?: string;
}

// 知识分类类型定义
export interface KnowledgeCategory {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// 知识检索结果类型定义
export interface KnowledgeSearchResult {
  items: KnowledgeItem[];
  total: number;
  query: string;
  filters?: {
    categories?: string[];
    tags?: string[];
    importance?: 'low' | 'medium' | 'high';
  };
}

// 知识图谱节点类型定义
export interface KnowledgeGraphNode {
  id: string;
  title: string;
  category: string;
  importance: 'low' | 'medium' | 'high';
  connections: string[];
}

// 知识服务
export const knowledgeService = {
  // 创建知识条目
  async createKnowledgeItem(item: Omit<KnowledgeItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<KnowledgeItem> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 生成摘要
    let summary = '';
    try {
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: '你是一个知识管理助手，负责为用户的知识条目生成简洁的摘要。请基于提供的内容，生成一个不超过100字的摘要。'
        },
        {
          role: 'user',
          content: `为以下知识条目生成摘要：\n标题：${item.title}\n内容：${item.content}`
        }
      ];

      summary = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.6,
        max_tokens: 200
      });
    } catch (error) {
      console.error('Error generating summary:', error);
    }

    const { data, error } = await supabase
      .from('knowledge_items')
      .insert({
        user_id: user.id,
        ...item,
        summary: summary || undefined,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 获取知识条目
  async getKnowledgeItem(id: string): Promise<KnowledgeItem> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('knowledge_items')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  // 更新知识条目
  async updateKnowledgeItem(id: string, updates: Partial<KnowledgeItem>): Promise<KnowledgeItem> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 如果更新了内容，重新生成摘要
    if (updates.content) {
      try {
        const item = await this.getKnowledgeItem(id);
        const llmMessages: LLMMessage[] = [
          {
            role: 'system',
            content: '你是一个知识管理助手，负责为用户的知识条目生成简洁的摘要。请基于提供的内容，生成一个不超过100字的摘要。'
          },
          {
            role: 'user',
            content: `为以下知识条目生成摘要：\n标题：${updates.title || item.title}\n内容：${updates.content}`
          }
        ];

        updates.summary = await llmService.callModel(llmMessages, 'gpt-4o', {
          temperature: 0.6,
          max_tokens: 200
        });
      } catch (error) {
        console.error('Error generating summary:', error);
      }
    }

    const { data, error } = await supabase
      .from('knowledge_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 删除知识条目
  async deleteKnowledgeItem(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('knowledge_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // 获取知识条目列表
  async getKnowledgeItems(
    page: number = 1,
    limit: number = 20,
    filters?: {
      categories?: string[];
      tags?: string[];
      importance?: 'low' | 'medium' | 'high';
    }
  ): Promise<{ items: KnowledgeItem[]; total: number }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('knowledge_items')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // 应用过滤条件
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }
      if (filters.importance) {
        query = query.eq('importance', filters.importance);
      }
      // 标签过滤需要特殊处理，因为tags是数组类型
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => {
          query = query.contains('tags', [tag]);
        });
      }
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { items: data || [], total: count || 0 };
  },

  // 搜索知识条目
  async searchKnowledge(query: string, filters?: {
    categories?: string[];
    tags?: string[];
    importance?: 'low' | 'medium' | 'high';
  }, limit: number = 20): Promise<KnowledgeSearchResult> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 首先获取所有符合条件的知识条目
    let baseQuery = supabase
      .from('knowledge_items')
      .select('*')
      .eq('user_id', user.id);

    // 应用过滤条件
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        baseQuery = baseQuery.in('category', filters.categories);
      }
      if (filters.importance) {
        baseQuery = baseQuery.eq('importance', filters.importance);
      }
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => {
          baseQuery = baseQuery.contains('tags', [tag]);
        });
      }
    }

    const { data: allItems, error } = await baseQuery;
    if (error) throw error;

    // 使用LLM进行语义搜索
    const searchResults = await this.semanticSearch(allItems, query, limit);

    return {
      items: searchResults,
      total: searchResults.length,
      query,
      filters,
    };
  },

  // 语义搜索
  private async semanticSearch(items: KnowledgeItem[], query: string, limit: number): Promise<KnowledgeItem[]> {
    try {
      // 构建LLM消息
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是一个知识管理助手，负责根据用户的查询对知识条目进行相关性排序。请根据以下知识条目与查询的相关性，返回最相关的${limit}个条目，按相关性从高到低排序。

每个条目格式：
ID: <id>
标题: <title>
内容: <content>
标签: <tags>
分类: <category>

请返回格式：
<id1>
<id2>
...
<idn>`
        },
        {
          role: 'user',
          content: `查询: ${query}

知识条目：
${items.map(item => `ID: ${item.id}\n标题: ${item.title}\n内容: ${item.content}\n标签: ${item.tags.join(', ')}\n分类: ${item.category}\n`).join('\n')}`
        }
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.3,
        max_tokens: 500
      });

      // 解析结果
      const sortedIds = response.split('\n')
        .map(line => line.trim())
        .filter(line => line);

      // 根据排序后的ID返回知识条目
      const sortedItems = sortedIds
        .map(id => items.find(item => item.id === id))
        .filter((item): item is KnowledgeItem => item !== undefined)
        .slice(0, limit);

      return sortedItems;
    } catch (error) {
      console.error('Error in semantic search:', error);
      // 如果语义搜索失败，返回默认排序的结果
      return items.slice(0, limit);
    }
  },

  // 创建知识分类
  async createCategory(category: Omit<KnowledgeCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<KnowledgeCategory> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('knowledge_categories')
      .insert({
        user_id: user.id,
        ...category,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 获取知识分类列表
  async getCategories(): Promise<KnowledgeCategory[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('knowledge_categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // 更新知识分类
  async updateCategory(id: string, updates: Partial<KnowledgeCategory>): Promise<KnowledgeCategory> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('knowledge_categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 删除知识分类
  async deleteCategory(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 先将该分类下的知识条目移动到默认分类
    await supabase
      .from('knowledge_items')
      .update({ category: '默认' })
      .eq('category', id)
      .eq('user_id', user.id);

    const { error } = await supabase
      .from('knowledge_categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // 生成知识图谱
  async generateKnowledgeGraph(): Promise<KnowledgeGraphNode[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取所有知识条目
    const { data: items, error } = await supabase
      .from('knowledge_items')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    if (!items || items.length === 0) return [];

    // 使用LLM分析知识条目之间的关联
    try {
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是一个知识管理助手，负责分析知识条目之间的关联并生成知识图谱。请根据以下知识条目，识别它们之间的关联关系，并返回一个知识图谱结构。

每个节点格式：
{
  "id": "<id>",
  "title": "<title>",
  "category": "<category>",
  "importance": "<importance>",
  "connections": ["<connected_id1>", "<connected_id2>", ...]
}

请返回一个包含所有节点的JSON数组，只包含有意义的关联。`
        },
        {
          role: 'user',
          content: `知识条目：
${items.map(item => `ID: ${item.id}\n标题: ${item.title}\n内容: ${item.content}\n标签: ${item.tags.join(', ')}\n分类: ${item.category}\n重要性: ${item.importance}\n`).join('\n')}`
        }
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.6,
        max_tokens: 2000
      });

      // 解析结果
      const graphNodes = JSON.parse(response);
      return graphNodes;
    } catch (error) {
      console.error('Error generating knowledge graph:', error);
      // 如果生成知识图谱失败，返回基本节点
      return items.map(item => ({
        id: item.id,
        title: item.title,
        category: item.category,
        importance: item.importance,
        connections: []
      }));
    }
  },

  // 智能标签建议
  async suggestTags(content: string, existingTags: string[] = []): Promise<string[]> {
    try {
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: '你是一个知识管理助手，负责为用户的知识内容生成相关的标签建议。请基于提供的内容，生成5个最相关的标签，标签应该简洁明了，能够准确反映内容的主题。'
        },
        {
          role: 'user',
          content: `为以下内容生成标签建议：\n内容：${content}\n现有标签：${existingTags.join(', ')}\n请返回格式：\n标签1\n标签2\n标签3\n标签4\n标签5`
        }
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.7,
        max_tokens: 200
      });

      return response.split('\n')
        .map(tag => tag.trim())
        .filter(tag => tag && !existingTags.includes(tag));
    } catch (error) {
      console.error('Error suggesting tags:', error);
      return [];
    }
  },

  // 知识关联分析
  async analyzeKnowledgeConnections(): Promise<{
    mostConnectedItems: KnowledgeItem[];
    isolatedItems: KnowledgeItem[];
    categoryConnections: Record<string, number>;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取所有知识条目
    const { data: items, error } = await supabase
      .from('knowledge_items')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    if (!items || items.length === 0) {
      return {
        mostConnectedItems: [],
        isolatedItems: [],
        categoryConnections: {}
      };
    }

    // 使用LLM分析关联
    try {
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是一个知识管理助手，负责分析知识条目之间的关联。请根据以下知识条目，分析：
1. 最具关联性的前5个条目（与其他条目关联最多的）
2. 孤立的条目（与其他条目几乎没有关联的）
3. 不同分类之间的关联强度（一个分类的条目与另一个分类条目的关联数量）

请返回格式：
最具关联性的条目：
<id1>
<id2>
...
<id5>

孤立的条目：
<id1>
<id2>
...

分类关联：
<category1>:<category2>:<count>
<category1>:<category3>:<count>
...`
        },
        {
          role: 'user',
          content: `知识条目：
${items.map(item => `ID: ${item.id}\n标题: ${item.title}\n内容: ${item.content}\n标签: ${item.tags.join(', ')}\n分类: ${item.category}\n`).join('\n')}`
        }
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.6,
        max_tokens: 1000
      });

      // 解析结果
      const lines = response.split('\n');
      let section = '';
      const mostConnectedIds: string[] = [];
      const isolatedIds: string[] = [];
      const categoryConnections: Record<string, number> = {};

      for (const line of lines) {
        if (line.includes('最具关联性的条目：')) {
          section = 'mostConnected';
        } else if (line.includes('孤立的条目：')) {
          section = 'isolated';
        } else if (line.includes('分类关联：')) {
          section = 'categoryConnections';
        } else if (line.trim() && section) {
          if (section === 'mostConnected') {
            mostConnectedIds.push(line.trim());
          } else if (section === 'isolated') {
            isolatedIds.push(line.trim());
          } else if (section === 'categoryConnections') {
            const parts = line.split(':');
            if (parts.length === 3) {
              const key = `${parts[0]}:${parts[1]}`;
              categoryConnections[key] = parseInt(parts[2], 10) || 0;
            }
          }
        }
      }

      // 构建结果
      const mostConnectedItems = mostConnectedIds
        .map(id => items.find(item => item.id === id))
        .filter((item): item is KnowledgeItem => item !== undefined);

      const isolatedItems = isolatedIds
        .map(id => items.find(item => item.id === id))
        .filter((item): item is KnowledgeItem => item !== undefined);

      return {
        mostConnectedItems,
        isolatedItems,
        categoryConnections
      };
    } catch (error) {
      console.error('Error analyzing knowledge connections:', error);
      // 如果分析失败，返回默认结果
      return {
        mostConnectedItems: items.slice(0, 5),
        isolatedItems: [],
        categoryConnections: {}
      };
    }
  },
};
