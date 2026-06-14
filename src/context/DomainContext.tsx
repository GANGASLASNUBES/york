import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from 'convex/react';

export type SiteCode = 'LEXI_SITE' | 'BIPS_SITE' | 'GEAR_SITE';

export interface DomainConfig {
  hostname: string;
  siteCode: SiteCode;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    theme: string;
  };
  enabledFeatures: string[];
}

interface DomainContextType {
  config: DomainConfig | null;
  isLoading: boolean;
  error: Error | null;
  hasFeature: (feature: string) => boolean;
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

// Helper to detect site from hostname
function detectSiteFromHostname(hostname: string): SiteCode {
  if (hostname.includes('bips')) return 'BIPS_SITE';
  if (hostname.includes('lexi')) return 'LEXI_SITE';
  return 'GEAR_SITE';
}

// Default branding for each site
const DEFAULT_BRANDING: Record<SiteCode, DomainConfig['branding']> = {
  LEXI_SITE: {
    primaryColor: '#ff4da6',
    secondaryColor: '#ffe6f2',
    theme: 'beauty-glow',
  },
  BIPS_SITE: {
    primaryColor: '#1e40af',
    secondaryColor: '#dbeafe',
    theme: 'tech-dark',
  },
  GEAR_SITE: {
    primaryColor: '#3b82f6',
    secondaryColor: '#1e293b',
    theme: 'hardware-dark',
  },
};

export function DomainProvider({ children }: { children: React.ReactNode }) {
  const [hostname, setHostname] = useState<string>('');
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get current hostname on mount
  useEffect(() => {
    const host = window.location.hostname;
    setHostname(host);
  }, []);

  useEffect(() => {
    if (!hostname) return;

    // Use automatic detection for now, will integrate Convex API once codegen is ready
    const siteCode = detectSiteFromHostname(hostname);
    const branding = DEFAULT_BRANDING[siteCode];

    setConfig({
      hostname,
      siteCode,
      branding,
      enabledFeatures: siteCode === 'LEXI_SITE'
        ? ['revenue', 'digitalDownloads', 'affiliateLinks', 'beautyRoutines']
        : siteCode === 'GEAR_SITE'
        ? ['hardware', 'fieldKits', 'arAccessories']
        : ['contacts', 'sites', 'provenance', 'rituals', 'hud'],
    });
    setIsLoading(false);
  }, [hostname]);

  const hasFeature = (feature: string): boolean => {
    return config?.enabledFeatures.includes(feature) ?? false;
  };

  return (
    <DomainContext.Provider value={{ config, isLoading, error, hasFeature }}>
      {children}
    </DomainContext.Provider>
  );
}

export function useDomain() {
  const context = useContext(DomainContext);
  if (!context) {
    throw new Error('useDomain must be used within DomainProvider');
  }
  return context;
}
