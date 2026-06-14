import { useState, useCallback } from 'react';

export type LayerKey = 'shelters' | 'snow' | 'waste' | 'traffic' | 'street_closures' |
  'cultural_events' | 'public_art' | 'air_quality' | 'noise' | 'contracts' |
  'bike_paths' | 'wifi' | 'parks' | 'transit' | 'libraries' | 'pools' |
  'sports' | 'water_quality' | 'permits' | 'grants';

type LayerMeta = {
  key: LayerKey;
  label: string;
  lastUpdated: string;
  severity: 'green' | 'amber' | 'red' | 'neutral';
};

const DEFAULT_LAYERS: LayerKey[] = ['shelters', 'traffic', 'street_closures', 'cultural_events', 'public_art'];

const LAYER_METADATA: LayerMeta[] = [
  { key: 'shelters', label: 'Shelters', lastUpdated: '5 min ago', severity: 'green' },
  { key: 'snow', label: 'Snow Removal', lastUpdated: '15 min ago', severity: 'amber' },
  { key: 'waste', label: 'Waste Collection', lastUpdated: '1 hr ago', severity: 'green' },
  { key: 'traffic', label: 'Traffic', lastUpdated: '2 min ago', severity: 'amber' },
  { key: 'street_closures', label: 'Street Closures', lastUpdated: '30 min ago', severity: 'amber' },
  { key: 'cultural_events', label: 'Cultural Events', lastUpdated: '1 hr ago', severity: 'green' },
  { key: 'public_art', label: 'Public Art', lastUpdated: '24 hr ago', severity: 'neutral' },
  { key: 'air_quality', label: 'Air Quality', lastUpdated: '10 min ago', severity: 'green' },
  { key: 'noise', label: 'Noise Levels', lastUpdated: '5 min ago', severity: 'neutral' },
  { key: 'contracts', label: 'Contracts', lastUpdated: '1 day ago', severity: 'neutral' },
  { key: 'bike_paths', label: 'Bike Paths', lastUpdated: '1 hr ago', severity: 'green' },
  { key: 'wifi', label: 'Public Wi-Fi', lastUpdated: '1 hr ago', severity: 'green' },
  { key: 'parks', label: 'Parks', lastUpdated: '6 hr ago', severity: 'green' },
  { key: 'transit', label: 'Transit', lastUpdated: '1 min ago', severity: 'amber' },
  { key: 'libraries', label: 'Libraries', lastUpdated: '2 hr ago', severity: 'green' },
  { key: 'pools', label: 'Pools', lastUpdated: '3 hr ago', severity: 'green' },
  { key: 'sports', label: 'Sports', lastUpdated: '4 hr ago', severity: 'neutral' },
  { key: 'water_quality', label: 'Water Quality', lastUpdated: '12 hr ago', severity: 'green' },
  { key: 'permits', label: 'Permits', lastUpdated: '1 day ago', severity: 'neutral' },
  { key: 'grants', label: 'Grants', lastUpdated: '2 days ago', severity: 'neutral' },
];

export function useCivicLayers() {
  const [activeLayers, setActiveLayers] = useState<Set<LayerKey>>(new Set(DEFAULT_LAYERS));

  const toggleLayer = useCallback((key: LayerKey) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const setLayers = useCallback((keys: LayerKey[]) => {
    setActiveLayers(new Set(keys));
  }, []);

  const layerMetadata = LAYER_METADATA;

  return { activeLayers, toggleLayer, setLayers, layerMetadata };
}
