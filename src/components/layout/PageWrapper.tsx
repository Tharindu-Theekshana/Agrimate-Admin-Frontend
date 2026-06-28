import { useLocation } from 'react-router-dom';

import nav from '@/_nav';

function capitalize(s: string) {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function usePageTitle() {
  const { pathname } = useLocation();
  const lookup: Record<string, string> = {};
  nav.forEach((item) => {
    if (item.to) lookup[item.to] = item.label;
    item.children?.forEach((c) => (lookup[c.to] = c.label));
  });
  return lookup[pathname] ?? capitalize(pathname.split('/').filter(Boolean).pop() ?? 'Dashboard');
}

/** Title card + content card wrapper around each routed page. */
export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const title = usePageTitle();
  return (
    <div className="flex min-h-full flex-col gap-1.5 bg-background px-3 py-3">
      <div className="rounded-2xl border border-border bg-surface px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="h-8 w-1 shrink-0 rounded-full" style={{ background: 'linear-gradient(180deg,var(--primary),var(--primary-deep))' }} />
          <h1 className="text-xl font-bold tracking-tight text-ink">{title}</h1>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-surface shadow-sm">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
