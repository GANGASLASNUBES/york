import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import type { CollabPin } from './CollaborativeMapSidebar';

type Props = {
  center: [number, number];
  zoom: number;
  pins: CollabPin[];
  canAddPins: boolean;
  onAddPin: (lat: number, lng: number) => void;
  onPinClick: (pin: CollabPin) => void;
};

function MapClickHandler({ onAddPin, canAddPins }: { onAddPin: (lat: number, lng: number) => void; canAddPins: boolean }) {
  useMapEvents({
    click(e) {
      if (canAddPins) {
        onAddPin(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function CollaborativeMapEditor({ center, zoom, pins, canAddPins, onAddPin, onPinClick }: Props) {
  return (
    <div className="flex-1 relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <MapClickHandler onAddPin={onAddPin} canAddPins={canAddPins} />
        {pins.map((pin) => (
          <Marker key={pin.id} position={[pin.lat, pin.lng]}>
            <Popup>
              <div className="text-xs">
                <strong>{pin.title}</strong>
                <br />
                <span className="text-gray-500">{pin.userName} -- {pin.category}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {canAddPins && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-gray-900/90 border border-gray-700 rounded-lg px-3 py-1.5 backdrop-blur">
          <p className="text-[10px] text-gray-400">Click map to add a pin</p>
        </div>
      )}
    </div>
  );
}
