import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Home 依赖较重，逐个 mock 掉与 EchoContent 无关的服务
vi.mock('@/services/voiceService', () => ({ voiceService: {} }));
vi.mock('@/services/morningReportService', () => ({ morningReportService: {} }));
vi.mock('@/services/echoService', () => ({ generateEcho: vi.fn(), pruneEchoCache: vi.fn() }));
vi.mock('@/components/InkBackground', () => ({ InkBackground: () => null }));
vi.mock('@/components/TaijiIcon', () => ({ TaijiIcon: () => null }));
vi.mock('@/hooks/usePWA', () => ({ usePWA: () => ({}) }));

import { EchoContent, EchoCard } from '@/pages/Home';

describe('EchoContent 溯源渲染', () => {
  it('把 [note:xxx] 渲染成可点击溯源标记，点击回传真实 id', () => {
    const onJump = vi.fn();
    render(
      <EchoContent
        content={'你又在拖延 [note:abc-123]，和上次一样 [note:def-456]'}
        onJump={onJump}
      />
    );
    const buttons = screen.getAllByTitle('跳到这条笔记');
    expect(buttons).toHaveLength(2);
    fireEvent.click(buttons[0]);
    expect(onJump).toHaveBeenCalledWith('abc-123');
    fireEvent.click(buttons[1]);
    expect(onJump).toHaveBeenCalledWith('def-456');
  });

  it('纯文本无溯源标记时不渲染按钮', () => {
    const { container } = render(<EchoContent content="一句温和的观察" onJump={vi.fn()} />);
    expect(container.querySelectorAll('button')).toHaveLength(0);
    expect(screen.getByText('一句温和的观察')).toBeInTheDocument();
  });
});

describe('EchoCard 三分支展示', () => {
  it('回声分支显示张力标签', () => {
    render(
      <EchoCard
        data={{ type: 'echo', content: '观察 [note:x]', sourceIds: ['x'] }}
        generating={false}
        onRegenerate={vi.fn()}
        onJump={vi.fn()}
      />
    );
    expect(screen.getByText('回声 · 照见张力')).toBeInTheDocument();
  });

  it('沉默分支显示克制文案而非空白', () => {
    render(
      <EchoCard
        data={{ type: 'silence', content: '', sourceIds: [] }}
        generating={false}
        onRegenerate={vi.fn()}
        onJump={vi.fn()}
      />
    );
    expect(screen.getByText(/今日尚无可照见的呼应/)).toBeInTheDocument();
  });

  it('生成中显示进行态', () => {
    render(
      <EchoCard
        data={{ type: 'silence', content: '', sourceIds: [] }}
        generating
        onRegenerate={vi.fn()}
        onJump={vi.fn()}
      />
    );
    expect(screen.getByText(/镜正在回望/)).toBeInTheDocument();
  });
});
