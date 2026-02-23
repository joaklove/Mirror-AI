import { voiceService as baseVoiceService } from '../voiceService';
import { llmService } from '../llmService';

// 语音合成选项接口
export interface SpeechSynthesisOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

// 语音识别结果接口
export interface EnhancedSpeechToTextResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  language: string;
  timestamp: number;
}

// 语音合成服务
export const speechService = {
  // 语音识别相关方法
  ...baseVoiceService,

  // 增强的语音识别
  async enhancedSpeechToText(
    audioFile: File,
    language: string = 'zh-CN'
  ): Promise<EnhancedSpeechToTextResult> {
    try {
      // 首先使用基础语音识别
      const transcript = await baseVoiceService.transcriptFromFile(audioFile);

      // 使用LLM进行语音识别结果的增强和校正
      const messages = [
        {
          role: 'system',
          content: '你是一个语音识别结果校正专家，负责校正和增强语音识别的结果。'
        },
        {
          role: 'user',
          content: `请校正以下语音识别结果，确保语法正确，语义通顺，并提供最终的校正结果：\n${transcript}`
        }
      ];

      const enhancedTranscript = await llmService.callModel(messages, 'gpt-4o');

      return {
        transcript: enhancedTranscript,
        confidence: 0.98, // 增强后的置信度
        isFinal: true,
        language,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error in enhanced speech to text:', error);
      throw error;
    }
  },

  // 语音合成
  async textToSpeech(
    text: string,
    options: SpeechSynthesisOptions = {}
  ): Promise<Blob> {
    try {
      // 检查浏览器是否支持语音合成
      if (!('speechSynthesis' in window)) {
        throw new Error('浏览器不支持语音合成');
      }

      // 使用Web Speech API进行语音合成
      return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // 设置选项
        if (options.voice) {
          const voices = window.speechSynthesis.getVoices();
          const voice = voices.find(v => v.name === options.voice);
          if (voice) {
            utterance.voice = voice;
          }
        }
        
        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;

        // 创建一个MediaRecorder来捕获合成的语音
        const audioContext = new AudioContext();
        const destination = audioContext.createMediaStreamDestination();
        const recorder = new MediaRecorder(destination.stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          resolve(blob);
        };

        recorder.onerror = (error) => {
          reject(error);
        };

        recorder.start();
        window.speechSynthesis.speak(utterance);

        // 语音合成结束后停止 recorder
        utterance.onend = () => {
          setTimeout(() => {
            recorder.stop();
          }, 100);
        };

        utterance.onerror = (error) => {
          reject(error);
        };
      });
    } catch (error) {
      console.error('Error in text to speech:', error);
      throw error;
    }
  },

  // 直接播放文本
  async speakText(
    text: string,
    options: SpeechSynthesisOptions = {}
  ): Promise<void> {
    try {
      // 检查浏览器是否支持语音合成
      if (!('speechSynthesis' in window)) {
        throw new Error('浏览器不支持语音合成');
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // 设置选项
      if (options.voice) {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.name === options.voice);
        if (voice) {
          utterance.voice = voice;
        }
      }
      
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      return new Promise((resolve, reject) => {
        utterance.onend = () => resolve();
        utterance.onerror = (error) => reject(error);
        window.speechSynthesis.speak(utterance);
      });
    } catch (error) {
      console.error('Error speaking text:', error);
      throw error;
    }
  },

  // 获取可用的语音列表
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!('speechSynthesis' in window)) {
      return [];
    }
    return window.speechSynthesis.getVoices();
  },

  // 批量语音识别
  async batchSpeechToText(
    audioFiles: File[]
  ): Promise<EnhancedSpeechToTextResult[]> {
    const results = await Promise.all(
      audioFiles.map(file => 
        this.enhancedSpeechToText(file)
          .catch(err => {
            console.error('Batch speech to text error:', err);
            return {
              transcript: '',
              confidence: 0,
              isFinal: true,
              language: 'zh-CN',
              timestamp: Date.now()
            };
          })
      )
    );
    return results;
  },

  // 评估语音识别准确率
  async evaluateSpeechRecognitionAccuracy(
    audioFile: File,
    groundTruth: string
  ): Promise<number> {
    try {
      const result = await this.enhancedSpeechToText(audioFile);
      
      // 计算文本相似度作为准确率
      const accuracy = this.calculateTextSimilarity(result.transcript, groundTruth);
      return accuracy;
    } catch (error) {
      console.error('Error evaluating speech recognition accuracy:', error);
      return 0;
    }
  },

  // 计算文本相似度
  calculateTextSimilarity(text1: string, text2: string): number {
    // 简单的编辑距离算法
    const levenshteinDistance = (s1: string, s2: string): number => {
      const matrix = [];
      for (let i = 0; i <= s2.length; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= s1.length; j++) {
        matrix[0][j] = j;
      }
      for (let i = 1; i <= s2.length; i++) {
        for (let j = 1; j <= s1.length; j++) {
          if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[s2.length][s1.length];
    };

    const distance = levenshteinDistance(text1, text2);
    const maxLength = Math.max(text1.length, text2.length);
    return maxLength > 0 ? 1 - (distance / maxLength) : 1;
  }
};
