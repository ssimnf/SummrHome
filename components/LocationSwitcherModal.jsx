'use client';

import React, { useState } from 'react';
import { LocateFixed, X } from 'lucide-react';
import {
  getTownNeighborhoods,
  LOCAL_TOWNS,
  reverseGeocodePosition,
} from '@/data/locations';

export default function LocationSwitcherModal({
  currentLocation,
  onUpdate,
  onClose,
}) {
  const [city, setCity] = useState(currentLocation.city);
  const [district, setDistrict] = useState(currentLocation.district);
  const [neighborhood, setNeighborhood] = useState(
    currentLocation.neighborhood
  );
  const [locating, setLocating] = useState(false);

  const handleGPS = () => {
    if (!('geolocation' in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const resolved = await reverseGeocodePosition(
          pos.coords.latitude,
          pos.coords.longitude
        );
        setCity(resolved.city);
        setDistrict(resolved.district);
        setNeighborhood(resolved.neighborhood);
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { timeout: 6000 }
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    onUpdate({
      city,
      district,
      neighborhood,
      detectionMethod: 'manual',
    });
    onClose();
  };

  const neighborhoods = getTownNeighborhoods(city);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Switch Local Neighborhood"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Change Local Town & Neighborhood
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleGPS}
          disabled={locating}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 border border-teal-700 text-teal-700 hover:bg-teal-50 text-xs font-semibold rounded-lg cursor-pointer"
        >
          <LocateFixed className="w-4 h-4" />
          <span>{locating ? 'Locking GPS...' : 'Re-detect My GPS Area'}</span>
        </button>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Town / City
            </label>
            <select
              value={city}
              onChange={(e) => {
                const next = e.target.value;
                const found = LOCAL_TOWNS.find((t) => t.city === next);
                setCity(next);
                setDistrict(found?.district || next);
                setNeighborhood(getTownNeighborhoods(next)[0]);
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
            >
              {LOCAL_TOWNS.map((t) => (
                <option key={t.city} value={t.city}>
                  {t.city} ({t.district})
                </option>
              ))}
              {!LOCAL_TOWNS.some((t) => t.city === city) && (
                <option value={city}>{city}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Neighborhood / Para
            </label>
            <select
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
            >
              {neighborhoods.map((nb) => (
                <option key={nb} value={nb}>
                  {nb}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Apply Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
