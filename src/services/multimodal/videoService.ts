import { llmService } from '../llmService';
import { imageService } from './imageService';

// 视频分析结果接口
export interface VideoAnalysisResult {
  description: string;
  scenes: VideoScene[];
  objects: string[];
  actions: string[];
  emotions: string[];
  accuracy: number;
  tags: string[];
}

// 视频场景接口
export interface VideoScene {
  startTime: number; // 秒
  endTime: number; // 秒
  description: string;
  objects: string[];
  actions: string[];
  emotions: string[];
  keyframeUrl: string;
}

// 视频分析服务
export const videoService = {
  // 分析视频
  async analyzeVideo(
    videoUrl: string,
    options: {
      maxFrames?: number; // 最大分析帧数
      frameInterval?: number; // 帧间隔（秒）
      prompt?: string; // 分析提示
    } = {}
  ): Promise<VideoAnalysisResult> {
    try {
      const {
        maxFrames = 10,
        frameInterval = 1,
        prompt = '详细分析这个视频，包括内容、场景变化、动作、情感和主要元素'
      } = options;

      // 1. 提取视频帧
      const frames = await this.extractFrames(videoUrl, maxFrames, frameInterval);

      // 2. 分析每一帧
      const frameAnalyses = await Promise.all(
        frames.map(async (frame, index) => {
          const analysis = await imageService.analyzeImage(
            frame.url,
            '详细描述这一帧的内容，包括物体、动作、情感和场景'
          );
          return {
            ...analysis,
            timestamp: index * frameInterval
          };
        })
      );

      // 3. 使用LLM进行视频整体分析
      const frameSummaries = frameAnalyses.map((frame, index) => {
        return `第${index * frameInterval}秒: ${frame.description}`;
      }).join('\n');

      const messages = [
        {
          role: 'system',
          content: '你是一个视频分析专家，负责分析视频内容并提供详细的分析报告。'
        },
        {
          role: 'user',
          content: `${prompt}\n\n视频帧分析结果：\n${frameSummaries}`
        }
      ];

      const videoAnalysis = await llmService.callModel(messages, 'gpt-4o');

      // 4. 构建最终分析结果
      return this.parseVideoAnalysisResponse(videoAnalysis, frameAnalyses);
    } catch (error) {
      console.error('Error analyzing video:', error);
      throw error;
    }
  },

  // 从本地文件分析视频
  async analyzeVideoFromFile(
    videoFile: File,
    options: {
      maxFrames?: number;
      frameInterval?: number;
      prompt?: string;
    } = {}
  ): Promise<VideoAnalysisResult> {
    try {
      // 将视频文件转换为URL
      const videoUrl = URL.createObjectURL(videoFile);
      
      try {
        const result = await this.analyzeVideo(videoUrl, options);
        return result;
      } finally {
        // 释放URL
        URL.revokeObjectURL(videoUrl);
      }
    } catch (error) {
      console.error('Error analyzing video from file:', error);
      throw error;
    }
  },

  // 提取视频帧
  async extractFrames(
    videoUrl: string,
    maxFrames: number,
    frameInterval: number
  ): Promise<Array<{ url: string; timestamp: number }>> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建canvas上下文'));
          return;
        }

        const duration = video.duration;
        const frames: Array<{ url: string; timestamp: number }> = [];
        let currentTime = 0;

        const extractFrame = () => {
          if (currentTime >= duration || frames.length >= maxFrames) {
            resolve(frames);
            return;
          }

          video.currentTime = currentTime;
        };

        video.onseeked = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const frameUrl = canvas.toDataURL('image/jpeg');
          frames.push({ url: frameUrl, timestamp: currentTime });

          currentTime += frameInterval;
          extractFrame();
        };

        video.onerror = (error) => {
          reject(error);
        };

        extractFrame();
      };

      video.onerror = (error) => {
        reject(error);
      };
    });
  },

  // 解析视频分析响应
  parseVideoAnalysisResponse(
    response: string,
    frameAnalyses: Array<{
      description: string;
      objects: string[];
      emotions: string[];
      colors: string[];
      accuracy: number;
      tags: string[];
      timestamp: number;
    }>
  ): VideoAnalysisResult {
    // 合并所有帧的物体、动作和情感
    const allObjects = new Set<string>();
    const allActions = new Set<string>();
    const allEmotions = new Set<string>();
    const allTags = new Set<string>();

    frameAnalyses.forEach(frame => {
      frame.objects.forEach(obj => allObjects.add(obj));
      frame.emotions.forEach(emotion => allEmotions.add(emotion));
      frame.tags.forEach(tag => allTags.add(tag));
    });

    // 简单的场景分割
    const scenes: VideoScene[] = frameAnalyses.map((frame, index) => {
      return {
        startTime: frame.timestamp,
        endTime: frame.timestamp + 1, // 假设每帧持续1秒
        description: frame.description,
        objects: frame.objects,
        actions: [], // 这里可以从帧描述中提取动作
        emotions: frame.emotions,
        keyframeUrl: '' // 这里应该是帧的URL，实际应用中需要传递
      };
    });

    return {
      description: response,
      scenes,
      objects: Array.from(allObjects),
      actions: Array.from(allActions),
      emotions: Array.from(allEmotions),
      accuracy: 0.95, // 默认准确率
      tags: Array.from(allTags)
    };
  },

  // 批量分析视频
  async batchAnalyzeVideos(
    videoUrls: string[],
    options: {
      maxFrames?: number;
      frameInterval?: number;
      prompt?: string;
    } = {}
  ): Promise<VideoAnalysisResult[]> {
    const results = await Promise.all(
      videoUrls.map(url => 
        this.analyzeVideo(url, options)
          .catch(err => {
            console.error('Batch video analyze error:', err);
            return {
              description: '分析失败',
              scenes: [],
              objects: [],
              actions: [],
              emotions: [],
              accuracy: 0,
              tags: []
            };
          })
      )
    );
    return results;
  },

  // 评估视频分析准确率
  async evaluateAccuracy(
    videoUrl: string,
    groundTruth: VideoAnalysisResult
  ): Promise<number> {
    try {
      const result = await this.analyzeVideo(videoUrl);
      
      // 计算准确率
      let score = 0;
      let total = 0;
      
      // 评估物体识别
      if (groundTruth.objects.length > 0) {
        const correctObjects = result.objects.filter(obj => 
          groundTruth.objects.includes(obj)
        );
        score += correctObjects.length / groundTruth.objects.length;
        total += 1;
      }
      
      // 评估情感识别
      if (groundTruth.emotions.length > 0) {
        const correctEmotions = result.emotions.filter(emotion => 
          groundTruth.emotions.includes(emotion)
        );
        score += correctEmotions.length / groundTruth.emotions.length;
        total += 1;
      }
      
      // 评估场景识别
      if (groundTruth.scenes.length > 0) {
        // 简单的场景数量匹配
        score += Math.min(result.scenes.length, groundTruth.scenes.length) / 
                Math.max(result.scenes.length, groundTruth.scenes.length);
        total += 1;
      }
      
      return total > 0 ? score / total : 0;
    } catch (error) {
      console.error('Error evaluating video accuracy:', error);
      return 0;
    }
  }
};
