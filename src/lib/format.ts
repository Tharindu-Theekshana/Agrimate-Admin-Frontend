import { API_BASE_URL } from '@/constant/serviceConstant';

export function resolveImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return url.replace(/https?:\/\/(localhost|127\.0\.0\.1):(8080|8081|8082)/, API_BASE_URL);
}

const DISEASE_COLORS: Record<string, string> = {
  rice_blast: '#A32D2D',
  bacterial_leaf_blight: '#BA7517',
  brown_spot: '#8a6d1f',
  tungro: '#7b3fb0',
  healthy: '#2C5F2D',
};

export function diseaseColor(key: string): string {
  return DISEASE_COLORS[key] ?? '#2B6CB0';
}

export function prettify(key: string): string {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
