import { llmService } from '../llmService';

// 图像分析结果接口
export interface ImageAnalysisResult {
  description: string;
  objects: string[];
  emotions: string[];
  colors: string[];
  accuracy: number;
  tags: string[];
}

// 图像识别服务
export const imageService = {
  // 分析图像
  async analyzeImage(
    imageUrl: string,
    prompt: string = '详细描述这张图片，包括内容、情感、颜色和主要元素'
  ): Promise<ImageAnalysisResult> {
    try {
      // 使用GPT-4o或其他支持图像分析的模型
      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ];

      // 调用LLM服务进行图像分析
      const response = await llmService.callModel(
        messages as any,
        'gpt-4o'
      );

      // 解析响应
      return this.parseImageAnalysisResponse(response);
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  },

  // 从本地文件分析图像
  async analyzeImageFromFile(
    file: File,
    prompt: string = '详细描述这张图片，包括内容、情感、颜色和主要元素'
  ): Promise<ImageAnalysisResult> {
    try {
      // 将文件转换为base64
      const base64Image = await this.fileToBase64(file);
      const imageUrl = `data:${file.type};base64,${base64Image}`;

      return this.analyzeImage(imageUrl, prompt);
    } catch (error) {
      console.error('Error analyzing image from file:', error);
      throw error;
    }
  },

  // 文件转base64
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  },

  // 解析图像分析响应
  parseImageAnalysisResponse(response: string): ImageAnalysisResult {
    // 这里可以根据实际的LLM响应格式进行更复杂的解析
    // 现在使用一个简单的解析方式
    return {
      description: response,
      objects: this.extractObjects(response),
      emotions: this.extractEmotions(response),
      colors: this.extractColors(response),
      accuracy: 0.95, // 默认准确率
      tags: this.extractTags(response)
    };
  },

  // 从响应中提取物体
  extractObjects(text: string): string[] {
    // 简单的提取逻辑，实际应用中可以使用更复杂的NLP技术
    const objects = [
      'person', 'car', 'building', 'tree', 'animal', 'food',
      'furniture', 'electronic', 'book', 'flower'
    ];
    return objects.filter(obj => text.toLowerCase().includes(obj));
  },

  // 从响应中提取情感
  extractEmotions(text: string): string[] {
    const emotions = [
      'happy', 'sad', 'angry', 'fearful', 'surprised',
      'calm', 'excited', 'neutral', 'peaceful'
    ];
    return emotions.filter(emotion => text.toLowerCase().includes(emotion));
  },

  // 从响应中提取颜色
  extractColors(text: string): string[] {
    const colors = [
      'red', 'blue', 'green', 'yellow', 'orange',
      'purple', 'pink', 'black', 'white', 'gray',
      'brown', 'gold', 'silver'
    ];
    return colors.filter(color => text.toLowerCase().includes(color));
  },

  // 从响应中提取标签
  extractTags(text: string): string[] {
    // 简单的标签提取逻辑
    const tags = [];
    
    // 添加物体标签
    tags.push(...this.extractObjects(text));
    
    // 添加情感标签
    tags.push(...this.extractEmotions(text));
    
    // 添加场景标签
    const scenes = ['indoor', 'outdoor', 'city', 'nature', 'beach', 'mountain'];
    tags.push(...scenes.filter(scene => text.toLowerCase().includes(scene)));
    
    return [...new Set(tags)];
  },

  // 批量分析图像
  async batchAnalyzeImages(
    imageUrls: string[],
    prompt: string = '详细描述这张图片'
  ): Promise<ImageAnalysisResult[]> {
    const results = await Promise.all(
      imageUrls.map(url => 
        this.analyzeImage(url, prompt)
          .catch(err => {
            console.error('Batch analyze error:', err);
            return {
              description: '分析失败',
              objects: [],
              emotions: [],
              colors: [],
              accuracy: 0,
              tags: []
            };
          })
      )
    );
    return results;
  },

  // 评估图像分析准确率
  async evaluateAccuracy(
    imageUrl: string,
    groundTruth: ImageAnalysisResult
  ): Promise<number> {
    try {
      const result = await this.analyzeImage(imageUrl);
      
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
      
      // 评估颜色识别
      if (groundTruth.colors.length > 0) {
        const correctColors = result.colors.filter(color => 
          groundTruth.colors.includes(color)
        );
        score += correctColors.length / groundTruth.colors.length;
        total += 1;
      }
      
      return total > 0 ? score / total : 0;
    } catch (error) {
      console.error('Error evaluating accuracy:', error);
      return 0;
    }
  }
};
