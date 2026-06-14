import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

type MapPin = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: string;
};

type Props = {
  center: [number, number];
  pins: MapPin[];
  zoom?: number;
};

export default function NeighborhoodMiniMap({ center, pins, zoom = 14 }: Props) {
  return (
    <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-800">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {pins.map((pin) => (
          <Marker key={pin.id} position={[pin.lat, pin.lng]}>
            <Popup>
              <div className="text-xs">
                <strong>{pin.label}</strong>
                <br />
                <span className="text-gray-500 capitalize">{pin.type}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
