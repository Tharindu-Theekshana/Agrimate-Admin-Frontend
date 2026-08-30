import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { apiErrorMessage } from '@/api/api';
import { adminApi } from '@/service/adminService';

export function UserCreate() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !name.trim()) {
      toast.error('Fill username, email, and name');
      return;
    }
    setSaving(true);
    try {
      const created = await adminApi.createAdmin({
        username: username.trim(),
        email: email.trim(),
        name: name.trim(),
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
      });
      toast.success(`Admin account created - login details emailed to ${created.email}`);
      navigate('/users');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="card" style={{ maxWidth: 480 }}>
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

      <label style={lbl}>Phone (optional)</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inp} />

      <label style={lbl}>Location (optional)</label>
      <input value={location} onChange={(e) => setLocation(e.target.value)} style={inp} />

      <button type="submit" className="btn" disabled={saving} style={{ width: '100%', marginTop: 8 }}>
        {saving ? 'Creating…' : 'Create Admin Account'}
      </button>
    </form>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 };
const inp: React.CSSProperties = { width: '100%', marginBottom: 14 };
