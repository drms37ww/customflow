import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { signIn } from '../../services/authService';
import './AuthForms.css';

export default function LoginForm({ onSwitchToSignup, onSwitchToForgot }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}
      <div className="auth-field">
        <label htmlFor="login-email">{t('auth.email')}</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="auth-field">
        <label htmlFor="login-password">{t('auth.password')}</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      <div className="auth-forgot">
        <button type="button" onClick={onSwitchToForgot}>
          {t('auth.forgotPassword')}
        </button>
      </div>
      <button className="auth-submit" type="submit" disabled={loading}>
        {loading ? t('common.loading') : t('auth.login')}
      </button>
      <div className="auth-switch">
        {t('auth.noAccount')}{' '}
        <button type="button" onClick={onSwitchToSignup}>
          {t('auth.signup')}
        </button>
      </div>
    </form>
  );
}
