import { lazy } from 'react';

export interface AppRoute {
  path: string;
  element: React.LazyExoticComponent<React.ComponentType>;
}

// Lazy-loaded pages (named exports adapted to default for React.lazy).
const routes: AppRoute[] = [
  { path: '/', element: lazy(() => import('@/pages/OutbreakMap').then((m) => ({ default: m.OutbreakMap }))) },
  { path: '/analytics', element: lazy(() => import('@/pages/Analytics').then((m) => ({ default: m.Analytics }))) },
  { path: '/users', element: lazy(() => import('@/pages/Users').then((m) => ({ default: m.Users }))) },
  { path: '/news', element: lazy(() => import('@/pages/News').then((m) => ({ default: m.News }))) },
  { path: '/notifications', element: lazy(() => import('@/pages/Notifications').then((m) => ({ default: m.Notifications }))) },
];

export default routes;
