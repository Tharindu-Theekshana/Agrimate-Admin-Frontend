import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { apiErrorMessage } from '@/api/client';
import { adminApi } from '@/api/endpoints';
import type { News as NewsItem } from '@/api/types';
import { formatDate, resolveImageUrl } from '@/lib/format';

export function News() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function load() {
    adminApi.news().then(setItems).catch((e) => toast.error(apiErrorMessage(e)));
  }
  useEffect(load, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSaving(true);
    try {
      await adminApi.createNews(title.trim(), description.trim(), image);
      toast.success('News published and broadcast to all users');
      setTitle('');
      setDescription('');
      setImage(null);
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this news item?')) return;
    try {
      await adminApi.deleteNews(id);
      setItems((prev) => prev.filter((n) => n.id !== id));
      toast.success('News deleted');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: 24, alignItems: 'start' }}>
      <form onSubmit={submit} className="card">
        <h3 style={{ marginTop: 0 }}>Publish news</h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0 }}>
          Sent to every user's notification inbox and shown in the app home feed.
        </p>
        <label style={lbl}>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={inp} placeholder="e.g. Brown spot outbreak in North Central" />
        <label style={lbl}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inp, minHeight: 110, resize: 'vertical' }} placeholder="Write the announcement…" />
        <label style={lbl}>Image (optional)</label>
        <label className="secondary" style={{ display: 'inline-flex', cursor: 'pointer', marginBottom: 14 }}>
          <ImageIcon size={16} /> {image ? image.name : 'Choose image'}
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
        </label>
        <button type="submit" className="btn" disabled={saving} style={{ width: '100%' }}>
          <Plus size={16} /> {saving ? 'Publishing…' : 'Publish'}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.length === 0 && <div className="card" style={{ color: 'var(--ink-faint)' }}>No news yet.</div>}
        {items.map((n) => (
          <div key={n.id} className="card" style={{ display: 'flex', gap: 0, padding: 0, overflow: 'hidden' }}>
            {n.imageUrl && <img src={resolveImageUrl(n.imageUrl)} alt="" style={{ width: 130, height: 110, objectFit: 'cover' }} />}
            <div style={{ flex: 1, padding: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{formatDate(n.createdAt)}</div>
              <div style={{ fontWeight: 800, margin: '2px 0 4px' }}>{n.title}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{n.description}</div>
            </div>
            <button className="ghost" onClick={() => remove(n.id)} style={{ color: 'var(--danger)', alignSelf: 'flex-start', margin: 10 }} title="Delete">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 };
const inp: React.CSSProperties = { width: '100%', marginBottom: 14 };
