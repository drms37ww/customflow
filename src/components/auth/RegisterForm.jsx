import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { signUp } from '../../services/authService';
import './AuthForms.css';

export default function RegisterForm({ onSwitchToLogin, onSignupSuccess }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      onSignupSuccess?.();
    } catch (err) {
      setError(err.message || t('auth.signupError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}
      <div className="auth-field">
        <label htmlFor="reg-email">{t('auth.email')}</label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="auth-field">
        <label htmlFor="reg-password">{t('auth.password')}</label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      <div className="auth-field">
        <label htmlFor="reg-confirm">{t('auth.confirmPassword')}</label>
        <input
          id="reg-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      <button className="auth-submit" type="submit" disabled={loading}>
        {loading ? t('common.loading') : t('auth.signup')}
      </button>
      <div className="auth-switch">
        {t('auth.hasAccount')}{' '}
        <button type="button" onClick={onSwitchToLogin}>
          {t('auth.login')}
        </button>
      </div>
    </form>
  );
}
