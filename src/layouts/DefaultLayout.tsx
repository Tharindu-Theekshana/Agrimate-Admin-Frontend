import { Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import ErrorBoundary from '@/components/ErrorBoundary';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import PageWrapper from '@/components/layout/PageWrapper';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/router/ProtectedRoute';
import routes from '@/router/routes';
import { useAppSelector } from '@/store/hooks';

const Loader = () => (
  <div className="flex flex-1 items-center justify-center py-20">
    <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

export default function DefaultLayout() {
  const isAuthenticated = useAppSelector((s) => !!s.auth.user && !!s.auth.accessToken);
  const { pathname } = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary key={pathname}>
          <Suspense fallback={<Loader />}>
            <Routes>
              {routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedRoute>
                      <PageWrapper>
                        <route.element />
                      </PageWrapper>
                      <Footer />
                    </ProtectedRoute>
                  }
                />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
