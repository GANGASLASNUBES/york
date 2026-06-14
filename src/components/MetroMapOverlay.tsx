import React, { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { MapPin } from 'lucide-react';

export function MetroMapOverlay() {
  const location = useQuery(api.location.getLatestLocation);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 2;

    const lines = [
      { start: [0, 50], end: [canvas.width, 50], color: '#FF6B6B' },
      { start: [0, 150], end: [canvas.width, 150], color: '#4ECDC4' },
      { start: [100, 0], end: [100, canvas.height], color: '#FFE66D' },
    ];

    lines.forEach((line) => {
      ctx.strokeStyle = line.color;
      ctx.beginPath();
      ctx.moveTo(line.start[0], line.start[1]);
      ctx.lineTo(line.end[0], line.end[1]);
      ctx.stroke();
    });

    if (location) {
      const mapWidth = canvas.width;
      const mapHeight = canvas.height;
      const x = (location.latitude / 45.5) * mapWidth;
      const y = (location.longitude / 73.5) * mapHeight;

      ctx.fillStyle = '#FF8C42';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 140, 66, 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [location]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={20} className="text-orange-600" />
        <h2 className="text-lg font-semibold text-gray-900">Metro Map</h2>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full border border-gray-200 rounded bg-gray-50"
        style={{ height: '300px' }}
      />

      {location && (
        <div className="mt-3 text-sm text-gray-600">
          <p>Current: {location.station || 'Unknown Station'}</p>
          <p className="text-xs text-gray-400">
            {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
