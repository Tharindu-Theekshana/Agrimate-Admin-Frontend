import { Sprout } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '@/auth/useAuth';

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <form onSubmit={onSubmit} className="card" style={{ width: 360, maxWidth: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--pale)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
            <Sprout size={30} color="var(--primary)" />
          </div>
          <h2 style={{ margin: '12px 0 2px' }}>AgriMate Admin</h2>
          <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 14 }}>Outbreak monitoring & management</p>
        </div>

        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>Username or email</label>
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="admin"
          autoComplete="username"
          style={{ width: '100%', margin: '6px 0 14px' }}
        />
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={{ width: '100%', margin: '6px 0 14px' }}
        />

        {error && <div style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 12 }}>{error}</div>}

        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
