import { useState, useCallback } from 'react';
import type { LayerKey } from './useCivicLayers';

const STORY_LAYERS: LayerKey[] = ['public_art', 'cultural_events', 'parks', 'libraries'];

export function useStoryMode(setLayers: (keys: LayerKey[]) => void) {
  const [isStoryMode, setIsStoryMode] = useState(false);
  const [previousLayers, setPreviousLayers] = useState<LayerKey[]>([]);

  const enableStoryMode = useCallback((currentLayers: Set<LayerKey>) => {
    setPreviousLayers(Array.from(currentLayers));
    setLayers(STORY_LAYERS);
    setIsStoryMode(true);
  }, [setLayers]);

  const disableStoryMode = useCallback(() => {
    setLayers(previousLayers);
    setIsStoryMode(false);
  }, [setLayers, previousLayers]);

  const toggleStoryMode = useCallback((currentLayers: Set<LayerKey>) => {
    if (isStoryMode) disableStoryMode();
    else enableStoryMode(currentLayers);
  }, [isStoryMode, enableStoryMode, disableStoryMode]);

  return { isStoryMode, toggleStoryMode, enableStoryMode, disableStoryMode };
}
