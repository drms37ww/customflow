import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '../../services/authService';
import './AuthForms.css';

export default function ForgotPasswordForm({ onSwitchToLogin }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-form">
        <div className="auth-success">{t('auth.verifyEmailMessage')}</div>
        <div className="auth-switch">
          <button type="button" onClick={onSwitchToLogin}>
            {t('common.back')} {t('auth.login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}
      <div className="auth-field">
        <label htmlFor="forgot-email">{t('auth.email')}</label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <button className="auth-submit" type="submit" disabled={loading}>
        {loading ? t('common.loading') : t('auth.resetPassword')}
      </button>
      <div className="auth-switch">
        <button type="button" onClick={onSwitchToLogin}>
          {t('common.back')} {t('auth.login')}
        </button>
      </div>
    </form>
  );
}
