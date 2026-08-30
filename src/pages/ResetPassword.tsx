import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { apiErrorMessage } from '@/api/api';
import logo from '@/assets/logo.png';
import * as authService from '@/service/authService';
import { confirmPasswordResetThunk } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const RESEND_COOLDOWN_SECONDS = 15;

interface LocationState {
  email?: string;
}

export function ResetPassword() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((s) => !!s.auth.user && !!s.auth.accessToken);
  const email = (location.state as LocationState | null)?.email ?? '';

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  if (!email) return <Navigate to={isAuthenticated ? '/' : '/forgot-password'} replace />;

  async function onResend() {
    setError('');
    setResending(true);
    try {
      await authService.requestPasswordReset(email);
      toast.success('A new code has been sent to ' + email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setResending(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (code.trim().length !== 6) {
      setError('Enter the 6-digit code sent to your email');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await dispatch(
        confirmPasswordResetThunk({ email, code: code.trim(), newPassword }),
      ).unwrap();
      toast.success('Password changed successfully');
      navigate('/', { replace: true });
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <form onSubmit={onSubmit} className="card" style={{ width: 380, maxWidth: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src={logo} alt="AgriMate" style={{ width: 64, height: 64, margin: '0 auto', display: 'block' }} />
          <h2 style={{ margin: '12px 0 2px' }}>{isAuthenticated ? 'Change password' : 'Reset password'}</h2>
          <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 14 }}>
            Enter the code sent to <strong>{email}</strong>
          </p>
        </div>

        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>Verification code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          style={{
            width: '100%',
            margin: '6px 0 8px',
            textAlign: 'center',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 8,
          }}
        />

        <div style={{ textAlign: 'right', marginBottom: 14 }}>
          <button
            type="button"
            onClick={onResend}
            disabled={cooldown > 0 || resending}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: 12,
              color: cooldown > 0 ? 'var(--ink-faint)' : 'var(--primary)',
              cursor: cooldown > 0 || resending ? 'default' : 'pointer',
            }}>
            {resending ? 'Sending…' : cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </button>
        </div>

        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          style={{ width: '100%', margin: '6px 0 14px' }}
        />

        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>Confirm new password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          style={{ width: '100%', margin: '6px 0 14px' }}
        />

        {error && <div style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 12 }}>{error}</div>}

        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Saving…' : 'Set new password'}
        </button>
      </form>
    </div>
  );
}
