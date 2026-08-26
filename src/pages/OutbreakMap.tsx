import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { toast } from 'sonner';

import { apiErrorMessage } from '@/api/api';
import { adminApi } from '@/service/adminService';
import { diseaseApi } from '@/service/diseaseService';
import type { OutbreakPoint } from '@/api/types';
import { diseaseColor, formatDate, prettify } from '@/lib/format';

const SRI_LANKA: [number, number] = [7.8731, 80.7718];
const DAY_OPTIONS = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
  { label: 'Last year', value: 365 },
];

export function OutbreakMap() {
  const [points, setPoints] = useState<OutbreakPoint[]>([]);
  const [diseases, setDiseases] = useState<{ diseaseKey: string; nameEn: string }[]>([]);
  const [disease, setDisease] = useState('');
  const [days, setDays] = useState(90);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    diseaseApi.list().then(setDiseases).catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    adminApi
      .outbreaks(disease || undefined, days)
      .then(setPoints)
      .catch((e) => toast.error(apiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [disease, days]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of points) m[p.disease] = (m[p.disease] ?? 0) + 1;
    return m;
  }, [points]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={disease} onChange={(e) => setDisease(e.target.value)}>
          <option value="">All diseases</option>
          {diseases
            .filter((d) => d.diseaseKey !== 'healthy')
            .map((d) => (
              <option key={d.diseaseKey} value={d.diseaseKey}>
                {d.nameEn}
              </option>
            ))}
        </select>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
          {DAY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
          {loading ? 'Loading…' : `${points.length} detection${points.length === 1 ? '' : 's'}`}
        </span>
      </div>


      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {Object.entries(counts).map(([key, n]) => (
          <span key={key} className="badge" style={{ background: `${diseaseColor(key)}1a`, color: diseaseColor(key) }}>
            <span className="dot" style={{ background: diseaseColor(key) }} />
            {prettify(key)} · {n}
          </span>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', height: '70vh' }}>
        <MapContainer center={SRI_LANKA} zoom={7} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((p) => (
            <CircleMarker
              key={p.scanId}
              center={[p.latitude, p.longitude]}
              radius={9}
              pathOptions={{ color: '#ffffff', weight: 2, fillColor: diseaseColor(p.disease), fillOpacity: 0.9 }}>
              <Popup>
                <strong>{prettify(p.disease)}</strong>
                <br />
                Confidence: {Math.round(p.confidence * 100)}%
                <br />
                {formatDate(p.createdAt)}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
