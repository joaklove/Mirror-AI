import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileTabBar } from '@/components/MobileTabBar';

describe('MobileTabBar', () => {
  it('渲染三个 Tab：记录 / 回望 / 我的', () => {
    render(<MobileTabBar active="record" onChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: /记录/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /回望/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /我的/ })).toBeInTheDocument();
  });

  it('当前 Tab 的 aria-selected 为 true，其余为 false', () => {
    render(<MobileTabBar active="reflect" onChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: /回望/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /记录/ })).toHaveAttribute('aria-selected', 'false');
  });

  it('点击 Tab 触发 onChange 并回传正确 id', () => {
    const onChange = vi.fn();
    render(<MobileTabBar active="record" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: /我的/ }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('me');
  });
});
