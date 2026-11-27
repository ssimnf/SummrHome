'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  LogOut,
  MapPin,
  RotateCcw,
  Sun,
  UserCheck,
} from 'lucide-react';
import { getStudentProfileStatus } from '@/context/AppStateContext';
import StudentAvatar from '@/components/StudentAvatar';

export default function TopNav({
  user,
  location,
  activeTab,
  onSelectTab,
  onOpenLocationModal,
  onSwitchRole,
  onLogout,
  onResetDemo,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profileStatus =
    user.role === 'student' ? getStudentProfileStatus(user) : null;

  const roleDashboardLabel =
    user.role === 'owner'
      ? 'Owner Console'
      : user.role === 'guardian'
      ? 'Guardian Safety'
      : `My Profile (${profileStatus?.percentage ?? 0}%)`;

  const roleBadgeText =
    user.role === 'owner'
      ? 'Owner'
      : user.role === 'guardian'
      ? 'Guardian'
      : 'Student';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-8">
        <button
          type="button"
          onClick={() => onSelectTab('pg')}
          className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Sun
            className="w-5 h-5 text-slate-950 fill-slate-950 shrink-0"
            strokeWidth={2.2}
            aria-hidden="true"
          />
          <span>SummrHome</span>
        </button>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => onSelectTab('pg')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'pg'
                ? 'border-teal-700 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Find PG
          </button>
          {user.role !== 'owner' && (
            <button
              type="button"
              onClick={() => onSelectTab('bazaar')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'bazaar'
                  ? 'border-teal-700 text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Bazaar
            </button>
          )}
          <button
            type="button"
            onClick={() => onSelectTab('roomies')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'roomies'
                ? 'border-teal-700 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Roomie Match
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'border-teal-700 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {roleDashboardLabel}
          </button>
        </nav>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {user.role === 'student' && (
              <StudentAvatar src={user.photo} alt={user.name} size="sm" />
            )}
            <span className="max-w-[115px] sm:max-w-[150px] truncate">
              {user.name || roleBadgeText}
              {user.name ? ` · ${roleBadgeText}` : ''}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2.5">
                {user.role === 'student' && (
                  <StudentAvatar src={user.photo} alt={user.name} size="md" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {user.name || roleBadgeText}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {[user.email, user.mobile].filter(Boolean).join(' · ') ||
                      'Details not provided'}
                  </p>
                  {profileStatus && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab('dashboard');
                        setMenuOpen(false);
                      }}
                      className="mt-1 text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer tabular-nums"
                    >
                      Profile: {profileStatus.percentage}% complete
                    </button>
                  )}
                </div>
              </div>

              <div className="px-2 py-1.5 border-b border-slate-100">
                <p className="px-2 py-1 text-[11px] font-medium text-slate-400">
                  Switch Demo Role
                </p>
                {['student', 'owner', 'guardian'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      onSwitchRole(r);
                      if (r !== 'student') onSelectTab('dashboard');
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                      user.role === r
                        ? 'bg-teal-50 text-teal-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>
                      {r === 'student'
                        ? 'Student View'
                        : r === 'owner'
                        ? 'PG Owner / Admin'
                        : 'Guardian Portal'}
                    </span>
                    {user.role === r && <UserCheck className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>

              <div className="px-2 pt-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onOpenLocationModal();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Change Area ({location.city})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetDemo();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Prototype Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden flex items-center border-t border-slate-100 px-2 py-1.5 gap-1 bg-white">
        <button
          type="button"
          onClick={() => onSelectTab('pg')}
          className={`flex-1 py-2 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
            activeTab === 'pg' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Find PG
        </button>
        {user.role !== 'owner' && (
          <button
            type="button"
            onClick={() => onSelectTab('bazaar')}
            className={`flex-1 py-2 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'bazaar'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600'
            }`}
          >
            Bazaar
          </button>
        )}
        <button
          type="button"
          onClick={() => onSelectTab('roomies')}
          className={`flex-1 py-2 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
            activeTab === 'roomies'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600'
          }`}
        >
          Roomies
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`flex-1 py-2 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600'
          }`}
        >
          {roleDashboardLabel}
        </button>
      </div>
    </header>
  );
}
