import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { InstallAppDialog } from '@/components/InstallAppDialog';

interface InstallContextValue {
  openInstall: () => void;
}

// 默认值 noop：保证未套 Provider 的场景（如单测直接渲染 Home）不报错
const InstallContext = createContext<InstallContextValue>({ openInstall: () => {} });

export function InstallProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ openInstall: () => setOpen(true) }), []);

  return (
    <InstallContext.Provider value={value}>
      {children}
      <InstallAppDialog open={open} onClose={() => setOpen(false)} />
    </InstallContext.Provider>
  );
}

export function useInstall() {
  return useContext(InstallContext);
}
