import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { GenerateImagePage } from '@/pages/images/GenerateImagePage';
import { ExplorePage } from '@/pages/images/ExplorePage';
import { PromptAssistantPage } from '@/pages/images/PromptAssistantPage';
import { GuidedWizardPage } from '@/pages/images/GuidedWizardPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { NotFoundPage } from '@/pages/misc/NotFoundPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { ProjectsPage } from '@/pages/projects/ProjectsPage';
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage';
import { ChatPage } from '@/pages/chat/ChatPage';
import { ImageEditPage } from '@/pages/images/ImageEditPage';
import { MyImagesPage } from '@/pages/images/MyImagesPage';
import { CharactersPage } from '@/pages/characters/CharactersPage';
import { CharacterDetailPage } from '@/pages/characters/CharacterDetailPage';

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
          { path: 'prompt-assistant', element: <PromptAssistantPage /> },
          { path: 'wizard', element: <GuidedWizardPage /> },
          { path: 'public', element: <ExplorePage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'projects/:id', element: <ProjectDetailPage /> },
          { path: 'my-images', element: <MyImagesPage /> },
          { path: 'images/:id/edit', element: <ImageEditPage /> },
          { path: 'characters', element: <CharactersPage /> },
          { path: 'characters/:id', element: <CharacterDetailPage /> },
          { path: 'chat', element: <ChatPage /> },
          { path: 'chat/:id', element: <ChatPage /> },
        ],
      },
    ],
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password/:token', element: <ResetPasswordPage /> },
      { path: '/verify-email/:token', element: <VerifyEmailPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
