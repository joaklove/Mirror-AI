import { llmService } from '../llmService';
import { imageService, ImageAnalysisResult } from './imageService';
import { speechService, EnhancedSpeechToTextResult } from './speechService';
import { videoService, VideoAnalysisResult } from './videoService';

// 多模态数据融合分析结果接口
export interface MultimodalAnalysisResult {
  description: string;
  insights: string[];
  emotions: string[];
  topics: string[];
  accuracy: number;
  confidence: number;
  recommendations: string[];
}

// 多模态数据接口
export interface MultimodalData {
  text?: string;
  images?: Array<{ url: string; analysis?: ImageAnalysisResult }>;
  audio?: Array<{ url: string; analysis?: EnhancedSpeechToTextResult }>;
  video?: Array<{ url: string; analysis?: VideoAnalysisResult }>;
}

// 多模态服务
export const multimodalService = {
  // 融合分析多模态数据
  async analyzeMultimodalData(
    data: MultimodalData,
    prompt: string = '基于提供的多模态数据，提供全面的分析和洞察'
  ): Promise<MultimodalAnalysisResult> {
    try {
      // 1. 分析各个模态的数据
      const analyzedData = await this.analyzeIndividualModalities(data);

      // 2. 构建融合分析提示
      const fusionPrompt = this.buildFusionPrompt(analyzedData, prompt);

      // 3. 使用LLM进行多模态融合分析
      const messages = [
        {
          role: 'system',
          content: '你是一个多模态数据融合分析专家，能够整合来自不同模态的数据，提供全面、连贯的分析和洞察。'
        },
        {
          role: 'user',
          content: fusionPrompt
        }
      ];

      const response = await llmService.callModel(messages, 'gpt-4o');

      // 4. 解析融合分析结果
      return this.parseMultimodalAnalysisResponse(response);
    } catch (error) {
      console.error('Error analyzing multimodal data:', error);
      throw error;
    }
  },

  // 分析各个模态的数据
  async analyzeIndividualModalities(
    data: MultimodalData
  ): Promise<MultimodalData> {
    const analyzedData: MultimodalData = { ...data };

    // 分析图像
    if (data.images && data.images.length > 0) {
      analyzedData.images = await Promise.all(
        data.images.map(async (image) => {
          if (!image.analysis) {
            const analysis = await imageService.analyzeImage(image.url);
            return { ...image, analysis };
          }
          return image;
        })
      );
    }

    // 分析音频
    if (data.audio && data.audio.length > 0) {
      analyzedData.audio = await Promise.all(
        data.audio.map(async (audio) => {
          if (!audio.analysis) {
            // 注意：这里需要实际的音频文件，暂时使用模拟数据
            const analysis: EnhancedSpeechToTextResult = {
              transcript: '这是一段模拟的音频转录',
              confidence: 0.95,
              isFinal: true,
              language: 'zh-CN',
              timestamp: Date.now()
            };
            return { ...audio, analysis };
          }
          return audio;
        })
      );
    }

    // 分析视频
    if (data.video && data.video.length > 0) {
      analyzedData.video = await Promise.all(
        data.video.map(async (video) => {
          if (!video.analysis) {
            const analysis = await videoService.analyzeVideo(video.url);
            return { ...video, analysis };
          }
          return video;
        })
      );
    }

    return analyzedData;
  },

  // 构建融合分析提示
  buildFusionPrompt(
    data: MultimodalData,
    userPrompt: string
  ): string {
    let prompt = `${userPrompt}\n\n`;

    // 添加文本数据
    if (data.text) {
      prompt += `文本数据：\n${data.text}\n\n`;
    }

    // 添加图像分析结果
    if (data.images && data.images.length > 0) {
      prompt += `图像分析结果：\n`;
      data.images.forEach((image, index) => {
        if (image.analysis) {
          prompt += `图像 ${index + 1}：\n`;
          prompt += `描述：${image.analysis.description}\n`;
          prompt += `物体：${image.analysis.objects.join(', ')}\n`;
          prompt += `情感：${image.analysis.emotions.join(', ')}\n`;
          prompt += `标签：${image.analysis.tags.join(', ')}\n\n`;
        }
      });
    }

    // 添加音频分析结果
    if (data.audio && data.audio.length > 0) {
      prompt += `音频分析结果：\n`;
      data.audio.forEach((audio, index) => {
        if (audio.analysis) {
          prompt += `音频 ${index + 1}：\n`;
          prompt += `转录：${audio.analysis.transcript}\n`;
          prompt += `置信度：${audio.analysis.confidence}\n\n`;
        }
      });
    }

    // 添加视频分析结果
    if (data.video && data.video.length > 0) {
      prompt += `视频分析结果：\n`;
      data.video.forEach((video, index) => {
        if (video.analysis) {
          prompt += `视频 ${index + 1}：\n`;
          prompt += `描述：${video.analysis.description}\n`;
          prompt += `场景数：${video.analysis.scenes.length}\n`;
          prompt += `物体：${video.analysis.objects.join(', ')}\n`;
          prompt += `情感：${video.analysis.emotions.join(', ')}\n\n`;
        }
      });
    }

    prompt += `请基于以上多模态数据，提供：\n`;
    prompt += `1. 全面的综合描述\n`;
    prompt += `2. 关键洞察和发现\n`;
    prompt += `3. 整体情感分析\n`;
    prompt += `4. 主要话题和主题\n`;
    prompt += `5. 基于分析的建议`;

    return prompt;
  },

  // 解析多模态分析响应
  parseMultimodalAnalysisResponse(response: string): MultimodalAnalysisResult {
    // 简单的解析逻辑，实际应用中可以使用更复杂的NLP技术
    return {
      description: response,
      insights: this.extractInsights(response),
      emotions: this.extractEmotions(response),
      topics: this.extractTopics(response),
      accuracy: 0.95, // 默认准确率
      confidence: 0.95, // 默认置信度
      recommendations: this.extractRecommendations(response)
    };
  },

  // 从响应中提取洞察
  extractInsights(text: string): string[] {
    // 简单的提取逻辑
    const lines = text.split('\n');
    const insights: string[] = [];

    let inInsightsSection = false;
    for (const line of lines) {
      if (line.includes('洞察') || line.includes('发现')) {
        inInsightsSection = true;
        continue;
      }

      if (inInsightsSection && line.trim() && !line.includes('情感') && !line.includes('话题') && !line.includes('建议')) {
        insights.push(line.trim());
      }

      if (line.includes('情感') || line.includes('话题') || line.includes('建议')) {
        inInsightsSection = false;
      }
    }

    return insights.length > 0 ? insights : [text.substring(0, 200) + '...'];
  },

  // 从响应中提取情感
  extractEmotions(text: string): string[] {
    const emotions = [
      'happy', 'sad', 'angry', 'fearful', 'surprised',
      'calm', 'excited', 'neutral', 'peaceful', 'joyful',
      'anxious', 'depressed', 'content', 'grateful', 'hopeful'
    ];
    return emotions.filter(emotion => text.toLowerCase().includes(emotion));
  },

  // 从响应中提取话题
  extractTopics(text: string): string[] {
    // 简单的提取逻辑
    const topics = [
      'health', 'relationships', 'work', 'education', 'finance',
      'technology', 'nature', 'art', 'sports', 'travel',
      'food', 'music', 'movies', 'books', 'politics'
    ];
    return topics.filter(topic => text.toLowerCase().includes(topic));
  },

  // 从响应中提取建议
  extractRecommendations(text: string): string[] {
    // 简单的提取逻辑
    const lines = text.split('\n');
    const recommendations: string[] = [];

    let inRecommendationsSection = false;
    for (const line of lines) {
      if (line.includes('建议') || line.includes('推荐')) {
        inRecommendationsSection = true;
        continue;
      }

      if (inRecommendationsSection && line.trim()) {
        recommendations.push(line.trim());
      }
    }

    return recommendations;
  },

  // 批量分析多模态数据
  async batchAnalyzeMultimodalData(
    dataArray: MultimodalData[],
    prompt: string = '基于提供的多模态数据，提供全面的分析和洞察'
  ): Promise<MultimodalAnalysisResult[]> {
    const results = await Promise.all(
      dataArray.map(data => 
        this.analyzeMultimodalData(data, prompt)
          .catch(err => {
            console.error('Batch multimodal analyze error:', err);
            return {
              description: '分析失败',
              insights: [],
              emotions: [],
              topics: [],
              accuracy: 0,
              confidence: 0,
              recommendations: []
            };
          })
      )
    );
    return results;
  },

  // 评估多模态分析准确率
  async evaluateAccuracy(
    data: MultimodalData,
    groundTruth: MultimodalAnalysisResult
  ): Promise<number> {
    try {
      const result = await this.analyzeMultimodalData(data);
      
      // 计算准确率
      let score = 0;
      let total = 0;
      
      // 评估情感识别
      if (groundTruth.emotions.length > 0) {
        const correctEmotions = result.emotions.filter(emotion => 
          groundTruth.emotions.includes(emotion)
        );
        score += correctEmotions.length / groundTruth.emotions.length;
        total += 1;
      }
      
      // 评估话题识别
      if (groundTruth.topics.length > 0) {
        const correctTopics = result.topics.filter(topic => 
          groundTruth.topics.includes(topic)
        );
        score += correctTopics.length / groundTruth.topics.length;
        total += 1;
      }
      
      // 评估建议相关性
      if (groundTruth.recommendations.length > 0) {
        // 简单的相关性评估
        score += Math.min(result.recommendations.length, groundTruth.recommendations.length) / 
                Math.max(result.recommendations.length, groundTruth.recommendations.length);
        total += 1;
      }
      
      return total > 0 ? score / total : 0;
    } catch (error) {
      console.error('Error evaluating multimodal accuracy:', error);
      return 0;
    }
  }
};
