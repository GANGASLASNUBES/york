import { CivicMap, type MarkerData, type HeatZone, type RouteOverlay } from '../../components/civic/CivicMap';

type Props = {
  markers: MarkerData[];
  heatZones: HeatZone[];
  routes: RouteOverlay[];
  center?: [number, number];
  storyMode: boolean;
  onMapLongPress: (lat: number, lng: number) => void;
  onMarkerClick: (marker: MarkerData) => void;
};

export default function MapContainer({ markers, heatZones, routes, center, storyMode, onMapLongPress, onMarkerClick }: Props) {
  return (
    <div className="flex-1">
      <CivicMap
        markers={markers}
        heatZones={heatZones}
        routes={routes}
        onMapLongPress={onMapLongPress}
        onMarkerClick={onMarkerClick}
        center={center}
        storyMode={storyMode}
      />
    </div>
  );
}
