import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { GenerateImagePage } from '@/pages/images/GenerateImagePage';
import { ExplorePage } from '@/pages/images/ExplorePage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { NotFoundPage } from '@/pages/misc/NotFoundPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <ExplorePage /> },
          { path: 'explore', element: <ExplorePage /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'generate', element: <GenerateImagePage /> },
          { path: 'public', element: <ExplorePage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
