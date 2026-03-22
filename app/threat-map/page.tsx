'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { mockThreatMapMarkers } from '@/lib/mock-data';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((m) => m.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
);

const riskColors: Record<string, string> = {
  low: '#16a34a',
  medium: '#d97706',
  high: '#ea580c',
  critical: '#dc2626',
};

export default function ThreatMapPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Threat Map</h1>
            <p className="text-sm text-white/40 mt-1">Loading map...</p>
          </div>
          <div className="glass-card overflow-hidden rounded-2xl h-[500px] flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Threat Map</h1>
          <p className="text-sm text-white/40 mt-1">Geographic visualization of scam activity hotspots</p>
        </motion.div>

        {/* Disclaimer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 flex items-center gap-3">
          <span className="text-yellow-400">⚠️</span>
          <p className="text-xs text-yellow-400/80">Location prediction is approximate and based on reported data until telecom integration is established.</p>
        </motion.div>

        {/* Map */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 rounded-2xl overflow-hidden glow-border">
          <div style={{ borderRadius: '12px', overflow: 'hidden' }} className="h-[300px] sm:h-[400px] md:h-[500px]">
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mockThreatMapMarkers.map((marker) => (
                <CircleMarker
                  key={marker.id}
                  center={[marker.lat, marker.lng]}
                  radius={Math.min(marker.threatCount / 8, 25)}
                  fillColor={riskColors[marker.riskLevel]}
                  fillOpacity={0.5}
                  color={riskColors[marker.riskLevel]}
                  weight={2}
                >
                  <Popup>
                    <div className="text-xs" style={{ minWidth: 150 }}>
                      <p className="font-bold text-sm mb-1">{marker.city}</p>
                      <p>Threat Count: <strong>{marker.threatCount}</strong></p>
                      <p>Risk Level: <strong style={{ color: riskColors[marker.riskLevel] }}>{marker.riskLevel.toUpperCase()}</strong></p>
                      <p>Types: {marker.scamTypes.join(', ')}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </motion.div>

        {/* Legend + Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockThreatMapMarkers.slice(0, 4).map((marker) => (
            <motion.div key={marker.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-hover p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: riskColors[marker.riskLevel] }} />
                <h4 className="text-sm font-semibold text-white">{marker.city}</h4>
              </div>
              <p className="text-2xl font-bold text-white/80 mb-1">{marker.threatCount}</p>
              <p className="text-xs text-white/40">Threats reported</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {marker.scamTypes.map((t) => (
                  <span key={t} className="text-[10px] bg-white/[0.05] text-white/50 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
