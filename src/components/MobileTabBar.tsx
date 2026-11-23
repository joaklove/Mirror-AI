import { PenLine, Eye, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MobileTab = 'record' | 'reflect' | 'me';

const TABS: { id: MobileTab; label: string; icon: typeof PenLine }[] = [
  { id: 'record', label: '记录', icon: PenLine },
  { id: 'reflect', label: '回望', icon: Eye },
  { id: 'me', label: '我的', icon: UserRound },
];

interface MobileTabBarProps {
  active: MobileTab;
  onChange: (tab: MobileTab) => void;
}

/** 手机端底部导航：固定底部 + 安全区适配（iPhone 底部横条） */
export function MobileTabBar({ active, onChange }: MobileTabBarProps) {
  return (
    <nav
      className="mobile-tab-bar fixed bottom-0 left-0 right-0 z-30"
      role="tablist"
      aria-label="主导航"
    >
      <div className="flex items-stretch h-full">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors',
                isActive ? 'text-[hsl(var(--ink-green))]' : 'text-[hsl(var(--smoke-gray))]'
              )}
            >
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: 'hsl(var(--cinnabar))' }}
                  aria-hidden="true"
                />
              )}
              <Icon className={cn('w-5 h-5', isActive && 'text-[hsl(var(--cinnabar))]')} />
              <span className="text-[11px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
