import {
  ArrowRight,
  Check,
  Newspaper,
  ScanLine,
  Sprout,
  UserCheck,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';

import { apiErrorMessage } from '@/api/api';
import { adminApi } from '@/service/adminService';
import type { Analytics, News, OutbreakPoint, User } from '@/api/types';
import { diseaseColor, formatDate, prettify, resolveImageUrl } from '@/lib/format';

const SRI_LANKA: [number, number] = [7.8731, 80.7718];

function StatCard({
  label,
  value,
  accent,
  Icon,
}: {
  label: string;
  value: number;
  accent?: string;
  Icon: typeof ScanLine;
}) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          borderRadius: 12,
          flexShrink: 0,
          background: `${accent ?? 'var(--primary)'}1a`,
          color: accent ?? 'var(--primary)',
        }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 340, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div style={{ color: 'var(--ink-faint)', padding: '28px 0', textAlign: 'center', fontSize: 13 }}>{text}</div>;
}

export function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [outbreaks, setOutbreaks] = useState<OutbreakPoint[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [pending, setPending] = useState<User[]>([]);
  const [busy, setBusy] = useState<number | null>(null);

  function load() {
    adminApi.analytics().then(setAnalytics).catch((e) => toast.error(apiErrorMessage(e)));
    adminApi.outbreaks(undefined, 7).then(setOutbreaks).catch(() => undefined);
    adminApi.news().then((list) => setNews(list.slice(0, 3))).catch(() => undefined);
    adminApi
      .users('AGRONOMIST')
      .then((list) => setPending(list.filter((u) => u.agronomistStatus === 'PENDING')))
      .catch(() => undefined);
  }
  useEffect(load, []);

  async function decide(id: number, agronomistStatus: 'APPROVED' | 'REJECTED') {
    setBusy(id);
    try {
      await adminApi.updateUser(id, { agronomistStatus });
      setPending((prev) => prev.filter((u) => u.id !== id));
      toast.success(agronomistStatus === 'APPROVED' ? 'Agronomist approved' : 'Agronomist rejected');
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const diseaseData = analytics
    ? Object.entries(analytics.scansByDisease).map(([key, value]) => ({ key, name: prettify(key), value }))
    : [];
  const trendData = analytics ? analytics.weeklyTrend.map((w) => ({ name: w.weekStart.slice(5), scans: w.scans })) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <StatCard label="Total scans" value={analytics?.totalScans ?? 0} accent="var(--primary)" Icon={ScanLine} />
        <StatCard label="Total users" value={analytics?.totalUsers ?? 0} accent="#2B6CB0" Icon={UsersIcon} />
        <StatCard label="Farmers" value={analytics?.totalFarmers ?? 0} accent="#2C5F2D" Icon={Sprout} />
        <StatCard
          label="Pending agronomists"
          value={analytics?.pendingAgronomists ?? 0}
          accent="var(--warning)"
          Icon={UserCheck}
        />
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <SectionCard
          title="Outbreaks - last 7 days"
          action={
            <Link to="/outbreaks" className="ghost" style={{ fontSize: 13 }}>
              Full map <ArrowRight size={14} />
            </Link>
          }>
          {outbreaks.length === 0 ? (
            <Empty text="No geo-tagged scans in the last 7 days" />
          ) : (
            <div style={{ borderRadius: 12, overflow: 'hidden', height: 260 }}>
              <MapContainer center={SRI_LANKA} zoom={7} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {outbreaks.map((p) => (
                  <CircleMarker
                    key={p.scanId}
                    center={[p.latitude, p.longitude]}
                    radius={7}
                    pathOptions={{ color: '#ffffff', weight: 2, fillColor: diseaseColor(p.disease), fillOpacity: 0.9 }}
                  />
                ))}
              </MapContainer>
            </div>
          )}
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--ink-soft)' }}>
            {outbreaks.length} detection{outbreaks.length === 1 ? '' : 's'} this week
          </div>
        </SectionCard>

        <SectionCard title="Needs attention">
          {pending.length === 0 ? (
            <Empty text="No pending agronomist approvals" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pending.map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'var(--surface-alt)',
                  }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{u.phone}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="ghost" disabled={busy === u.id} style={{ color: 'var(--primary)' }} onClick={() => decide(u.id, 'APPROVED')} title="Approve">
                      <Check size={16} />
                    </button>
                    <button className="ghost" disabled={busy === u.id} style={{ color: 'var(--danger)' }} onClick={() => decide(u.id, 'REJECTED')} title="Reject">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <SectionCard title="Detections by disease">
          {diseaseData.length === 0 ? (
            <Empty text="No data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={diseaseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {diseaseData.map((d) => (
                    <Cell key={d.key} fill={diseaseColor(d.key)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Weekly scan trend">
          {trendData.length === 0 ? (
            <Empty text="No data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="scans" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <SectionCard
          title="Latest news"
          action={
            <Link to="/news/new" className="ghost" style={{ fontSize: 13 }}>
              Publish <ArrowRight size={14} />
            </Link>
          }>
          {news.length === 0 ? (
            <Empty text="No news published yet" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {news.map((n) => (
                <div key={n.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  {n.imageUrl ? (
                    <img src={resolveImageUrl(n.imageUrl)} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--pale)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Newspaper size={18} />
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{formatDate(n.createdAt)}</div>
                  </div>
                </div>
              ))}
              <Link to="/news" className="ghost" style={{ fontSize: 13, alignSelf: 'flex-start', marginTop: 4 }}>
                Manage news <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
