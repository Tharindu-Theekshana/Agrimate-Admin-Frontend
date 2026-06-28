import { ChevronDown, Sprout } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';

import nav, { type NavItem } from '@/_nav';
import { useAppSelector } from '@/store/hooks';

function initials(name = '') {
  return name.trim().slice(0, 2).toUpperCase() || 'AD';
}

export default function Sidebar() {
  const collapsed = !useAppSelector((s) => s.ui.sidebarOpen);
  const user = useAppSelector((s) => s.auth.user);

  return (
    <aside
      className={clsx(
        'relative flex h-full flex-col border-r border-border bg-surface transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-60',
      )}>
      {/* Brand */}
      <div className="flex h-[60px] shrink-0 items-center gap-3 border-b border-border px-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
          <Sprout size={18} strokeWidth={2} className="text-white" />
        </div>
        {!collapsed && (
          <span className="truncate text-[15px] font-extrabold tracking-tight text-ink">
            Agri<span className="text-primary">Mate</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-2.5">
        {nav.map((item) =>
          item.children ? (
            <NavGroup key={item.label} item={item} collapsed={collapsed} />
          ) : (
            <NavLeaf key={item.to} to={item.to!} label={item.label} Icon={item.icon} collapsed={collapsed} />
          ),
        )}
      </nav>

      {/* User */}
      <div className="shrink-0 border-t border-border p-2.5">
        <div className={clsx('flex items-center gap-2.5 rounded-lg px-2 py-2', collapsed && 'justify-center')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-white">
            {initials(user?.name)}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink">{user?.name ?? 'Admin'}</p>
              <p className="truncate text-[11px] text-ink-faint">Administrator</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function NavLeaf({
  to,
  label,
  Icon,
  collapsed,
}: {
  to: string;
  label: string;
  Icon: NavItem['icon'];
  collapsed: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        clsx(
          'relative flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-all',
          isActive ? 'bg-pale text-primary' : 'text-ink-soft hover:bg-surface-alt hover:text-ink',
        )
      }>
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-r-full bg-primary" />}
          <span
            className={clsx(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
              isActive ? 'bg-primary text-white' : 'bg-surface-alt text-ink-soft',
            )}>
            <Icon size={16} strokeWidth={1.8} />
          </span>
          {!collapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </NavLink>
  );
}

function NavGroup({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const location = useLocation();
  const Icon = item.icon;
  const children = item.children ?? [];
  const hasActiveChild = children.some((c) => (c.to === '/' ? location.pathname === '/' : location.pathname.startsWith(c.to)));
  const [open, setOpen] = useState(hasActiveChild);

  return (
    <div>
      <button
        onClick={() => !collapsed && setOpen((o) => !o)}
        title={collapsed ? item.label : undefined}
        className={clsx(
          'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-all',
          hasActiveChild ? 'text-primary' : 'text-ink-soft hover:bg-surface-alt hover:text-ink',
        )}>
        <span
          className={clsx(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            hasActiveChild ? 'bg-pale text-primary' : 'bg-surface-alt text-ink-soft',
          )}>
          <Icon size={16} strokeWidth={1.8} />
        </span>
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left">{item.label}</span>
            <ChevronDown size={14} strokeWidth={2.5} className={clsx('shrink-0 text-ink-faint transition-transform', open && 'rotate-180')} />
          </>
        )}
      </button>

      {open && !collapsed && (
        <div className="mt-0.5 flex flex-col gap-0.5 pl-[34px]">
          {children.map((c) => (
            <NavLink
              key={c.to}
              to={c.to}
              end={c.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 rounded-md py-1.5 pl-3 pr-2.5 text-[13px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-ink-soft hover:bg-surface-alt hover:text-ink',
                )
              }>
              {({ isActive }) => (
                <>
                  <span className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', isActive ? 'bg-primary' : 'bg-border')} />
                  {c.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
