import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type CustomTheme = 'default' | 'nature' | 'ocean' | 'forest' | 'sunset' | 'night' | 'lavender' | 'desert' | 'sky' | 'emerald';

export interface ThemeColors {
  inkGreen: string;
  mountainGreen: string;
  cinnabar: string;
  paperYellow: string;
  lightInk: string;
  smokeGray: string;
  cloudWhite: string;
  gradientBg: string;
  gradientAccent: string;
  gradientWarm: string;
}

export const themeConfigs: Record<CustomTheme, ThemeColors> = {
  default: {
    inkGreen: '168 22% 15%',
    mountainGreen: '168 16% 42%',
    cinnabar: '9 52% 53%',
    paperYellow: '40 20% 94%',
    lightInk: '40 15% 88%',
    smokeGray: '40 10% 55%',
    cloudWhite: '40 20% 98%',
    gradientBg: 'linear-gradient(135deg, hsl(168 22% 15%) 0%, hsl(168 16% 42%) 100%)',
    gradientAccent: 'linear-gradient(135deg, hsl(9 52% 53%) 0%, hsl(40 20% 94%) 100%)',
    gradientWarm: 'linear-gradient(135deg, hsl(9 52% 53%) 0%, hsl(40 20% 94%) 50%, hsl(168 16% 42%) 100%)',
  },
  nature: {
    inkGreen: '120 25% 20%',
    mountainGreen: '120 20% 45%',
    cinnabar: '45 70% 50%',
    paperYellow: '50 30% 92%',
    lightInk: '50 20% 85%',
    smokeGray: '45 15% 50%',
    cloudWhite: '50 25% 96%',
    gradientBg: 'linear-gradient(135deg, hsl(120 25% 20%) 0%, hsl(120 20% 45%) 100%)',
    gradientAccent: 'linear-gradient(135deg, hsl(45 70% 50%) 0%, hsl(50 30% 92%) 100%)',
    gradientWarm: 'linear-gradient(135deg, hsl(45 70% 50%) 0%, hsl(50 30% 92%) 50%, hsl(120 20% 45%) 100%)',
  },
  ocean: {
    inkGreen: '200 30% 18%',
    mountainGreen: '200 25% 42%',
    cinnabar: '190 60% 55%',
    paperYellow: '200 15% 94%',
    lightInk: '200 15% 88%',
    smokeGray: '200 10% 50%',
    cloudWhite: '200 20% 97%',
    gradientBg: 'linear-gradient(135deg, hsl(200 30% 18%) 0%, hsl(200 25% 42%) 100%)',
    gradientAccent: 'linear-gradient(135deg, hsl(190 60% 55%) 0%, hsl(200 15% 94%) 100%)',
    gradientWarm: 'linear-gradient(135deg, hsl(190 60% 55%) 0%, hsl(200 15% 94%) 50%, hsl(200 25% 42%) 100%)',
  },
  forest: {
    inkGreen: '140 25% 18%',
    mountainGreen: '140 20% 40%',
    cinnabar: '25 60% 50%',
    paperYellow: '40 20% 93%',
    lightInk: '40 15% 86%',
    smokeGray: '35 10% 48%',
    cloudWhite: '40 20% 97%',
    gradientBg: 'linear-gradient(135deg, hsl(140 25% 18%) 0%, hsl(140 20% 40%) 100%)',
    gradientAccent: 'linear-gradient(135deg, hsl(25 60% 50%) 0%, hsl(40 20% 93%) 100%)',
    gradientWarm: 'linear-gradient(135deg, hsl(25 60% 50%) 0%, hsl(40 20% 93%) 50%, hsl(140 20% 40%) 100%)',
  },
  sunset: {
    inkGreen: '25 30% 20%',
    mountainGreen: '25 25% 42%',
    cinnabar: '340 60% 50%',
    paperYellow: '35 25% 93%',
    lightInk: '35 20% 87%',
    smokeGray: '30 10% 50%',
    cloudWhite: '35 25% 97%',
    gradientBg: 'linear-gradient(135deg, hsl(25 30% 20%) 0%, hsl(25 25% 42%) 100%)',
    gradientAccent: 'linear-gradient(135deg, hsl(340 60% 50%) 0%, hsl(35 25% 93%) 100%)',
    gradientWarm: 'linear-gradient(135deg, hsl(340 60% 50%) 0%, hsl(35 25% 93%) 50%, hsl(25 25% 42%) 100%)',
  },
  night: {
    inkGreen: '240 25% 15%',
    mountainGreen: '240 20% 30%',
    cinnabar: '180 60% 40%',
    paperYellow: '240 10% 90%',
    lightInk: '240 15% 80%',
    smokeGray: '240 10% 40%',
    cloudWhite: '240 15% 95%',
    gradientBg: 'linear-gradient(135deg, hsl(240 25% 15%) 0%, hsl(240 20% 30%) 100%)',
    gradientAccent: 'linear-gradient(135deg, hsl(180 60% 40%) 0%, hsl(240 10% 90%) 100%)',
    gradientWarm: 'linear-gradient(135deg, hsl(180 60% 40%) 0%, hsl(240 10% 90%) 50%, hsl(240 20% 30%) 100%)',
  },
  lavender: {
    inkGreen: '260 25% 20%',
    mountainGreen: '260 20% 40%',
    cinnabar: '320 60% 50%',
    paperYellow: '260 20% 92%',
    lightInk: '260 15% 85%',
    smokeGray: '260 10% 50%',
    cloudWhite: '260 25% 96%',
    gradientBg: 'linear-gradient(135deg, hsl(260 25% 20%) 0%, hsl(260 20% 40%) 100%)',
    gradientAccent: 'linear-gradient(135deg, hsl(320 60% 50%) 0%, hsl(260 20% 92%) 100%)',
    gradientWarm: 'linear-gradient(135deg, hsl(320 60% 50%) 0%, hsl(260 20% 92%) 50%, hsl(260 20% 40%) 100%)',
  },
  desert: {
    inkGreen: '30 25% 20%',
    mountainGreen: '30 20% 40%',
    cinnabar: '45 70% 50%',
    paperYellow: '35 25% 92%',
    lightInk: '35 20% 85%',
    smokeGray: '30 15% 50%',
    cloudWhite: '35 25% 96%',
    gradientBg: 'linear-gradient(135deg, hsl(30 25% 20%) 0%, hsl(30 20% 40%) 100%)',
    gradientAccent: 'linear-gradient(135deg, hsl(45 70% 50%) 0%, hsl(35 25% 92%) 100%)',
    gradientWarm: 'linear-gradient(135deg, hsl(45 70% 50%) 0%, hsl(35 25% 92%) 50%, hsl(30 20% 40%) 100%)',
  },
  sky: {
    inkGreen: '190 25% 20%',
    mountainGreen: '190 20% 45%',
    cinnabar: '220 60% 50%',
    paperYellow: '190 20% 93%',
    lightInk: '190 15% 85%',
    smokeGray: '190 10% 50%',
    cloudWhite: '190 25% 97%',
    gradientBg: 'linear-gradient(135deg, hsl(190 25% 20%) 0%, hsl(190 20% 45%) 100%)',
    gradientAccent: 'linear-gradient(135deg, hsl(220 60% 50%) 0%, hsl(190 20% 93%) 100%)',
    gradientWarm: 'linear-gradient(135deg, hsl(220 60% 50%) 0%, hsl(190 20% 93%) 50%, hsl(190 20% 45%) 100%)',
  },
  emerald: {
    inkGreen: '150 25% 18%',
    mountainGreen: '150 20% 42%',
    cinnabar: '120 60% 45%',
    paperYellow: '150 20% 93%',
    lightInk: '150 15% 85%',
    smokeGray: '150 10% 48%',
    cloudWhite: '150 25% 97%',
    gradientBg: 'linear-gradient(135deg, hsl(150 25% 18%) 0%, hsl(150 20% 42%) 100%)',
    gradientAccent: 'linear-gradient(135deg, hsl(120 60% 45%) 0%, hsl(150 20% 93%) 100%)',
    gradientWarm: 'linear-gradient(135deg, hsl(120 60% 45%) 0%, hsl(150 20% 93%) 50%, hsl(150 20% 42%) 100%)',
  },
};

const THEME_KEY = 'mirror-ai-theme';
const CUSTOM_THEME_KEY = 'mirror-ai-custom-theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem(THEME_KEY) as Theme) || 'light';
  });
  
  const [customTheme, setCustomTheme] = useState<CustomTheme>(() => {
    return (localStorage.getItem(CUSTOM_THEME_KEY) as CustomTheme) || 'default';
  });

  const applyTheme = useCallback((newTheme: Theme, newCustomTheme?: CustomTheme) => {
    const root = document.documentElement;
    
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }

    if (newCustomTheme) {
      const colors = themeConfigs[newCustomTheme];
      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
      root.style.setProperty('--gradient-bg', colors.gradientBg);
      root.style.setProperty('--gradient-accent', colors.gradientAccent);
      root.style.setProperty('--gradient-warm', colors.gradientWarm);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme, customTheme);
  }, [theme, customTheme, applyTheme]);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    setTheme(themes[(currentIndex + 1) % themes.length]);
  };

  const setCustomThemePreference = (newCustomTheme: CustomTheme) => {
    setCustomTheme(newCustomTheme);
    localStorage.setItem(CUSTOM_THEME_KEY, newCustomTheme);
  };

  return {
    theme,
    customTheme,
    setTheme,
    setCustomThemePreference,
    toggleTheme,
    themeConfigs,
  };
}
