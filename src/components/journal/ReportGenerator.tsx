import { Button } from '@/components/ui/button';
import { Sunrise } from 'lucide-react';

interface ReportGeneratorProps {
  isGenerating: boolean;
  onGenerateReport: (force?: boolean) => void;
  hasGeneratedToday: boolean;
}

const ReportGenerator = ({ 
  isGenerating, 
  onGenerateReport, 
  hasGeneratedToday 
}: ReportGeneratorProps) => {
  return (
    <div className="fixed bottom-10 right-10 z-20 flex flex-col items-end gap-3">
      {hasGeneratedToday && (
        <button
          onClick={() => onGenerateReport(true)}
          disabled={isGenerating}
          className="text-xs text-green-700 hover:text-green-800 transition-colors bg-amber-100 px-4 py-2 rounded-full border border-amber-200 shadow-sm ink-splash"
        >
          {isGenerating ? '正在重新生成...' : '重新生成晨报'}
        </button>
      )}
      <Button
        onClick={() => onGenerateReport(false)}
        disabled={isGenerating}
        className="h-16 px-8 text-base font-medium bg-gradient-to-r from-green-700 to-red-800 hover:from-green-800 hover:to-red-900 text-amber-50 rounded-full transition-all animate-pulse-glow disabled:opacity-50 shadow-lg ink-splash chinese-border"
      >
        {isGenerating ? (
          <>
            <div className="w-6 h-6 rounded-full border-2 border-amber-50 border-t-transparent animate-spin mr-3"></div>
            正在感悟...
          </>
        ) : (
          <>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center mr-3 shadow-sm">
              <Sunrise className="w-4 h-4 text-green-700" />
            </div>
            {hasGeneratedToday ? '查看今日晨报' : '生成今日晨报'}
          </>
        )}
      </Button>
    </div>
  );
};

export default ReportGenerator;