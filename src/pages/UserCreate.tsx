import { ShieldPlus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { apiErrorMessage } from '@/api/api';
import { createAdmin, requestRegisterOtp } from '@/service/authService';

export function UserCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'otp'>('form');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [code, setCode] = useState('');

  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);

  async function sendCode() {
    if (!username.trim() || !email.trim() || !name.trim() || password.length < 6) {
      toast.error('Fill username, email, name, and a password of at least 6 characters');
      return;
    }
    setSending(true);
    try {
      await requestRegisterOtp(username.trim(), email.trim());
      toast.success(`Verification code sent to ${email.trim()}`);
      setStep('otp');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  function requestCode(e: React.FormEvent) {
    e.preventDefault();
    void sendCode();
  }

  async function confirmCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Enter the verification code');
      return;
    }
    setSaving(true);
    try {
      const created = await createAdmin({
        username: username.trim(),
        email: email.trim(),
        password,
        name: name.trim(),
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        code: code.trim(),
      });
      toast.success(`Admin account created for ${created.name}`);
      navigate('/users');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (step === 'otp') {
    return (
      <form onSubmit={confirmCreate} className="card" style={{ maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <ShieldPlus size={20} color="var(--primary)" />
          <h3 style={{ margin: 0 }}>Verify email</h3>
        </div>
        <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0 }}>
          Enter the code sent to <strong>{email.trim()}</strong> to finish creating this admin account.
        </p>

        <label style={lbl}>Verification code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ ...inp, fontSize: 20, letterSpacing: 6, textAlign: 'center' }}
          placeholder="123456"
          maxLength={6}
          inputMode="numeric"
          autoFocus
        />

        <button type="submit" className="btn" disabled={saving} style={{ width: '100%', marginTop: 8 }}>
          {saving ? 'Creating…' : 'Verify & Create Admin'}
        </button>
        <button
          type="button"
          className="secondary"
          disabled={sending}
          style={{ width: '100%', marginTop: 10 }}
          onClick={() => void sendCode()}>
          {sending ? 'Resending…' : 'Resend code'}
        </button>
        <button type="button" className="secondary" style={{ width: '100%', marginTop: 10 }} onClick={() => setStep('form')}>
          Edit details
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={requestCode} className="card" style={{ maxWidth: 480 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <UserPlus size={20} color="var(--primary)" />
        <h3 style={{ margin: 0 }}>Create admin account</h3>
      </div>

      <label style={lbl}>Username</label>
      <input value={username} onChange={(e) => setUsername(e.target.value)} style={inp} autoComplete="off" />

      <label style={lbl}>Email</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} autoComplete="off" />

      <label style={lbl}>Full name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} style={inp} />

      <label style={lbl}>Password</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inp} placeholder="At least 6 characters" />

      <label style={lbl}>Phone (optional)</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inp} />

      <label style={lbl}>Location (optional)</label>
      <input value={location} onChange={(e) => setLocation(e.target.value)} style={inp} />

      <button type="submit" className="btn" disabled={sending} style={{ width: '100%', marginTop: 8 }}>
        {sending ? 'Sending code…' : 'Send Verification Code'}
      </button>
    </form>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 };
const inp: React.CSSProperties = { width: '100%', marginBottom: 14 };
