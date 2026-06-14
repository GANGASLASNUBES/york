import { MapPin, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CivicDetailCard } from '../../components/civic/CivicDetailCard';
import { CivicMoodPanel } from '../../components/civic/CivicMoodPanel';
import { CivicStoryOverlay } from '../../components/civic/CivicStoryOverlay';
import { CityHeatIndexRing } from '../../components/civic/CityHeatIndexRing';
import CityMoodBoroughRings from '../../components/neighborhoods/CityMoodBoroughRings';
import GearIntelligencePanel from '../../components/gear/GearIntelligencePanel';
import type { MarkerData } from '../../components/civic/CivicMap';
import type { HeatMood } from './hooks/useHeatIndex';

type RightTab = 'details' | 'mood' | 'stories' | 'gear';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  activeTab: RightTab;
  onTabChange: (tab: RightTab) => void;
  selectedMarker: MarkerData | null;
  onClearMarker: () => void;
  heatScore: number;
  heatMood: HeatMood;
};

export default function DetailSidebar({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  selectedMarker,
  onClearMarker,
  heatScore,
  heatMood,
}: Props) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="h-full w-72 bg-gray-900/95 border-l border-gray-800 backdrop-blur flex flex-col">
      <div className="flex items-center border-b border-gray-800 px-2 pt-2 gap-0.5">
        {([
          { key: 'details', label: t('commandCenter.details') },
          { key: 'mood', label: t('commandCenter.mood') },
          { key: 'gear', label: t('commandCenter.gear') },
          { key: 'stories', label: t('commandCenter.stories') },
        ] as { key: RightTab; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-2.5 py-2 text-[10px] font-medium rounded-t-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-gray-800 text-white border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={onClose} className="text-gray-500 hover:text-white pb-1">
          <ChevronRightIcon size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'details' && (
          <div>
            {selectedMarker ? (
              <CivicDetailCard
                title={selectedMarker.label}
                type={selectedMarker.type}
                description={selectedMarker.details || 'No additional details available.'}
                severity={selectedMarker.severity || 'green'}
                timestamp={`Updated ${Math.floor(Math.random() * 30 + 1)}m ago`}
                details={[
                  { label: 'Type', value: selectedMarker.type },
                  { label: 'Coordinates', value: `${selectedMarker.lat.toFixed(4)}, ${selectedMarker.lng.toFixed(4)}` },
                ]}
                onClose={onClearMarker}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <MapPin size={20} className="text-gray-600 mb-2" />
                <p className="text-xs text-gray-500">{t('commandCenter.clickMarker')}</p>
                <p className="text-[9px] text-gray-600 mt-1">{t('commandCenter.longPress')}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mood' && (
          <div className="space-y-4">
            <div className="flex justify-center py-2">
              <CityHeatIndexRing compositeScore={heatScore} mood={heatMood} size="md" />
            </div>
            <CivicMoodPanel
              cityLoad="mid"
              cityEnergy="mid"
              modifiers={[
                { factor: 'Noise (Ville-Marie)', loadDelta: 1, energyDelta: 0 },
                { factor: 'Cultural Events', loadDelta: 0, energyDelta: 1 },
                { factor: 'Traffic Congestion', loadDelta: 1, energyDelta: 0 },
              ]}
            />
            <div className="pt-2 border-t border-gray-800">
              <CityMoodBoroughRings compact={false} />
            </div>
          </div>
        )}

        {activeTab === 'gear' && (
          <GearIntelligencePanel />
        )}

        {activeTab === 'stories' && (
          <CivicStoryOverlay onStorySelect={() => onTabChange('details')} />
        )}
      </div>
    </div>
  );
}
