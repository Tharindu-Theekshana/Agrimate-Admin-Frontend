import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { apiErrorMessage } from '@/api/api';
import { adminApi } from '@/service/adminService';
import type { AgronomistStatus, User } from '@/api/types';

const ROLE_FILTERS = ['', 'FARMER', 'AGRONOMIST', 'ADMIN'];

const STATUS_COLOR: Record<string, string> = {
  APPROVED: 'var(--primary)',
  PENDING: 'var(--warning)',
  REJECTED: 'var(--danger)',
  NONE: 'var(--ink-faint)',
};

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState('');
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(() => {
    adminApi.users(role || undefined).then(setUsers).catch((e) => toast.error(apiErrorMessage(e)));
  }, [role]);

  useEffect(() => load(), [load]);

  async function update(id: number, body: { agronomistStatus?: AgronomistStatus; suspended?: boolean }) {
    setBusy(id);
    try {
      const updated = await adminApi.updateUser(id, body);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success('User updated');
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLE_FILTERS.map((r) => (
            <option key={r} value={r}>
              {r || 'All roles'}
            </option>
          ))}
        </select>
        <span style={{ color: 'var(--ink-soft)', fontSize: 14 }}>{users.length} users</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Location</th>
              <th>Agronomist status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ opacity: u.suspended ? 0.5 : 1 }}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td>{u.phone}</td>
                <td>{u.role}</td>
                <td>{u.location ?? '—'}</td>
                <td>
                  {u.role === 'AGRONOMIST' ? (
                    <span className="badge" style={{ background: `${STATUS_COLOR[u.agronomistStatus]}1a`, color: STATUS_COLOR[u.agronomistStatus] }}>
                      <span className="dot" style={{ background: STATUS_COLOR[u.agronomistStatus] }} />
                      {u.agronomistStatus}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {u.role === 'AGRONOMIST' && u.agronomistStatus === 'PENDING' && (
                      <>
                        <button className="btn" disabled={busy === u.id} onClick={() => update(u.id, { agronomistStatus: 'APPROVED' })}>
                          Approve
                        </button>
                        <button className="secondary" disabled={busy === u.id} onClick={() => update(u.id, { agronomistStatus: 'REJECTED' })}>
                          Reject
                        </button>
                      </>
                    )}
                    {u.role !== 'ADMIN' && (
                      <button
                        className="secondary"
                        disabled={busy === u.id}
                        style={u.suspended ? undefined : { background: '#fbe9e9', color: 'var(--danger)' }}
                        onClick={() => update(u.id, { suspended: !u.suspended })}>
                        {u.suspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
