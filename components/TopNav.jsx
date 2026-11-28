'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  ChevronDown,
  Lock,
  LogOut,
  MapPin,
  RotateCcw,
  Sun,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { getStudentProfileStatus } from '@/context/AppStateContext';
import StudentAvatar from '@/components/StudentAvatar';

export default function TopNav({
  user,
  location,
  activeTab,
  notifications = [],
  onSelectTab,
  onOpenLocationModal,
  onSwitchRole,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onDeleteNotification,
  onLogout,
  onResetDemo,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

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

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative shrink-0" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setNotifOpen((o) => !o);
                setMenuOpen(false);
              }}
              aria-label={`Notifications (${unreadCount} unread)`}
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-teal-700 text-white text-[10px] font-bold font-mono flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/80">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Notifications
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {unreadCount > 0
                        ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`
                        : 'All caught up'}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onMarkAllNotificationsRead?.()}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-slate-500">
                      No notifications yet. Bookings, Bazaar chats, and account
                      alerts will appear here.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 flex items-start gap-2.5 transition-colors ${
                          notif.read ? 'bg-white' : 'bg-teal-50/40'
                        }`}
                      >
                        <span
                          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                            notif.read ? 'bg-slate-200' : 'bg-teal-600'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!notif.read) onMarkNotificationRead?.(notif.id);
                            if (
                              notif.targetTab &&
                              !(
                                user.role === 'owner' &&
                                notif.targetTab === 'bazaar'
                              )
                            ) {
                              onSelectTab(notif.targetTab);
                            }
                            setNotifOpen(false);
                          }}
                          className="flex-1 text-left min-w-0 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                              {notif.timeLabel || 'Just now'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteNotification?.(notif.id)}
                          aria-label="Delete notification"
                          className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                setMenuOpen((o) => !o);
                setNotifOpen(false);
              }}
              className="inline-flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {user.role === 'student' && (
                <StudentAvatar src={user.photo} alt={user.name} size="sm" />
              )}
              <span className="max-w-[100px] sm:max-w-[140px] truncate">
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

                {user.role === 'student' ? (
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-600 bg-slate-50/70">
                    <span className="font-medium">Account Role</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>Student (Locked)</span>
                    </span>
                  </div>
                ) : (
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
                )}

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
                    <span>Reset Session</span>
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
