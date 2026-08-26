import { Image as ImageIcon, Newspaper, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { apiErrorMessage } from '@/api/api';
import { adminApi } from '@/service/adminService';

export function NewsCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSaving(true);
    try {
      await adminApi.createNews(title.trim(), description.trim(), image);
      toast.success('News published and broadcast to all users');
      navigate('/news');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Newspaper size={20} color="var(--primary)" />
        <h3 style={{ margin: 0 }}>Publish news</h3>
      </div>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0 }}>
        Sent to every user's notification inbox and shown in the app home feed.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginTop: 10 }}>
        <div>
          <label style={lbl}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={inp} placeholder="e.g. Brown spot outbreak in North Central" />

          <label style={lbl}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inp, minHeight: 220, resize: 'vertical' }}
            placeholder="Write the announcement…"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={lbl}>Image (optional)</label>
          <label
            className="secondary"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              flex: 1,
              minHeight: 0,
              border: '1px dashed var(--border)',
              borderRadius: 12,
              overflow: 'hidden',
              padding: imagePreview ? 0 : 16,
              background: 'transparent',
            }}>
            {imagePreview ? (
              <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <ImageIcon size={22} />
                <span>Choose image</span>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <button type="submit" className="btn" disabled={saving} style={{ width: '100%', marginTop: 20 }}>
        <Send size={16} /> {saving ? 'Publishing…' : 'Publish'}
      </button>
    </form>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 };
const inp: React.CSSProperties = { width: '100%', marginBottom: 14 };
