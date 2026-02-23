import React, { useState } from 'react';
import { imageService, ImageAnalysisResult } from '../../services/multimodal/imageService';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';

const ImageAnalyzer: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl('');
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      let result: ImageAnalysisResult;

      if (imageFile) {
        result = await imageService.analyzeImageFromFile(imageFile);
      } else if (imageUrl) {
        result = await imageService.analyzeImage(imageUrl);
      } else {
        throw new Error('请上传图像或输入图像URL');
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
      <h3 className="text-xl font-semibold mb-4">图像分析</h3>

      <Tabs defaultValue="upload">
        <TabsList className="mb-4">
          <TabsTrigger value="upload">上传图像</TabsTrigger>
          <TabsTrigger value="url">图像URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="flex-1"
              />
              {imageFile && (
                <Badge variant="secondary">{imageFile.name}</Badge>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="url">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">图像URL</Label>
              <Input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="输入图像URL"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing || (!imageFile && !imageUrl)}
        className="mt-4 w-full"
      >
        {isAnalyzing ? '分析中...' : '分析图像'}
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
              <h4 className="font-medium mb-2">颜色分析</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.colors.map((color, index) => (
                  <Badge key={index} variant="secondary">{color}</Badge>
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
          </div>

          <div>
            <h4 className="font-medium mb-2">准确率</h4>
            <Progress value={analysisResult.accuracy * 100} className="w-full" />
            <p className="text-sm text-right mt-1">{Math.round(analysisResult.accuracy * 100)}%</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ImageAnalyzer;
