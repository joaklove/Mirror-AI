import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// vi.hoisted: mock 工厂会被提升到 import 之前，外部变量必须这样声明
const { mockGenerateEcho } = vi.hoisted(() => ({ mockGenerateEcho: vi.fn() }));

// 给一条笔记，否则入口按钮因「无记录」被 disabled，点不动
vi.mock('@/services/journalService', () => ({
  journalService: {
    getEntries: vi.fn().mockResolvedValue([
      { id: 'n1', content: '今天的一点想法', tags: [], timestamp: new Date().toISOString() },
    ]),
    getRecentEntries: vi.fn().mockReturnValue([]),
    createEntry: vi.fn(),
    updateEntry: vi.fn(),
    deleteEntry: vi.fn(),
    uploadImage: vi.fn(),
    deleteImage: vi.fn(),
  },
}));

vi.mock('@/services/voiceService', () => ({ voiceService: {} }));
vi.mock('@/services/morningReportService', () => ({ morningReportService: { generate: vi.fn() } }));
vi.mock('@/services/echoService', () => ({
  generateEcho: mockGenerateEcho,
  getTodayEcho: vi.fn(() => null), // 模拟今日无缓存：应显示入口，且绝不自动生成
}));
vi.mock('@/components/InkBackground', () => ({ InkBackground: () => null }));
vi.mock('@/components/TaijiIcon', () => ({ TaijiIcon: () => null }));
vi.mock('@/hooks/usePWA', () => ({ usePWA: () => ({}) }));

import Home from '@/pages/Home';

function renderHome() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
}

describe('回声 · 按需触发（刷新绝不自动运行）', () => {
  beforeEach(() => {
    mockGenerateEcho.mockReset();
    mockGenerateEcho.mockResolvedValue(null);
  });

  it('打开首页不自动生成回声，只显示「照一照」入口', async () => {
    renderHome();
    const entry = await screen.findByRole('button', { name: '照一照' });
    expect(entry).toBeInTheDocument();
    // 核心断言：页面就绪后 AI 一次都没被调用
    expect(mockGenerateEcho).not.toHaveBeenCalled();
  });

  it('点「照一照」才真正触发一次生成', async () => {
    renderHome();
    const entry = await screen.findByRole('button', { name: '照一照' });
    fireEvent.click(entry);
    await waitFor(() => expect(mockGenerateEcho).toHaveBeenCalledTimes(1));
    expect(mockGenerateEcho).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'test-user-id', nickname: 'test', force: false })
    );
  });
});
