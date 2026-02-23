export interface VoiceRecognitionEvent {
  results: VoiceRecognitionResult[];
  resultIndex: number;
}

export interface VoiceRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): VoiceRecognitionAlternative;
  [index: number]: VoiceRecognitionAlternative;
}

export interface VoiceRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface VoiceRecognitionErrorEvent {
  error: string;
  message: string;
}

export interface SpeechRecognitionController {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: VoiceRecognitionEvent) => void) | null;
  onerror: ((event: VoiceRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionController;
    webkitSpeechRecognition: new () => SpeechRecognitionController;
  }
}

export interface SpeechToTextResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface VoiceServiceState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

export const voiceService = {
  isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  },

  createRecognition(): SpeechRecognitionController | null {
    if (!this.isSupported()) return null;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return new SpeechRecognition();
  },

  async startListening(
    onTranscript: (result: SpeechToTextResult) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): Promise<() => void> {
    const recognition = this.createRecognition();
    
    if (!recognition) {
      onError('语音识别不可用，请使用 Chrome 或 Edge 浏览器');
      return () => {};
    }

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    recognition.onresult = (event: VoiceRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          onTranscript({
            transcript: finalTranscript,
            confidence: event.results[i][0].confidence,
            isFinal: true,
          });
        } else {
          interimTranscript += transcript;
          onTranscript({
            transcript: interimTranscript,
            confidence: event.results[i][0].confidence,
            isFinal: false,
          });
        }
      }
    };

    recognition.onerror = (event: VoiceRecognitionErrorEvent) => {
      const errorMessages: Record<string, string> = {
        'no-speech': '未检测到语音',
        'audio-capture': '无法访问麦克风',
        'not-allowed': '麦克风权限被拒绝',
        'network': '网络错误',
        'aborted': '语音识别已取消',
        'language-not-supported': '不支持该语言',
      };
      onError(errorMessages[event.error] || '语音识别出错');
    };

    recognition.onend = () => {
      onEnd();
    };

    recognition.start();

    return () => {
      recognition.stop();
    };
  },

  async transcriptFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const recognition = this.createRecognition();
      
      if (!recognition) {
        reject(new Error('语音识别不可用'));
        return;
      }

      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'zh-CN';

      let finalTranscript = '';

      recognition.onresult = (event: VoiceRecognitionEvent) => {
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognition.onerror = (event: VoiceRecognitionErrorEvent) => {
        reject(new Error(event.error));
      };

      recognition.onend = () => {
        resolve(finalTranscript);
      };

      const audioContext = new AudioContext();
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const wavBlob = this.audioBufferToWav(audioBuffer);
          const blobUrl = URL.createObjectURL(wavBlob);
          const audio = new Audio(blobUrl);
          audio.play();
          
          recognition.start();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.readAsArrayBuffer(file);
    });
  },

  audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;
    
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);
    
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    const channels = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }
    
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  },
};
