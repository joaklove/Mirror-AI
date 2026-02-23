import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { type JournalEntry } from '@/services/journalService';
import { JournalEvents, InteractionEvents, ContentEvents, ConversionEvents, DiscoveryEvents } from '@/utils/analytics';
import { PostHogJournalEvents, PostHogConversionEvents } from '@/utils/posthog';

interface JournalInputProps {
  journalInput: string;
  setJournalInput: (value: string) => void;
  entries: JournalEntry[];
  handleSendEntry: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

const JournalInput = ({ 
  journalInput, 
  setJournalInput, 
  entries, 
  handleSendEntry,
  textareaRef 
}: JournalInputProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-8 bg-gradient-to-b from-green-700 to-red-800 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-900 font-[ZCOOL XiaoWei]">
          今日感悟
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-700 to-transparent"></div>
      </div>
      
      <div className="scroll-effect chinese-border cloud-pattern p-6">
        <Textarea
          ref={textareaRef}
          value={journalInput}
          onChange={(e) => setJournalInput(e.target.value)}
          placeholder="此刻在想什么？工作卡点、情绪波动或是小确幸..."
          className="min-h-[120px] resize-none border border-amber-200 rounded-lg bg-amber-50 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-0 text-base placeholder:text-gray-500 font-[Noto Serif SC]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              InteractionEvents.useShortcut('Cmd/Ctrl+Enter');
              
              const hasUsedShortcut = localStorage.getItem('has_used_keyboard_shortcut');
              if (!hasUsedShortcut) {
                DiscoveryEvents.featureDiscovered('Keyboard Shortcut');
                localStorage.setItem('has_used_keyboard_shortcut', 'true');
              }
              
              handleSendEntry();
            }
          }}
        />
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleSendEntry}
            className="bg-gradient-to-r from-green-700 to-red-800 hover:from-green-600 hover:to-red-700 text-white rounded-lg transition-all hover:shadow-md ink-splash"
            disabled={journalInput.trim() === ''}
          >
            <Send className="w-4 h-4 mr-2" />
            记录感悟
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JournalInput;