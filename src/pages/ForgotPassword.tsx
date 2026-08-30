import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';

import { apiErrorMessage } from '@/api/api';
import logo from '@/assets/logo.png';
import * as authService from '@/service/authService';
import { useAppSelector } from '@/store/hooks';

export function ForgotPassword() {
  const isAuthenticated = useAppSelector((s) => !!s.auth.user && !!s.auth.accessToken);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your email address');
      return;
    }
    setLoading(true);
    try {
      await authService.requestPasswordReset(trimmed);
      navigate('/reset-password', { state: { email: trimmed }, replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <form onSubmit={onSubmit} className="card" style={{ width: 360, maxWidth: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src={logo} alt="AgriMate" style={{ width: 64, height: 64, margin: '0 auto', display: 'block' }} />
          <h2 style={{ margin: '12px 0 2px' }}>Forgot password</h2>
          <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 14 }}>
            We'll email a verification code to reset it
          </p>
        </div>

        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          style={{ width: '100%', margin: '6px 0 14px' }}
        />

        {error && <div style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 12 }}>{error}</div>}

        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Sending code…' : 'Send verification code'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
