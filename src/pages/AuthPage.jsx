import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import EmailVerification from '../components/auth/EmailVerification';
import { Sun, Moon, Monitor, Globe } from 'lucide-react';
import './PageStyles.css';

export default function AuthPage() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [view, setView] = useState('login'); // login | signup | forgot | verify

  if (isLoading) {
    return (
      <div className="page page--auth">
        <div className="auth-container">
          <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            {t('common.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/todos" replace />;
  }

  const cycleTheme = () => {
    const order = ['system', 'light', 'dark'];
    setTheme(order[(order.indexOf(theme) + 1) % order.length]);
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ja' : 'en');
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <div className="page page--auth">
      <div className="auth-page-controls">
        <button className="auth-page-btn" onClick={toggleLanguage} aria-label={t('settings.display.language')}>
          <Globe size={18} />
          <span>{i18n.language === 'en' ? 'EN' : 'JP'}</span>
        </button>
        <button className="auth-page-btn" onClick={cycleTheme} aria-label={t('settings.display.theme')}>
          <ThemeIcon size={18} />
        </button>
      </div>
      <div className="auth-container">
        <h1 className="auth-title">customFlow</h1>
        <p className="auth-subtitle">
          {view === 'login' && t('auth.login')}
          {view === 'signup' && t('auth.signup')}
          {view === 'forgot' && t('auth.resetPassword')}
          {view === 'verify' && t('auth.verifyEmail')}
        </p>
        {view === 'login' && (
          <LoginForm
            onSwitchToSignup={() => setView('signup')}
            onSwitchToForgot={() => setView('forgot')}
          />
        )}
        {view === 'signup' && (
          <RegisterForm
            onSwitchToLogin={() => setView('login')}
            onSignupSuccess={() => setView('verify')}
          />
        )}
        {view === 'forgot' && (
          <ForgotPasswordForm onSwitchToLogin={() => setView('login')} />
        )}
        {view === 'verify' && (
          <EmailVerification onSwitchToLogin={() => setView('login')} />
        )}
      </div>
    </div>
  );
}
