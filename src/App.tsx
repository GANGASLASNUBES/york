import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConvexProvider } from 'convex/react';
import { DomainProvider } from './context/DomainContext';
import { DomainRoutes } from './routes/DomainRoutes';
import { useAuth } from './hooks/useAuth';
import { RequireAuth, RequireAdmin } from './lib/auth/RouteGuards';
import { convex } from './lib/convex';
import { Loader } from 'lucide-react';

import { GearPage } from './pages/GearPage';
import { CivicIntelDashboard } from './pages/CivicIntelDashboard';
import { GearCivicModesPage } from './pages/GearCivicModesPage';
import { LexiCivicStoriesPage } from './pages/LexiCivicStoriesPage';
import { CityTrailsPage } from './pages/CityTrailsPage';
import { AuthPage } from './pages/auth/AuthPage';
import { MyAlertsPage } from './pages/user/MyAlertsPage';
import { MyMapsPage } from './pages/user/MyMapsPage';
import { MyPinsPage } from './pages/user/MyPinsPage';
import { MyStoriesPage } from './pages/user/MyStoriesPage';
import { AdminCivicCommandPage } from './pages/AdminCivicCommandPage';
import NeighborhoodDashboardPage from './pages/neighborhoods/index';
import CollaborativeMapsPage from './pages/collab-maps/index';
import TranslationConsolePage from './pages/admin/TranslationConsolePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import { LeachAdminCopilotPage } from './pages/leach/copilot/LeachAdminCopilotPage';
import { LeachLexiCopilotPage } from './pages/leach/copilot/LeachLexiCopilotPage';
import { OperationsControlPanel } from './pages/ops/OperationsControlPanel';
import { PlatformHubPage } from './pages/PlatformHubPage';

function AppRoutes() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <Loader className="animate-spin text-gray-500" size={32} />
      </div>
    );
  }

  return (
    <Routes>
      {/* Default landing - BIPS Gear */}
      <Route path="/" element={<GearPage />} />
      <Route path="/bips/civic-intel" element={<CivicIntelDashboard />} />
      <Route path="/bips/city-trails" element={<CityTrailsPage />} />
      <Route path="/bips/neighborhoods" element={<NeighborhoodDashboardPage />} />
      <Route path="/gear/civic-modes" element={<GearCivicModesPage />} />
      <Route path="/lexi/civic-stories" element={<LexiCivicStoriesPage />} />

      {/* Auth routes */}
      <Route path="/auth/login" element={<AuthPage />} />
      <Route path="/auth/register" element={<AuthPage />} />

      {/* Authenticated user routes */}
      <Route path="/my/alerts" element={<RequireAuth><MyAlertsPage /></RequireAuth>} />
      <Route path="/my/maps" element={<RequireAuth><MyMapsPage /></RequireAuth>} />
      <Route path="/my/pins" element={<RequireAuth><MyPinsPage /></RequireAuth>} />
      <Route path="/my/stories" element={<RequireAuth><MyStoriesPage /></RequireAuth>} />
      <Route path="/my/collab-maps" element={<RequireAuth><CollaborativeMapsPage /></RequireAuth>} />

      {/* Admin routes */}
      <Route path="/admin/civic-command" element={<RequireAdmin><AdminCivicCommandPage /></RequireAdmin>} />
      <Route path="/admin/translations" element={<RequireAdmin><TranslationConsolePage /></RequireAdmin>} />
      <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />
      <Route path="/app/*" element={<RequireAdmin><DomainRoutes /></RequireAdmin>} />

      {/* LEACH Copilot consoles */}
      <Route path="/leach/admin/copilot" element={<LeachAdminCopilotPage />} />
      <Route path="/leach/lexi/copilot" element={<LeachLexiCopilotPage />} />

      {/* Operations Control Panel */}
      <Route path="/ops" element={<OperationsControlPanel />} />

      {/* Platform Navigation Hub */}
      <Route path="/hub" element={<PlatformHubPage />} />

      {/* Multilingual route aliases */}
      <Route path="/en/*" element={<Navigate to="/" replace />} />
      <Route path="/fr/*" element={<Navigate to="/" replace />} />
      <Route path="/es/*" element={<Navigate to="/" replace />} />
      <Route path="/zh/*" element={<Navigate to="/" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const content = (
    <Router>
      <DomainProvider>
        <AppRoutes />
      </DomainProvider>
    </Router>
  );

  if (convex) {
    return <ConvexProvider client={convex}>{content}</ConvexProvider>;
  }

  return content;
}

export default App;
