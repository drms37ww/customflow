import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { useSyncStore } from './stores/syncStore';
import './config/i18n';
import './styles/theme.css';
import './styles/globals.css';

// Apply stored theme immediately to avoid flash
const stored = localStorage.getItem('customflow-settings');
if (stored) {
  try {
    const { state } = JSON.parse(stored);
    const theme = state?.theme || 'system';
    const resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.setAttribute('data-theme', resolved);
  } catch {
    document.documentElement.setAttribute('data-theme', 'light');
  }
} else {
  const resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', resolved);
}

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { type: 'module' }).catch(() => {});
  });
}

// Online/offline tracking
window.addEventListener('online', () => {
  useSyncStore.getState().setIsOnline(true);
});
window.addEventListener('offline', () => {
  useSyncStore.getState().setIsOnline(false);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
