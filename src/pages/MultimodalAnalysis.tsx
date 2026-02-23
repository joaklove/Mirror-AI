import { useState } from 'react';
import { 
  BrainCircuit, 
  Image as ImageIcon, 
  Mic, 
  Video, 
  Layers,
  Sparkles
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { InkBackground } from '@/components/InkBackground';
import ImageAnalyzer from '@/components/multimodal/ImageAnalyzer';
import SpeechAnalyzer from '@/components/multimodal/SpeechAnalyzer';
import VideoAnalyzer from '@/components/multimodal/VideoAnalyzer';
import MultimodalAnalyzer from '@/components/multimodal/MultimodalAnalyzer';

export default function MultimodalAnalysisPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('multimodal');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>请先登录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <InkBackground intensity="light" />
      
      <header 
        className="sticky top-0 z-10 dao-glass shadow-sm"
        style={{ borderBottom: '1px solid hsl(var(--light-ink))' }}
      >
        <div className="content-container py-4 px-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
            <h1 
              className="text-lg font-semibold"
              style={{ 
                fontFamily: 'var(--font-serif)',
                color: 'hsl(var(--ink-green))',
                marginBottom: '0.25rem',
              }}
            >
              多模态分析
            </h1>
          </div>
          <p 
            className="text-xs"
            style={{ color: 'hsl(var(--mountain-green))' }}
          >
            基于图像、语音、视频的多模态AI分析
          </p>
        </div>
      </header>

      <main className="content-container py-8 pb-32 relative z-10">
        <div className="mb-8 animate-fade-in-up">
          <Card className="p-6 dao-card">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-shrink-0">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ 
                    background: 'hsl(var(--paper-yellow))',
                    border: '1px solid hsl(var(--light-ink))',
                  }}
                >
                  <Sparkles className="w-8 h-8" style={{ color: 'hsl(var(--cinnabar))' }} />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2" style={{ color: 'hsl(var(--ink-green))' }}>
                  多模态AI分析
                </h2>
                <p className="text-sm" style={{ color: 'hsl(var(--mountain-green))' }}>
                  利用先进的AI技术，分析和理解来自不同模态的数据，包括图像、语音和视频，
                  为你提供更全面、更深入的洞察。
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in-up">
          <TabsList 
            className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6"
            style={{ 
              background: 'hsl(var(--paper-yellow))',
              border: '1px solid hsl(var(--light-ink))',
            }}
          >
            <TabsTrigger 
              value="multimodal" 
              className="flex items-center gap-2 data-[state=active]:bg-[hsl(var(--cinnabar))] data-[state=active]:text-white"
            >
              <Layers className="w-4 h-4" />
              多模态融合
            </TabsTrigger>
            <TabsTrigger 
              value="image" 
              className="flex items-center gap-2 data-[state=active]:bg-[hsl(var(--cinnabar))] data-[state=active]:text-white"
            >
              <ImageIcon className="w-4 h-4" />
              图像分析
            </TabsTrigger>
            <TabsTrigger 
              value="speech" 
              className="flex items-center gap-2 data-[state=active]:bg-[hsl(var(--cinnabar))] data-[state=active]:text-white"
            >
              <Mic className="w-4 h-4" />
              语音分析
            </TabsTrigger>
            <TabsTrigger 
              value="video" 
              className="flex items-center gap-2 data-[state=active]:bg-[hsl(var(--cinnabar))] data-[state=active]:text-white"
            >
              <Video className="w-4 h-4" />
              视频分析
            </TabsTrigger>
          </TabsList>

          <TabsContent value="multimodal" className="animate-fade-in-up">
            <MultimodalAnalyzer />
          </TabsContent>

          <TabsContent value="image" className="animate-fade-in-up">
            <ImageAnalyzer />
          </TabsContent>

          <TabsContent value="speech" className="animate-fade-in-up">
            <SpeechAnalyzer />
          </TabsContent>

          <TabsContent value="video" className="animate-fade-in-up">
            <VideoAnalyzer />
          </TabsContent>
        </Tabs>

        <div 
          className="mt-12 text-center animate-fade-in-up"
        >
          <p 
            className="text-sm italic"
            style={{ color: 'hsl(var(--smoke-gray))' }}
          >
            「工欲善其事，必先利其器。」
          </p>
          <p 
            className="text-xs mt-1"
            style={{ color: 'hsl(var(--smoke-gray))', opacity: 0.7 }}
          >
            ——《论语》
          </p>
        </div>
      </main>
    </div>
  );
}
