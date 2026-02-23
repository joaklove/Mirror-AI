import React, { useState } from 'react';
import { multimodalService, MultimodalAnalysisResult, MultimodalData } from '../../services/multimodal/multimodalService';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';

const MultimodalAnalyzer: React.FC = () => {
  const [multimodalData, setMultimodalData] = useState<MultimodalData>({});
  const [analysisResult, setAnalysisResult] = useState<MultimodalAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMultimodalData({ ...multimodalData, text: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const images = Array.from(files).map(file => {
        const url = URL.createObjectURL(file);
        return { url };
      });
      setMultimodalData({ ...multimodalData, images });
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const audio = Array.from(files).map(file => {
        const url = URL.createObjectURL(file);
        return { url };
      });
      setMultimodalData({ ...multimodalData, audio });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const video = Array.from(files).map(file => {
        const url = URL.createObjectURL(file);
        return { url };
      });
      setMultimodalData({ ...multimodalData, video });
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // 检查是否有数据
      const hasData = 
        !!multimodalData.text || 
        (multimodalData.images && multimodalData.images.length > 0) ||
        (multimodalData.audio && multimodalData.audio.length > 0) ||
        (multimodalData.video && multimodalData.video.length > 0);

      if (!hasData) {
        throw new Error('请至少提供一种类型的数据');
      }

      // 使用自定义提示或默认提示
      const prompt = customPrompt || '基于提供的多模态数据，提供全面的分析和洞察';

      // 分析多模态数据
      const result = await multimodalService.analyzeMultimodalData(multimodalData, prompt);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full p-6">
      <h3 className="text-xl font-semibold mb-4">多模态数据融合分析</h3>

      <Tabs defaultValue="text">
        <TabsList className="mb-4">
          <TabsTrigger value="text">文本</TabsTrigger>
          <TabsTrigger value="images">图像</TabsTrigger>
          <TabsTrigger value="audio">音频</TabsTrigger>
          <TabsTrigger value="video">视频</TabsTrigger>
          <TabsTrigger value="prompt">分析提示</TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">文本内容</Label>
              <Textarea
                id="text-input"
                value={multimodalData.text || ''}
                onChange={handleTextChange}
                placeholder="输入文本内容"
                rows={6}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="images">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload">上传图像</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
            </div>
            {multimodalData.images && multimodalData.images.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">已上传图像 ({multimodalData.images.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {multimodalData.images.map((image, index) => (
                    <div key={index} className="aspect-square relative">
                      <img 
                        src={image.url} 
                        alt={`Uploaded image ${index + 1}`} 
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="audio">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audio-upload">上传音频</Label>
              <Input
                id="audio-upload"
                type="file"
                accept="audio/*"
                multiple
                onChange={handleAudioUpload}
              />
            </div>
            {multimodalData.audio && multimodalData.audio.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">已上传音频 ({multimodalData.audio.length})</h4>
                <div className="space-y-2">
                  {multimodalData.audio.map((audio, index) => (
                    <div key={index} className="p-2 bg-gray-100 rounded-md">
                      <Badge variant="secondary">音频 {index + 1}</Badge>
                      <audio controls className="mt-2 w-full">
                        <source src={audio.url} type="audio/*" />
                        您的浏览器不支持音频播放。
                      </audio>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="video">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-upload">上传视频</Label>
              <Input
                id="video-upload"
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoUpload}
              />
            </div>
            {multimodalData.video && multimodalData.video.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">已上传视频 ({multimodalData.video.length})</h4>
                <div className="space-y-4">
                  {multimodalData.video.map((video, index) => (
                    <div key={index} className="p-2 bg-gray-100 rounded-md">
                      <Badge variant="secondary">视频 {index + 1}</Badge>
                      <video controls className="mt-2 w-full max-h-48">
                        <source src={video.url} type="video/*" />
                        您的浏览器不支持视频播放。
                      </video>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="prompt">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-prompt">自定义分析提示</Label>
              <Textarea
                id="custom-prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="输入自定义分析提示，例如：'基于提供的多模态数据，分析用户的情感状态和需求'"
                rows={4}
              />
            </div>
            <p className="text-sm text-gray-600">
              提示：自定义提示可以引导分析结果更符合您的具体需求。
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="mt-6 w-full"
      >
        {isAnalyzing ? '分析中...' : '融合分析'}
      </Button>

      {isAnalyzing && (
        <Progress value={50} className="mt-4" />
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {analysisResult && (
        <div className="mt-6 space-y-4">
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">分析结果</h4>
            <p className="text-sm text-gray-600">{analysisResult.description}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2">关键洞察</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {analysisResult.insights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">情感分析</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.emotions.map((emotion, index) => (
                  <Badge key={index} variant="secondary">{emotion}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">主要话题</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.topics.map((topic, index) => (
                  <Badge key={index} variant="secondary">{topic}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">建议</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {analysisResult.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">准确率</h4>
              <Progress value={analysisResult.accuracy * 100} className="w-full" />
              <p className="text-sm text-right mt-1">{Math.round(analysisResult.accuracy * 100)}%</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">置信度</h4>
              <Progress value={analysisResult.confidence * 100} className="w-full" />
              <p className="text-sm text-right mt-1">{Math.round(analysisResult.confidence * 100)}%</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MultimodalAnalyzer;
