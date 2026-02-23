import React, { useState, useEffect } from 'react';
import { speechService, EnhancedSpeechToTextResult, SpeechSynthesisOptions } from '../../services/multimodal/speechService';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const SpeechAnalyzer: React.FC = () => {
  // 语音识别状态
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<EnhancedSpeechToTextResult | null>(null);
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  // 语音合成状态
  const [textToSpeak, setTextToSpeak] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingError, setSpeakingError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [voiceOptions, setVoiceOptions] = useState<SpeechSynthesisVoice[]>([]);
  const [speechOptions, setSpeechOptions] = useState<SpeechSynthesisOptions>({
    rate: 1,
    pitch: 1,
    volume: 1
  });

  // 加载可用语音
  useEffect(() => {
    const voices = speechService.getAvailableVoices();
    setVoiceOptions(voices);
    if (voices.length > 0) {
      setSelectedVoice(voices[0].name);
    }
  }, []);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setRecognitionResult(null);
      setRecognitionError(null);
    }
  };

  const handleSpeechToText = async () => {
    if (!audioFile) {
      setRecognitionError('请上传音频文件');
      return;
    }

    setIsRecognizing(true);
    setRecognitionError(null);

    try {
      const result = await speechService.enhancedSpeechToText(audioFile);
      setRecognitionResult(result);
    } catch (err) {
      setRecognitionError(err instanceof Error ? err.message : '识别失败');
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleLiveRecognition = async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setLiveTranscript('');
    setRecognitionError(null);

    try {
      const stopListening = await speechService.startListening(
        (result) => {
          if (result.isFinal) {
            setRecognitionResult({
              transcript: result.transcript,
              confidence: result.confidence,
              isFinal: true,
              language: 'zh-CN',
              timestamp: Date.now()
            });
          } else {
            setLiveTranscript(result.transcript);
          }
        },
        (error) => {
          setRecognitionError(error);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      // 存储停止监听的函数，以便在组件卸载时调用
      return () => stopListening();
    } catch (err) {
      setRecognitionError(err instanceof Error ? err.message : '识别失败');
      setIsListening(false);
    }
  };

  const handleTextToSpeech = async () => {
    if (!textToSpeak) {
      setSpeakingError('请输入要合成的文本');
      return;
    }

    setIsSpeaking(true);
    setSpeakingError(null);

    try {
      await speechService.speakText(textToSpeak, {
        voice: selectedVoice,
        ...speechOptions
      });
    } catch (err) {
      setSpeakingError(err instanceof Error ? err.message : '合成失败');
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <Card className="w-full p-6">
      <h3 className="text-xl font-semibold mb-4">语音分析与合成</h3>

      <Tabs defaultValue="recognition">
        <TabsList className="mb-4">
          <TabsTrigger value="recognition">语音识别</TabsTrigger>
          <TabsTrigger value="synthesis">语音合成</TabsTrigger>
        </TabsList>

        <TabsContent value="recognition">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="flex-1"
              />
              {audioFile && (
                <Badge variant="secondary">{audioFile.name}</Badge>
              )}
            </div>

            <Button
              onClick={handleSpeechToText}
              disabled={isRecognizing || !audioFile}
              className="w-full"
            >
              {isRecognizing ? '识别中...' : '识别语音'}
            </Button>

            <Button
              onClick={handleLiveRecognition}
              disabled={isRecognizing}
              className="w-full"
            >
              {isListening ? '停止监听' : '实时监听'}
            </Button>

            {isRecognizing && (
              <Progress value={50} className="mt-4" />
            )}

            {liveTranscript && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h4 className="font-medium mb-2">实时转录</h4>
                <p>{liveTranscript}</p>
              </div>
            )}

            {recognitionError && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
                {recognitionError}
              </div>
            )}

            {recognitionResult && (
              <div className="mt-6 space-y-4">
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">识别结果</h4>
                  <p className="text-sm text-gray-600">{recognitionResult.transcript}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">置信度</h4>
                    <Progress value={recognitionResult.confidence * 100} className="w-full" />
                    <p className="text-sm text-right mt-1">{Math.round(recognitionResult.confidence * 100)}%</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">语言</h4>
                    <Badge variant="secondary">{recognitionResult.language}</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="synthesis">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-to-speak">文本内容</Label>
              <Textarea
                id="text-to-speak"
                value={textToSpeak}
                onChange={(e) => setTextToSpeak(e.target.value)}
                placeholder="输入要合成的文本"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice-select">选择语音</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger id="voice-select">
                  <SelectValue placeholder="选择语音" />
                </SelectTrigger>
                <SelectContent>
                  {voiceOptions.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">语速: {speechOptions.rate}</Label>
                <input
                  id="rate"
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={speechOptions.rate}
                  onChange={(e) => setSpeechOptions({ ...speechOptions, rate: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pitch">音调: {speechOptions.pitch}</Label>
                <input
                  id="pitch"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={speechOptions.pitch}
                  onChange={(e) => setSpeechOptions({ ...speechOptions, pitch: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume">音量: {speechOptions.volume}</Label>
                <input
                  id="volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={speechOptions.volume}
                  onChange={(e) => setSpeechOptions({ ...speechOptions, volume: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            <Button
              onClick={handleTextToSpeech}
              disabled={isSpeaking || !textToSpeak}
              className="w-full"
            >
              {isSpeaking ? '合成中...' : '合成语音'}
            </Button>

            {speakingError && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
                {speakingError}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default SpeechAnalyzer;
