import { Bell, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { apiErrorMessage } from '@/api/api';
import { adminApi } from '@/service/adminService';
import type { User } from '@/api/types';
import { SearchableSelect } from '@/components/SearchableSelect';

const TYPES = [
  { value: 'SYSTEM', label: 'System' },
  { value: 'OUTBREAK', label: 'Outbreak alert' },
  { value: 'REMINDER', label: 'Reminder' },
  { value: 'NEWS', label: 'News' },
];

export function Notifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('SYSTEM');
  const [scope, setScope] = useState<'all' | 'one'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<number | ''>('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (scope === 'one' && users.length === 0) {
      adminApi.users().then(setUsers).catch((e) => toast.error(apiErrorMessage(e)));
    }
  }, [scope, users.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (scope === 'one' && !userId) {
      toast.error('Pick a user to notify');
      return;
    }
    setSending(true);
    try {
      const res = await adminApi.broadcast(title.trim(), body.trim(), type, scope === 'one' ? Number(userId) : undefined);
      toast.success(
        scope === 'one' ? 'Sent' : `Sent to ${res.delivered} user${res.delivered === 1 ? '' : 's'}`,
      );
      setTitle('');
      setBody('');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={send} className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Bell size={20} color="var(--primary)" />
        <h3 style={{ margin: 0 }}>Send app notification</h3>
      </div>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0 }}>
        Delivered to the in-app notification inbox (and pushed via FCM where enabled).
      </p>

      <label style={lbl}>Send to</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button
          type="button"
          className={scope === 'all' ? 'btn' : 'secondary'}
          onClick={() => setScope('all')}
          style={{ flex: 1 }}>
          All users
        </button>
        <button
          type="button"
          className={scope === 'one' ? 'btn' : 'secondary'}
          onClick={() => setScope('one')}
          style={{ flex: 1 }}>
          Specific user
        </button>
      </div>

      {scope === 'one' && (
        <div style={{ marginBottom: 14 }}>
          <SearchableSelect
            value={userId}
            onChange={setUserId}
            placeholder="Search by name, email or phone…"
            options={users.map((u) => ({
              value: u.id,
              label: `${u.name} — ${u.role} (${u.phone})`,
              keywords: u.email,
            }))}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginTop: 10 }}>
        <div>
          <label style={lbl}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', marginBottom: 14 }}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label style={lbl}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', marginBottom: 14 }} placeholder="e.g. Scheduled maintenance tonight" />
        </div>
      </div>

      <label style={lbl}>Message</label>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} style={{ width: '100%', minHeight: 220, resize: 'vertical', marginBottom: 16 }} placeholder="Write the notification message…" />

      <button type="submit" className="btn" disabled={sending} style={{ width: '100%' }}>
        <Send size={16} /> {sending ? 'Sending…' : scope === 'one' ? 'Send' : 'Send to all'}
      </button>
    </form>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 };
