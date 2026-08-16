import { BarChart3, Bell, type LucideIcon, Map as MapIcon, Newspaper, Users } from 'lucide-react';

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
  {
    label: 'Monitoring',
    icon: MapIcon,
    children: [
      { label: 'Outbreak Map', to: '/' },
      { label: 'Analytics', to: '/analytics' },
    ],
  },
  {
    label: 'Management',
    icon: Users,
    children: [
      { label: 'Users', to: '/users' },
      { label: 'News', to: '/news' },
      { label: 'Send Notification', to: '/notifications' },
    ],
  },
];

export const routeIcons: Record<string, LucideIcon> = {
  '/': MapIcon,
  '/analytics': BarChart3,
  '/users': Users,
  '/news': Newspaper,
  '/notifications': Bell,
};

export default nav;
