import { Button } from '@/components/ui/button';
import { Clock, Sunrise } from 'lucide-react';
import { type JournalEntry } from '@/services/journalService';
import JournalEntry from './JournalEntry';

interface AIReport {
  id: string;
  content: string;
  created_at: string | null;
  model?: string | null;
  model_used?: string | null;
  user_id: string;
}

interface JournalTimelineProps {
  entries: JournalEntry[];
  historyReports: AIReport[];
  onDeleteEntry: (id: string) => void;
  onShowHistory: () => void;
  getTagColor: (tag: string) => string;
  formatSmartTime: (timestamp: string) => string;
}

const JournalTimeline = ({ 
  entries, 
  historyReports, 
  onDeleteEntry, 
  onShowHistory, 
  getTagColor, 
  formatSmartTime 
}: JournalTimelineProps) => {
  if (entries.length === 0) {
    return (
      <div className="scroll-effect chinese-border text-center p-8 cloud-pattern">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-700 to-red-800 flex items-center justify-center shadow-md mx-auto mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-green-700" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 font-[ZCOOL XiaoWei] mb-2">
          开始记录
        </h3>
        <p className="text-gray-600">还没有感悟记录，开始记录你的第一篇吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-700 to-red-800 flex items-center justify-center shadow-md">
            <Clock className="w-4 h-4 text-amber-50" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 font-[ZCOOL XiaoWei]">
            今日时间轴
          </h2>
        </div>
        {historyReports.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowHistory}
            className="text-xs text-green-700 hover:text-green-800 hover:bg-amber-100 ink-splash"
          >
            <Sunrise className="w-3 h-3 mr-1 text-green-700" />
            历史晨报 ({historyReports.length})
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <JournalEntry
            key={entry.id}
            entry={entry}
            onDelete={onDeleteEntry}
            getTagColor={getTagColor}
            formatSmartTime={formatSmartTime}
          />
        ))}
      </div>
    </div>
  );
};

export default JournalTimeline;