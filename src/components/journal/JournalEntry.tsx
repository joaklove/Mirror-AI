import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { type JournalEntry } from '@/services/journalService';

interface JournalEntryProps {
  entry: JournalEntry;
  onDelete: (id: string) => void;
  getTagColor: (tag: string) => string;
  formatSmartTime: (timestamp: string) => string;
}

const JournalEntry = ({ 
  entry, 
  onDelete, 
  getTagColor, 
  formatSmartTime 
}: JournalEntryProps) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    onDelete(entry.id);
  };

  return (
    <div className="scroll-effect chinese-border hover:shadow-md transition-all duration-300 group mb-4 cloud-pattern">
      <div className="p-5">
        <div className="flex items-start gap-4 relative">
          {/* 时间戳装饰 */}
          <div className="flex flex-col items-center">
            <div className="w-1 h-16 bg-gradient-to-b from-green-700 to-red-800 rounded-full mb-2"></div>
            <div className="text-sm font-mono text-green-700 whitespace-nowrap font-[ZCOOL XiaoWei]">
              {formatSmartTime(entry.timestamp)}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-gray-800 leading-relaxed mb-4 font-[Noto Serif SC]">{entry.content}</p>
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`text-xs ${getTagColor(tag)} seal-stamp`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="relative z-50 p-2 text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-800 rounded-full transition-all cursor-pointer ink-splash"
            aria-label="删除记录"
            type="button"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalEntry;