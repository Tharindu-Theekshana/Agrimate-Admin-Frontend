import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { apiErrorMessage } from '@/api/api';
import { adminApi } from '@/service/adminService';
import type { News as NewsItem } from '@/api/types';
import { formatDate, resolveImageUrl } from '@/lib/format';

export function NewsList() {
  const [items, setItems] = useState<NewsItem[]>([]);

  function load() {
    adminApi.news().then(setItems).catch((e) => toast.error(apiErrorMessage(e)));
  }
  useEffect(load, []);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--ink-soft)', fontSize: 14 }}>{items.length} published</span>
        <Link to="/news/new" className="btn">
          <Plus size={16} /> Publish news
        </Link>
      </div>

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
