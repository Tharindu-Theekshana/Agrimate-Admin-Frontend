import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { apiErrorMessage } from '@/api/api';
import { adminApi } from '@/service/adminService';
import type { Analytics as AnalyticsData } from '@/api/types';
import { diseaseColor, prettify } from '@/lib/format';

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: accent ?? 'var(--ink)', marginTop: 6 }}>{value}</div>
    </div>
  );
}

export function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    adminApi.analytics().then(setData).catch((e) => toast.error(apiErrorMessage(e)));
  }, []);

  if (!data) return <div className="card">Loading…</div>;

  const diseaseData = Object.entries(data.scansByDisease).map(([key, value]) => ({
    key,
    name: prettify(key),
    value,
  }));
  const trendData = data.weeklyTrend.map((w) => ({ name: w.weekStart.slice(5), scans: w.scans }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <StatCard label="Total scans" value={data.totalScans} accent="var(--primary)" />
        <StatCard label="Total users" value={data.totalUsers} />
        <StatCard label="Farmers" value={data.totalFarmers} />
        <StatCard label="Pending agronomists" value={data.pendingAgronomists} accent="var(--warning)" />
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: 320 }}>
          <h3 style={{ marginTop: 0 }}>Detections by disease</h3>
          {diseaseData.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
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
        </div>

        <div className="card" style={{ flex: 1, minWidth: 320 }}>
          <h3 style={{ marginTop: 0 }}>Weekly scan trend</h3>
          {trendData.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="scans" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function Empty() {
  return <div style={{ color: 'var(--ink-faint)', padding: '40px 0', textAlign: 'center' }}>No data yet</div>;
}
