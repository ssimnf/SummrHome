'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin } from 'lucide-react';
import { AppStateProvider, useAppState } from '@/context/AppStateContext';
import LocationGate from '@/components/LocationGate';
import LoginScreen from '@/components/LoginScreen';
import TopNav from '@/components/TopNav';
import PGMarketplace from '@/components/PGMarketplace';
import StudentBazaar from '@/components/StudentBazaar';
import OwnerDashboard from '@/components/OwnerDashboard';
import GuardianDashboard from '@/components/GuardianDashboard';
import StudentActivityView from '@/components/StudentActivityView';
import LocationSwitcherModal from '@/components/LocationSwitcherModal';
import RoomieMatch from '@/components/RoomieMatch';

function SummrHomeWorkspace() {
  const {
    hydrated,
    location,
    currentUser,
    setLocation,
    login,
    logout,
    switchRoleDemo,
    resetDemoState,
  } = useAppState();

  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [activeTab, setActiveTab] = useState('pg');
  const [showLocationModal, setShowLocationModal] = useState(false);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm font-medium text-slate-500">
          Loading SummrHome...
        </div>
      </div>
    );
  }

  if (!location || (!locationConfirmed && !currentUser)) {
    return (
      <LocationGate
        initialLocation={location}
        onConfirm={(loc) => {
          setLocation(loc);
          setLocationConfirmed(true);
        }}
      />
    );
  }

  if (!currentUser) {
    return (
      <LoginScreen
        location={location}
        onBackToGPS={() => setLocationConfirmed(false)}
        onLogin={(payload) => {
          login(payload);
          setActiveTab(payload.role === 'student' ? 'pg' : 'dashboard');
        }}
      />
    );
  }

  const handleRoleSwitch = (role) => {
    switchRoleDemo(role);
    setActiveTab(role === 'student' ? 'pg' : 'dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopNav
        user={currentUser}
        location={location}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenLocationModal={() => setShowLocationModal(true)}
        onSwitchRole={handleRoleSwitch}
        onLogout={() => {
          logout();
          setLocationConfirmed(true);
        }}
        onResetDemo={() => {
          resetDemoState();
          setLocationConfirmed(false);
        }}
      />

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-500 flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span className="shrink-0">Active Area:</span>
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="font-semibold text-teal-700 hover:underline truncate cursor-pointer text-left"
            >
              {location.city} · {location.neighborhood}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Change Area
          </button>
        </div>
      </div>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${currentUser.role}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            {activeTab === 'pg' && <PGMarketplace />}
            {activeTab === 'bazaar' && currentUser.role !== 'owner' && (
              <StudentBazaar />
            )}
            {activeTab === 'bazaar' && currentUser.role === 'owner' && (
              <OwnerDashboard />
            )}
            {activeTab === 'roomies' && <RoomieMatch />}
            {activeTab === 'dashboard' && currentUser.role === 'owner' && (
              <OwnerDashboard />
            )}
            {activeTab === 'dashboard' && currentUser.role === 'guardian' && (
              <GuardianDashboard />
            )}
            {activeTab === 'dashboard' && currentUser.role === 'student' && (
              <StudentActivityView />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>SummrHome · Hyperlocal Student Housing & Bazaar</span>
          <span>
            Serving {location.city}, Hooghly & Kolkata · Frontend Prototype
          </span>
        </div>
      </footer>

      {showLocationModal && (
        <LocationSwitcherModal
          currentLocation={location}
          onUpdate={(loc) => setLocation(loc)}
          onClose={() => setShowLocationModal(false)}
        />
      )}
    </div>
  );
}

export default function SummrHomeApp() {
  return (
    <AppStateProvider>
      <SummrHomeWorkspace />
    </AppStateProvider>
  );
}
