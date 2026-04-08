import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon, Monitor, Globe } from 'lucide-react';
import './Header.css';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const order = ['system', 'light', 'dark'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(next);
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <header className="header">
      <div className="header-title">{t('app.name')}</div>
      <div className="header-actions">
        <button
          className="header-btn"
          onClick={toggleLanguage}
          title={t('settings.display.language')}
          aria-label={t('settings.display.language')}
        >
          <Globe size={18} />
          <span className="header-btn-label">{i18n.language === 'en' ? 'EN' : 'JP'}</span>
        </button>
        <button
          className="header-btn"
          onClick={cycleTheme}
          title={t(`theme.${theme}`)}
          aria-label={t('settings.display.theme')}
        >
          <ThemeIcon size={18} />
        </button>
      </div>
    </header>
  );
}
