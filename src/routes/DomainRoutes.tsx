import { Routes, Route, Navigate } from 'react-router-dom';
import type { SiteCode } from '../context/DomainContext';
import { useDomain } from '../context/DomainContext';
import { LexiLayout } from '../layouts/LexiLayout';
import { BipsLayout } from '../layouts/BipsLayout';
import { GearLayout } from '../layouts/GearLayout';
import { Loader } from 'lucide-react';

// Import existing pages that work for BIPS
import { BipsDashboard } from '../pages/BipsDashboard';
import { BipsContactsPage } from '../pages/BipsContactsPage';
import { BipsSitesPage } from '../pages/BipsSitesPage';
import { BipsProvenancePage } from '../pages/BipsProvenancePage';
import { BipsRitualsPage } from '../pages/BipsRitualsPage';

// Import new admin and analytics pages
import { LexiAdminPage } from '../pages/LexiAdminPage';
import { AnalyticsDashboardPage } from '../pages/AnalyticsDashboardPage';
import { LexiRevenueHubPage } from '../pages/LexiRevenueHubPage';
import { LexiGlowClubLandingPage } from '../pages/LexiGlowClubLandingPage';
import { LexiAiRoutinePage } from '../pages/LexiAiRoutinePage';
import { GearConfiguratorPage } from '../pages/GearConfiguratorPage';
import { BipsHudTelemetryPage } from '../pages/BipsHudTelemetryPage';
import { CrossDomainAnalyticsPage } from '../pages/CrossDomainAnalyticsPage';
import { LexiBundlesPage } from '../pages/LexiBundlesPage';
import { LexiRoutinesMarketplacePage } from '../pages/LexiRoutinesMarketplacePage';
import { LeachLoginPage } from '../pages/leach/LeachLoginPage';
import { LeachLexiDashboard } from '../pages/leach/LeachLexiDashboard';
import { LeachKeeAdmin } from '../pages/leach/LeachKeeAdmin';
import { LeachSyncProtocolPage } from '../pages/leach/LeachSyncProtocolPage';
import { CivicIntelDashboard } from '../pages/CivicIntelDashboard';
import { GearCivicModesPage } from '../pages/GearCivicModesPage';
import { LexiCivicStoriesPage } from '../pages/LexiCivicStoriesPage';
import { AdminCivicCommandPage } from '../pages/AdminCivicCommandPage';

// Placeholder pages (will be created next)
const LexiHomePage = () => (
  <div className="text-center py-12">
    <h2 className="text-3xl font-bold mb-4">Welcome to Lexi Rose</h2>
    <p className="text-gray-600">Featured content & products coming soon</p>
  </div>
);

const LexiProductsPage = () => (
  <div className="text-center py-12">
    <h2 className="text-3xl font-bold mb-4">Products</h2>
    <p className="text-gray-600">Digital products, physical goods, & services</p>
  </div>
);

const LexiDownloadsPage = () => (
  <div className="text-center py-12">
    <h2 className="text-3xl font-bold mb-4">Digital Downloads</h2>
    <p className="text-gray-600">Beauty routines, guides, & templates</p>
  </div>
);

const LexiRoutinesPage = () => (
  <div className="text-center py-12">
    <h2 className="text-3xl font-bold mb-4">Beauty Routines</h2>
    <p className="text-gray-600">Skincare, makeup, & wellness guides</p>
  </div>
);

const GearCatalogPage = () => (
  <div className="text-center py-12">
    <h2 className="text-3xl font-bold mb-4">Gear Catalog</h2>
    <p className="text-gray-600">Racing wheels, headsets, controllers & more</p>
  </div>
);

const GearFieldKitsPage = () => (
  <div className="text-center py-12">
    <h2 className="text-3xl font-bold mb-4">Field Kits</h2>
    <p className="text-gray-600">Portable hardware kits for on-the-go gaming</p>
  </div>
);

const GearARAccessoriesPage = () => (
  <div className="text-center py-12">
    <h2 className="text-3xl font-bold mb-4">AR Accessories</h2>
    <p className="text-gray-600">HUD-ready hardware & accessories</p>
  </div>
);

function LexiRoutes() {
  return (
    <LexiLayout>
      <Routes>
        <Route path="/" element={<LexiHomePage />} />
        <Route path="/products" element={<LexiProductsPage />} />
        <Route path="/downloads" element={<LexiDownloadsPage />} />
        <Route path="/routines" element={<LexiRoutinesPage />} />
        <Route path="/admin" element={<LexiAdminPage />} />
        <Route path="/revenue" element={<LexiRevenueHubPage />} />
        <Route path="/glow-club" element={<LexiGlowClubLandingPage />} />
        <Route path="/ai-routine" element={<LexiAiRoutinePage />} />
        <Route path="/bundles" element={<LexiBundlesPage />} />
        <Route path="/marketplace" element={<LexiRoutinesMarketplacePage />} />
        <Route path="/analytics" element={<AnalyticsDashboardPage />} />
        <Route path="/analytics/cross-domain" element={<CrossDomainAnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LexiLayout>
  );
}

function BipsRoutes() {
  return (
    <BipsLayout>
      <Routes>
        <Route path="/" element={<BipsDashboard />} />
        <Route path="/dashboard" element={<BipsDashboard />} />
        <Route path="/contacts" element={<BipsContactsPage />} />
        <Route path="/sites" element={<BipsSitesPage />} />
        <Route path="/provenance" element={<BipsProvenancePage />} />
        <Route path="/rituals" element={<BipsRitualsPage />} />
        <Route path="/hud" element={<BipsHudTelemetryPage />} />
        <Route path="/leach" element={<LeachLoginPage />} />
        <Route path="/leach/dashboard" element={<LeachLexiDashboard />} />
        <Route path="/leach/admin" element={<LeachKeeAdmin />} />
        <Route path="/leach/sync-protocol" element={<LeachSyncProtocolPage />} />
        <Route path="/leach/admin/sync-protocol" element={<LeachSyncProtocolPage isAdmin />} />
        <Route path="/bips/civic-intel" element={<CivicIntelDashboard />} />
        <Route path="/gear/civic-modes" element={<GearCivicModesPage />} />
        <Route path="/lexi/civic-stories" element={<LexiCivicStoriesPage />} />
        <Route path="/admin/civic-command" element={<AdminCivicCommandPage />} />
        <Route path="/analytics" element={<AnalyticsDashboardPage />} />
        <Route path="/analytics/cross-domain" element={<CrossDomainAnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BipsLayout>
  );
}

function GearRoutes() {
  return (
    <GearLayout>
      <Routes>
        <Route path="/" element={<GearCatalogPage />} />
        <Route path="/catalog" element={<GearCatalogPage />} />
        <Route path="/field-kits" element={<GearFieldKitsPage />} />
        <Route path="/ar-accessories" element={<GearARAccessoriesPage />} />
        <Route path="/configurator" element={<GearConfiguratorPage />} />
        <Route path="/analytics" element={<AnalyticsDashboardPage />} />
        <Route path="/analytics/cross-domain" element={<CrossDomainAnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </GearLayout>
  );
}

export function DomainRoutes() {
  const { config, isLoading } = useDomain();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  const siteCode: SiteCode = config?.siteCode || 'BIPS_SITE';

  switch (siteCode) {
    case 'LEXI_SITE':
      return <LexiRoutes />;
    case 'GEAR_SITE':
      return <GearRoutes />;
    case 'BIPS_SITE':
    default:
      return <BipsRoutes />;
  }
}
