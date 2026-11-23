import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

// 控制 useInstallPrompt 的返回值，覆盖三种分支
const mockState = vi.hoisted(() => ({
  canPrompt: false,
  isStandalone: false,
  platform: 'android' as 'ios' | 'android' | 'desktop',
  install: vi.fn(),
}));

vi.mock('@/hooks/useInstallPrompt', () => ({
  useInstallPrompt: () => mockState,
  detectPlatform: vi.fn(),
  detectStandalone: vi.fn(),
}));

import { InstallAppDialog } from '@/components/InstallAppDialog';

describe('InstallAppDialog 安装引导', () => {
  beforeEach(() => {
    mockState.canPrompt = false;
    mockState.isStandalone = false;
    mockState.platform = 'android';
    mockState.install.mockReset();
    mockState.install.mockResolvedValue(true);
  });

  it('标准浏览器（canPrompt）显示一键安装按钮', () => {
    mockState.canPrompt = true;
    render(<InstallAppDialog open onClose={vi.fn()} />);
    expect(screen.getByText('一键安装到桌面')).toBeInTheDocument();
  });

  it('安卓小众浏览器显示对应添加步骤与复制网址', () => {
    mockState.platform = 'android';
    render(<InstallAppDialog open onClose={vi.fn()} />);
    expect(screen.getByText(/在安卓手机上这样添加/)).toBeInTheDocument();
    expect(screen.getByText(/安装应用.*添加到主屏幕/)).toBeInTheDocument();
    expect(screen.getByText('复制网址')).toBeInTheDocument();
  });

  it('iOS 提示只有 Safari 支持全屏安装（雨见等浏览器限制）', () => {
    mockState.platform = 'ios';
    render(<InstallAppDialog open onClose={vi.fn()} />);
    expect(screen.getByText(/在iPhone \/ iPad上这样添加/)).toBeInTheDocument();
    expect(screen.getByText(/只有 Safari 支持全屏安装/)).toBeInTheDocument();
  });

  it('桌面浏览器显示菜单安装步骤', () => {
    mockState.platform = 'desktop';
    render(<InstallAppDialog open onClose={vi.fn()} />);
    expect(screen.getByText(/在电脑上这样添加/)).toBeInTheDocument();
  });

  it('已安装态不再引导安装', () => {
    mockState.isStandalone = true;
    render(<InstallAppDialog open onClose={vi.fn()} />);
    expect(screen.getByText('你已经在使用桌面版了')).toBeInTheDocument();
    expect(screen.queryByText('复制网址')).not.toBeInTheDocument();
  });

  it('点一键安装成功后关闭弹窗', async () => {
    mockState.canPrompt = true;
    const onClose = vi.fn();
    render(<InstallAppDialog open onClose={onClose} />);
    await act(async () => {
      fireEvent.click(screen.getByText('一键安装到桌面'));
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('open=false 时不渲染', () => {
    const { container } = render(<InstallAppDialog open={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
