import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { applyTheme, getResolvedTheme } from '../config/theme';

export function useTheme() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  useEffect(() => {
    applyTheme(theme);

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  return {
    theme,
    resolvedTheme: getResolvedTheme(theme),
    setTheme,
  };
}
