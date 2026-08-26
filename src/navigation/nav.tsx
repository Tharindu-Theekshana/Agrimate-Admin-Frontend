import { Bell, LayoutDashboard, type LucideIcon, Map as MapIcon, Newspaper, Plus, Users } from 'lucide-react';

export interface NavChild {
  label: string;
  to: string;
}
export interface NavItem {
  label: string;
  to?: string;
  icon: LucideIcon;
  children?: NavChild[];
}

const nav: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Outbreak Map', to: '/outbreaks', icon: MapIcon },
  {
    label: 'Management',
    icon: Users,
    children: [
      { label: 'Users', to: '/users' },
      { label: 'News', to: '/news' },
      { label: 'Add News', to: '/news/new' },
      { label: 'Send Notification', to: '/notifications' },
    ],
  },
];

export const routeIcons: Record<string, LucideIcon> = {
  '/': LayoutDashboard,
  '/outbreaks': MapIcon,
  '/users': Users,
  '/news': Newspaper,
  '/news/new': Plus,
  '/notifications': Bell,
};

export default nav;
