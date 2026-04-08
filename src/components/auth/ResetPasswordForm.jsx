import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updatePassword } from '../../services/authService';
import './AuthForms.css';

export default function ResetPasswordForm({ onDone }) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
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
        <div className="auth-success">Password updated successfully!</div>
        <button className="auth-submit" onClick={onDone}>
          {t('common.done')}
        </button>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}
      <div className="auth-field">
        <label htmlFor="new-password">{t('auth.password')}</label>
        <input
          id="new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          autoFocus
        />
      </div>
      <div className="auth-field">
        <label htmlFor="confirm-new-password">{t('auth.confirmPassword')}</label>
        <input
          id="confirm-new-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      <button className="auth-submit" type="submit" disabled={loading}>
        {loading ? t('common.loading') : t('auth.resetPassword')}
      </button>
    </form>
  );
}
