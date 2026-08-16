import React from 'react';

export interface AppRoute {
  path: string;
  element: React.LazyExoticComponent<() => React.JSX.Element>;
}

function namedLazy<T extends string>(
  loader: () => Promise<Record<T, () => React.JSX.Element>>,
  name: T,
) {
  return React.lazy(() => loader().then((m) => ({ default: m[name] })));
}

const OutbreakMap = namedLazy(() => import('../pages/OutbreakMap'), 'OutbreakMap');
const Analytics = namedLazy(() => import('../pages/Analytics'), 'Analytics');
const Users = namedLazy(() => import('../pages/Users'), 'Users');
const News = namedLazy(() => import('../pages/News'), 'News');
const Notifications = namedLazy(() => import('../pages/Notifications'), 'Notifications');

const routes: AppRoute[] = [
  { path: '/', element: OutbreakMap },
  { path: '/analytics', element: Analytics },
  { path: '/users', element: Users },
  { path: '/news', element: News },
  { path: '/notifications', element: Notifications },
];

export default routes;
