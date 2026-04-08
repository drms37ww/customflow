import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTheme } from '../hooks/useTheme';
import { signOut } from '../services/authService';
import { exportData, importData } from '../sync/exportImport';
import { syncAll } from '../sync/engine';
import { useSyncStore } from '../stores/syncStore';
import LabelManager from '../components/labels/LabelManager';
import {
  User, Bell, RefreshCw, Palette, Calendar, BookOpen, Database, Tag, LogOut
} from 'lucide-react';
import './PageStyles.css';
import './Settings.css';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id) || 'local';
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme } = useTheme();
  const settings = useSettingsStore();
  const sync = useSyncStore();
  const [labelManagerOpen, setLabelManagerOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    await exportData(userId);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await importData(file, userId);
      alert(t('common.done'));
    } catch (err) {
      alert(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="page">
      <h1 className="page-title">{t('settings.title')}</h1>

      <div className="settings-sections">
        {/* Account */}
        <section className="settings-section">
          <h2 className="settings-section-title">
            <User size={18} /> {t('settings.account.title')}
          </h2>
          <div className="settings-row">
            <span>{t('auth.email')}</span>
            <span className="settings-value">{user?.email || 'Local mode'}</span>
          </div>
          <button className="settings-btn settings-btn--danger" onClick={handleLogout}>
            <LogOut size={16} /> {t('auth.logout')}
          </button>
        </section>

        {/* Display */}
        <section className="settings-section">
          <h2 className="settings-section-title">
            <Palette size={18} /> {t('settings.display.title')}
          </h2>
          <div className="settings-row">
            <span>{t('settings.display.theme')}</span>
            <select
              className="settings-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="system">{t('theme.system')}</option>
              <option value="light">{t('theme.light')}</option>
              <option value="dark">{t('theme.dark')}</option>
            </select>
          </div>
          <div className="settings-row">
            <span>{t('settings.display.language')}</span>
            <select
              className="settings-select"
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
            >
              <option value="en">{t('settings.display.en')}</option>
              <option value="ja">{t('settings.display.ja')}</option>
            </select>
          </div>
        </section>

        {/* Labels */}
        <section className="settings-section">
          <h2 className="settings-section-title">
            <Tag size={18} /> {t('common.labels')}
          </h2>
          <button className="settings-btn" onClick={() => setLabelManagerOpen(true)}>
            {t('common.edit')} {t('common.labels')}
          </button>
        </section>

        {/* Calendar */}
        <section className="settings-section">
          <h2 className="settings-section-title">
            <Calendar size={18} /> {t('settings.calendarSettings.title')}
          </h2>
          <div className="settings-row">
            <span>{t('settings.calendarSettings.defaultView')}</span>
            <select
              className="settings-select"
              value={settings.calendarDefaultView}
              onChange={(e) => settings.setCalendarDefaultView(e.target.value)}
            >
              <option value="year">{t('calendar.views.year')}</option>
              <option value="month">{t('calendar.views.month')}</option>
              <option value="week">{t('calendar.views.week')}</option>
              <option value="3week">{t('calendar.views.threeWeek')}</option>
              <option value="3day">{t('calendar.views.threeDay')}</option>
            </select>
          </div>
          <div className="settings-row">
            <span>{t('settings.calendarSettings.weekStart')}</span>
            <select
              className="settings-select"
              value={settings.weekStart}
              onChange={(e) => settings.setWeekStart(Number(e.target.value))}
            >
              <option value={1}>{t('days.monday')}</option>
              <option value={0}>{t('days.sunday')}</option>
              <option value={6}>{t('days.saturday')}</option>
            </select>
          </div>
          <div className="settings-row">
            <span>{t('settings.calendarSettings.dayNameFormat')}</span>
            <select
              className="settings-select"
              value={settings.dayNameFormat}
              onChange={(e) => settings.setDayNameFormat(e.target.value)}
            >
              <option value="full">{t('settings.calendarSettings.fullName')}</option>
              <option value="short">{t('settings.calendarSettings.abbreviated')}</option>
            </select>
          </div>
        </section>

        {/* Flashcards */}
        <section className="settings-section">
          <h2 className="settings-section-title">
            <BookOpen size={18} /> {t('settings.flashcardSettings.title')}
          </h2>
          <div className="settings-row">
            <span>{t('settings.flashcardSettings.requestRetention')}</span>
            <input
              type="number"
              className="settings-input-small"
              min="0.5" max="0.99" step="0.01"
              value={settings.fsrsRequestRetention}
              onChange={(e) => settings.setFsrsRequestRetention(Number(e.target.value))}
            />
          </div>
          <div className="settings-row">
            <span>{t('settings.flashcardSettings.maximumInterval')}</span>
            <input
              type="number"
              className="settings-input-small"
              min="1" max="36500"
              value={settings.fsrsMaximumInterval}
              onChange={(e) => settings.setFsrsMaximumInterval(Number(e.target.value))}
            />
          </div>
          <div className="settings-row">
            <span>{t('settings.flashcardSettings.enableFuzz')}</span>
            <input
              type="checkbox"
              checked={settings.fsrsEnableFuzz}
              onChange={(e) => settings.setFsrsEnableFuzz(e.target.checked)}
            />
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-section">
          <h2 className="settings-section-title">
            <Bell size={18} /> {t('settings.notifications.title')}
          </h2>
          <div className="settings-row">
            <span>{t('settings.notifications.pushEnabled')}</span>
            <input
              type="checkbox"
              checked={settings.pushEnabled}
              onChange={(e) => settings.setPushEnabled(e.target.checked)}
            />
          </div>
          <div className="settings-row">
            <span>{t('settings.notifications.emailEnabled')}</span>
            <input
              type="checkbox"
              checked={settings.emailEnabled}
              onChange={(e) => settings.setEmailEnabled(e.target.checked)}
            />
          </div>
        </section>

        {/* Sync */}
        <section className="settings-section">
          <h2 className="settings-section-title">
            <RefreshCw size={18} /> {t('settings.sync.title')}
          </h2>
          <div className="settings-row">
            <span>{t('settings.sync.lastSync')}</span>
            <span className="settings-value">
              {sync.lastSyncTime ? new Date(sync.lastSyncTime).toLocaleString() : '—'}
            </span>
          </div>
          <button className="settings-btn" onClick={syncAll} disabled={sync.isSyncing}>
            <RefreshCw size={16} className={sync.isSyncing ? 'sync-spin' : ''} />
            {sync.isSyncing ? t('settings.sync.syncing') : t('settings.sync.syncNow')}
          </button>
        </section>

        {/* Data */}
        <section className="settings-section">
          <h2 className="settings-section-title">
            <Database size={18} /> {t('settings.data.title')}
          </h2>
          <p className="settings-desc">{t('settings.data.exportDescription')}</p>
          <button className="settings-btn" onClick={handleExport}>
            {t('settings.data.export')}
          </button>
          <p className="settings-desc">{t('settings.data.importDescription')}</p>
          <label className="settings-btn" style={{ cursor: 'pointer' }}>
            {importing ? t('common.loading') : t('settings.data.import')}
            <input type="file" accept=".zip" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </section>
      </div>

      <LabelManager open={labelManagerOpen} onClose={() => setLabelManagerOpen(false)} />
    </div>
  );
}
