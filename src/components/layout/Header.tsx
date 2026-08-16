import {
  ChevronDown,
  Home,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  User,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';

import nav from '@/navigation/nav';
import { logoutThunk } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar, toggleTheme } from '@/store/uiSlice';

function capitalize(s: string) {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const lookup: Record<string, string> = {};
  nav.forEach((item) => {
    if (item.to) lookup[item.to] = item.label;
    item.children?.forEach((c) => (lookup[c.to] = c.label));
  });
  if (pathname === '/') return [{ path: '/', label: lookup['/'] ?? 'Outbreak Map' }];
  const parts = pathname.split('/').filter(Boolean);
  let built = '';
  return parts.map((p) => {
    built += '/' + p;
    return { path: built, label: lookup[built] ?? capitalize(p) };
  });
}

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const theme = useAppSelector((s) => s.ui.theme);
  const collapsed = !useAppSelector((s) => s.ui.sidebarOpen);
  const crumbs = useBreadcrumbs();
  const [showUser, setShowUser] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function onLogout() {
    setShowUser(false);
    await dispatch(logoutThunk());
    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 flex h-[60px] shrink-0 items-center gap-4 border-b border-border bg-surface px-5">
      <button
        onClick={() => dispatch(toggleSidebar())}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-alt text-ink-soft transition-all hover:border-primary hover:text-primary">
        {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
      </button>

      <nav className="flex flex-1 items-center gap-1.5 overflow-hidden">
        <NavLink to="/" className="shrink-0 text-ink-faint transition-colors hover:text-primary">
          <Home size={14} />
        </NavLink>
        {crumbs.map((c, i) => (
          <div key={c.path} className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 text-xs text-ink-faint">›</span>
            {i === crumbs.length - 1 ? (
              <span className="truncate text-[13px] font-semibold text-ink">{c.label}</span>
            ) : (
              <NavLink to={c.path} className="truncate text-[13px] text-ink-faint hover:text-primary">
                {c.label}
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => dispatch(toggleTheme())}
          title="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-alt text-ink-soft transition-all hover:border-primary hover:text-primary">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="h-5 w-px bg-border" />

        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUser((v) => !v)}
            className={clsx(
              'flex items-center gap-2 rounded-xl border py-1 pl-1 pr-2.5 transition-all',
              showUser ? 'border-primary bg-pale' : 'border-border bg-surface-alt hover:border-primary',
            )}>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-white">
              {(user?.name ?? 'AD').slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-[12px] font-semibold leading-tight text-ink">{user?.name ?? 'Admin'}</p>
              <p className="text-[10px] leading-tight text-ink-faint">Administrator</p>
            </div>
            <ChevronDown size={12} strokeWidth={2.5} className={clsx('hidden text-ink-faint transition-transform md:block', showUser && 'rotate-180')} />
          </button>

          {showUser && (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-surface py-1.5 shadow-lg">
              <div className="border-b border-border px-4 py-2.5">
                <p className="truncate text-[13px] font-semibold text-ink">{user?.username}</p>
                <p className="mt-0.5 text-[11px] text-ink-faint">{user?.email}</p>
              </div>
              <button className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:bg-surface-alt hover:text-primary">
                <User size={14} /> Profile
              </button>
              <div className="border-t border-border">
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-danger transition-colors hover:bg-surface-alt">
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
