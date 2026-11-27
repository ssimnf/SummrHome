'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  LocateFixed,
  MapPin,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sun,
} from 'lucide-react';
import {
  LOCAL_TOWNS,
  getTownNeighborhoods,
  reverseGeocodePosition,
} from '@/data/locations';

export default function LocationGate({ initialLocation, onConfirm }) {
  const [status, setStatus] = useState(
    initialLocation
      ? 'ready'
      : typeof window !== 'undefined' && 'geolocation' in navigator
      ? 'locating'
      : 'denied'
  );
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedCity, setSelectedCity] = useState(
    initialLocation?.city || 'Sreerampore'
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    initialLocation?.district || 'Hooghly'
  );
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(
    initialLocation?.neighborhood || 'Serampore College Gate'
  );
  const [coords, setCoords] = useState(
    initialLocation?.lat && initialLocation?.lng
      ? { lat: initialLocation.lat, lng: initialLocation.lng }
      : undefined
  );
  const [detectionMethod, setDetectionMethod] = useState(
    initialLocation?.detectionMethod || 'gps'
  );
  const [customCityInput, setCustomCityInput] = useState('');
  const [customNeighborhoodInput, setCustomNeighborhoodInput] = useState('');
  const [useCustomTown, setUseCustomTown] = useState(false);

  const runGeolocationLookup = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        const resolved = await reverseGeocodePosition(latitude, longitude);
        setSelectedCity(resolved.city);
        setSelectedDistrict(resolved.district);
        setSelectedNeighborhood(resolved.neighborhood);
        setDetectionMethod('gps');
        setUseCustomTown(false);
        setStatus('ready');
      },
      (err) => {
        setStatus('denied');
        setDetectionMethod('manual');
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMsg(
            'GPS permission was declined or blocked by browser preview. Pick your local town and neighborhood below or retry GPS.'
          );
        } else {
          setErrorMsg(
            'Could not lock GPS signal right now. Choose your local town and neighborhood below.'
          );
        }
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 }
    );
  };

  const requestGPS = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatus('denied');
      setDetectionMethod('manual');
      setErrorMsg(
        'Browser geolocation is unavailable here. Select your town and neighborhood below to continue.'
      );
      return;
    }

    setStatus('locating');
    setErrorMsg(null);
    runGeolocationLookup();
  };

  useEffect(() => {
    if (
      !initialLocation &&
      typeof window !== 'undefined' &&
      'geolocation' in navigator
    ) {
      runGeolocationLookup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTownSelect = (city) => {
    const found = LOCAL_TOWNS.find((t) => t.city === city);
    if (found) {
      setUseCustomTown(false);
      setSelectedCity(found.city);
      setSelectedDistrict(found.district);
      setSelectedNeighborhood(found.neighborhoods[0]);
      setDetectionMethod('manual');
      setStatus('ready');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCity = useCustomTown
      ? customCityInput.trim() || 'Sreerampore'
      : selectedCity;
    const finalNeighborhood = useCustomTown
      ? customNeighborhoodInput.trim() || 'College Gate'
      : selectedNeighborhood;
    const finalDistrict = useCustomTown ? finalCity : selectedDistrict;

    onConfirm({
      city: finalCity,
      district: finalDistrict,
      neighborhood: finalNeighborhood,
      lat: coords?.lat,
      lng: coords?.lng,
      detectionMethod,
    });
  };

  const neighborhoods = getTownNeighborhoods(selectedCity);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between px-4 py-8 sm:px-8">
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 font-display whitespace-nowrap">
          <Sun
            className="w-5 h-5 text-slate-950 fill-slate-950 shrink-0"
            strokeWidth={2.2}
            aria-hidden="true"
          />
          <span>SummrHome</span>
        </span>
        <span className="text-xs font-medium text-slate-500 text-right">
          Step 1 of 2 · Location Verification
        </span>
      </header>

      <main className="max-w-5xl w-full mx-auto my-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900 text-white rounded-2xl p-8">
            <div>
              <p className="text-xs font-medium text-teal-300 tracking-wide mb-3">
                Hyperlocal Campus Network
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-balance">
                Homes and student essentials in your exact neighborhood.
              </h1>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                SummrHome detects your local town and college para first—whether
                you are in Sreerampore, Rishra, Chinsurah, Uttarpara, or
                Jadavpur—so every PG bed and secondhand cycle is within walking
                or quick train distance.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Filter PGs by local neighborhood and college gate</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Local Student Bazaar pickup with zero shipping wait</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Detect your current area
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Browser GPS access is used to lock your local town and nearby
                    neighborhoods.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={requestGPS}
                  disabled={status === 'locating'}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border border-teal-700 text-teal-700 hover:bg-teal-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
                >
                  <LocateFixed className="w-4 h-4" />
                  {status === 'locating' ? 'Detecting GPS...' : 'Detect via GPS'}
                </button>
              </div>

              <div className="mt-5">
                {status === 'locating' && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
                    <Compass className="w-5 h-5 text-teal-700 animate-spin shrink-0" />
                    <span>
                      Waiting for browser location permission and resolving
                      nearest town...
                    </span>
                  </div>
                )}

                {status === 'ready' && !useCustomTown && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-sm text-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">
                        Location ready: {selectedCity}, {selectedDistrict}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5 tabular-nums">
                        Neighborhood: {selectedNeighborhood}
                        {coords
                          ? ` · GPS (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
                          : ' · Local neighborhood match'}
                      </p>
                    </div>
                  </div>
                )}

                {status === 'denied' && errorMsg && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
                    <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">GPS Fallback Active</p>
                      <p className="text-xs text-amber-800 mt-0.5">{errorMsg}</p>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-slate-700">
                      Select Local Town / City
                    </label>
                    <button
                      type="button"
                      onClick={() => setUseCustomTown((v) => !v)}
                      className="text-xs font-medium text-teal-700 hover:underline cursor-pointer"
                    >
                      {useCustomTown ? 'Choose from list' : 'Enter another town'}
                    </button>
                  </div>

                  {!useCustomTown ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {LOCAL_TOWNS.map((town) => {
                        const active = selectedCity === town.city;
                        return (
                          <button
                            key={town.city}
                            type="button"
                            onClick={() => handleTownSelect(town.city)}
                            className={`px-3 py-2.5 text-left rounded-lg border text-xs transition-colors cursor-pointer ${
                              active
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="font-semibold truncate">
                              {town.city}
                            </div>
                            <div
                              className={`text-[11px] truncate ${
                                active ? 'text-slate-300' : 'text-slate-500'
                              }`}
                            >
                              {town.district}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        value={customCityInput}
                        onChange={(e) => setCustomCityInput(e.target.value)}
                        placeholder="e.g., Bandel, Barrackpore, Siliguri"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                      />
                      <input
                        type="text"
                        required
                        value={customNeighborhoodInput}
                        onChange={(e) =>
                          setCustomNeighborhoodInput(e.target.value)
                        }
                        placeholder="Neighborhood (e.g., Station Para)"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                      />
                    </div>
                  )}
                </div>

                {!useCustomTown && (
                  <div>
                    <label
                      htmlFor="neighborhood-select"
                      className="block text-xs font-medium text-slate-700 mb-2"
                    >
                      Neighborhood / Para in {selectedCity}
                    </label>
                    <select
                      id="neighborhood-select"
                      value={selectedNeighborhood}
                      onChange={(e) => setSelectedNeighborhood(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                    >
                      {neighborhoods.map((nb) => (
                        <option key={nb} value={nb}>
                          {nb}
                        </option>
                      ))}
                      {!neighborhoods.includes(selectedNeighborhood) && (
                        <option value={selectedNeighborhood}>
                          {selectedNeighborhood}
                        </option>
                      )}
                    </select>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Confirm Location & Continue to Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="max-w-5xl w-full mx-auto text-xs text-slate-500 flex items-center justify-between pt-4 border-t border-slate-200">
        <span>SummrHome Student Housing & Bazaar</span>
        <span>Mobile OTP verification in next step</span>
      </footer>
    </div>
  );
}
