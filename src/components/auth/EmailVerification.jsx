import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import './AuthForms.css';

export default function EmailVerification({ onSwitchToLogin }) {
  const { t } = useTranslation();

  return (
    <div className="auth-form" style={{ alignItems: 'center', textAlign: 'center' }}>
      <Mail size={48} color="var(--color-accent)" />
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>
        {t('auth.verifyEmail')}
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
        {t('auth.verifyEmailMessage')}
      </p>
      <div className="auth-switch">
        <button type="button" onClick={onSwitchToLogin}>
          {t('common.back')} {t('auth.login')}
        </button>
      </div>
    </div>
  );
}
