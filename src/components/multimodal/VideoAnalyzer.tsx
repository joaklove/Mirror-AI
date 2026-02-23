import React, { useState } from 'react';
import { videoService, VideoAnalysisResult } from '../../services/multimodal/videoService';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';

const VideoAnalyzer: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisOptions, setAnalysisOptions] = useState({
    maxFrames: 10,
    frameInterval: 1
  });

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl('');
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      let result: VideoAnalysisResult;

      if (videoFile) {
        result = await videoService.analyzeVideoFromFile(videoFile, analysisOptions);
      } else if (videoUrl) {
        result = await videoService.analyzeVideo(videoUrl, analysisOptions);
      } else {
        throw new Error('请上传视频或输入视频URL');
      }

      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full p-6">
      <h3 className="text-xl font-semibold mb-4">视频分析</h3>

      <Tabs defaultValue="upload">
        <TabsList className="mb-4">
          <TabsTrigger value="upload">上传视频</TabsTrigger>
          <TabsTrigger value="url">视频URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="flex-1"
              />
              {videoFile && (
                <Badge variant="secondary">{videoFile.name}</Badge>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="url">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">视频URL</Label>
              <Input
                id="video-url"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="输入视频URL"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>分析选项</Label>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="max-frames">最大分析帧数: {analysisOptions.maxFrames}</Label>
              </div>
              <Slider
                id="max-frames"
                min={1}
                max={30}
                step={1}
                value={[analysisOptions.maxFrames]}
                onValueChange={(value) => setAnalysisOptions({ ...analysisOptions, maxFrames: value[0] })}
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="frame-interval">帧间隔(秒): {analysisOptions.frameInterval}</Label>
              </div>
              <Slider
                id="frame-interval"
                min={0.5}
                max={5}
                step={0.5}
                value={[analysisOptions.frameInterval]}
                onValueChange={(value) => setAnalysisOptions({ ...analysisOptions, frameInterval: value[0] })}
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || (!videoFile && !videoUrl)}
          className="w-full"
        >
          {isAnalyzing ? '分析中...' : '分析视频'}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">识别的物体</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.objects.map((obj, index) => (
                    <Badge key={index} variant="secondary">{obj}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">情感分析</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.emotions.map((emotion, index) => (
                    <Badge key={index} variant="secondary">{emotion}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">标签</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">场景数</h4>
                <Badge variant="secondary">{analysisResult.scenes.length} 个场景</Badge>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">场景分析</h4>
              <div className="space-y-2">
                {analysisResult.scenes.map((scene, index) => (
                  <div key={index} className="p-3 bg-gray-100 rounded-md">
                    <h5 className="font-medium">场景 {index + 1} ({scene.startTime}-{scene.endTime}秒)</h5>
                    <p className="text-sm mt-1">{scene.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {scene.objects.map((obj, objIndex) => (
                        <Badge key={objIndex} variant="outline" className="text-xs">{obj}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">准确率</h4>
              <Progress value={analysisResult.accuracy * 100} className="w-full" />
              <p className="text-sm text-right mt-1">{Math.round(analysisResult.accuracy * 100)}%</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VideoAnalyzer;
