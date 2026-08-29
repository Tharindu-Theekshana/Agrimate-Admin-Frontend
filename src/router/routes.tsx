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

const Dashboard = namedLazy(() => import('../pages/Dashboard'), 'Dashboard');
const OutbreakMap = namedLazy(() => import('../pages/OutbreakMap'), 'OutbreakMap');
const Users = namedLazy(() => import('../pages/Users'), 'Users');
const UserCreate = namedLazy(() => import('../pages/UserCreate'), 'UserCreate');
const NewsList = namedLazy(() => import('../pages/NewsList'), 'NewsList');
const NewsCreate = namedLazy(() => import('../pages/NewsCreate'), 'NewsCreate');
const Notifications = namedLazy(() => import('../pages/Notifications'), 'Notifications');

const routes: AppRoute[] = [
  { path: '/', element: Dashboard },
  { path: '/outbreaks', element: OutbreakMap },
  { path: '/users', element: Users },
  { path: '/users/new', element: UserCreate },
  { path: '/news', element: NewsList },
  { path: '/news/new', element: NewsCreate },
  { path: '/notifications', element: Notifications },
];

export default routes;
