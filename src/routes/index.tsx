import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { AdminLayout } from './admin/AdminLayout';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Import admin pages directly
import DashboardPage from './admin/pages/DashboardPage';
import UsersPage from './admin/pages/UsersPage';
import ContentPage from './admin/pages/ContentPage';
import CategoriesPage from './admin/pages/CategoriesPage';
import SettingsPage from './admin/pages/SettingsPage';
import SEOPage from './admin/pages/SEOPage';
import AdsPage from './admin/pages/AdsPage';
import OAuthSettingsPage from './admin/pages/OAuthSettingsPage';
import PagesPage from './admin/pages/PagesPage';

// Lazy load main app pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const TagPage = React.lazy(() => import('./pages/TagPage'));
const ExplorePage = React.lazy(() => import('./pages/ExplorePage'));
const DownloadPage = React.lazy(() => import('./pages/DownloadPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const CopyrightPage = React.lazy(() => import('./pages/CopyrightPage'));
const TrendingPage = React.lazy(() => import('./pages/TrendingPage'));
const CategoriesListPage = React.lazy(() => import('./pages/CategoriesListPage'));
const XMLSitemapPage = React.lazy(() => import('./pages/XMLSitemapPage'));

function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1b2e] to-[#16172b] flex items-center justify-center p-4">
      <div className="bg-[#1a1b2e]/50 rounded-3xl border border-red-500/20 p-8 max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-gray-300 mb-4">The page you're looking for doesn't exist or has been moved.</p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full hover:opacity-90 transition-all"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: withSuspense(HomePage) },
      { path: 'search', element: withSuspense(SearchPage) },
      { path: 'tag/:tag', element: withSuspense(TagPage) },
      { path: 'categories', element: withSuspense(CategoriesListPage) },
      { path: 'explore/:category', element: withSuspense(ExplorePage) },
      { path: ':slug', element: withSuspense(DownloadPage) },
      { path: 'profile/:id', element: withSuspense(ProfilePage) },
      { path: 'chat', element: withSuspense(ChatPage) },
      { path: 'trending', element: withSuspense(TrendingPage) },
      { path: 'about', element: withSuspense(AboutPage) },
      { path: 'copyright', element: withSuspense(CopyrightPage) },
      { path: 'sitemap.xml', element: withSuspense(XMLSitemapPage) }
    ]
  },
  {
    path: '/auth',
    element: withSuspense(AuthPage)
  },
  {
    path: '/reset-password',
    element: withSuspense(ResetPasswordPage)
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'content', element: <ContentPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'seo', element: <SEOPage /> },
      { path: 'ads', element: <AdsPage /> },
      { path: 'oauth', element: <OAuthSettingsPage /> },
      { path: 'pages', element: <PagesPage /> }
    ]
  }
]);

export default router;