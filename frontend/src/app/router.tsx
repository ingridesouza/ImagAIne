import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { GenerateImagePage } from '@/pages/images/GenerateImagePage';
import { MyImagesPage } from '@/pages/images/MyImagesPage';
import { PublicGalleryPage } from '@/pages/images/PublicGalleryPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { NotFoundPage } from '@/pages/misc/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'generate', element: <GenerateImagePage /> },
          { path: 'my-images', element: <MyImagesPage /> },
          { path: 'public', element: <PublicGalleryPage /> },
          { path: 'settings', element: <SettingsPage /> },
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
