'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_BAZAAR_ITEMS,
  INITIAL_BOOKINGS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_GUARDIAN_ALERTS,
  INITIAL_PG_LISTINGS,
  INITIAL_ROOMMATE_PROFILES,
} from '@/data/mockData';

const STORAGE_KEY = 'summrhome_hackathon_v4';

const defaultState = {
  location: null,
  currentUser: null,
  pgListings: INITIAL_PG_LISTINGS,
  bookings: INITIAL_BOOKINGS,
  bazaarItems: INITIAL_BAZAAR_ITEMS,
  guardianAlerts: INITIAL_GUARDIAN_ALERTS,
  chatMessages: INITIAL_CHAT_MESSAGES,
  roommates: INITIAL_ROOMMATE_PROFILES,
  roommateRequests: [],
};

const AppStateContext = createContext(null);

export function getStudentProfileStatus(user) {
  const studentDigits = (user?.mobile || '').replace(/\D/g, '').slice(-10);
  const guardianDigits = (user?.linkedGuardianMobile || '')
    .replace(/\D/g, '')
    .slice(-10);

  const checks = [
    { label: 'Full Name', done: Boolean(user?.name?.trim()) },
    { label: 'Contact Number', done: studentDigits.length === 10 },
    { label: 'College Name', done: Boolean(user?.collegeOrOrg?.trim()) },
    { label: 'Guardian Name', done: Boolean(user?.linkedGuardianName?.trim()) },
    { label: 'Guardian Contact', done: guardianDigits.length === 10 },
    { label: 'Student Photo', done: Boolean(user?.photo) },
  ];

  const completedCount = checks.filter((c) => c.done).length;
  const totalCount = checks.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const missingFields = checks.filter((c) => !c.done).map((c) => c.label);

  return {
    percentage,
    completedCount,
    totalCount,
    isComplete: completedCount === totalCount,
    missingFields,
  };
}

export function AppStateProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setState({
            location: parsed.location ?? null,
            currentUser: parsed.currentUser ?? null,
            pgListings: parsed.pgListings?.length
              ? parsed.pgListings
              : INITIAL_PG_LISTINGS,
            bookings: parsed.bookings ?? INITIAL_BOOKINGS,
            bazaarItems: parsed.bazaarItems?.length
              ? parsed.bazaarItems
              : INITIAL_BAZAAR_ITEMS,
            guardianAlerts: parsed.guardianAlerts ?? INITIAL_GUARDIAN_ALERTS,
            chatMessages: parsed.chatMessages ?? INITIAL_CHAT_MESSAGES,
            roommates: parsed.roommates?.length
              ? parsed.roommates
              : INITIAL_ROOMMATE_PROFILES,
            roommateRequests: parsed.roommateRequests ?? [],
          });
        }
      } catch {
        // Ignore corrupt local storage
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota exceeded
    }
  }, [state, hydrated]);

  const setLocation = (location) => {
    setState((prev) => ({
      ...prev,
      location,
      currentUser: prev.currentUser
        ? { ...prev.currentUser, location }
        : prev.currentUser,
    }));
  };

  const login = (payload) => {
    const idMap = {
      student: `student-${payload.mobile.replace(/\D/g, '').slice(-4) || 'user'}`,
      owner: 'owner-subrata',
      guardian: 'guardian-user',
    };

    const user = {
      id: idMap[payload.role],
      email: payload.email.trim(),
      name: payload.name.trim() || payload.email.split('@')[0],
      mobile: payload.mobile.trim(),
      role: payload.role,
      gender: payload.role === 'student' ? payload.gender || 'Male' : undefined,
      location: payload.location,
      collegeOrOrg: payload.collegeOrOrg,
      linkedStudentId:
        payload.role === 'guardian' ? 'student-ward' : undefined,
      linkedStudentName:
        payload.role === 'guardian'
          ? payload.collegeOrOrg || 'Linked Ward'
          : undefined,
      linkedGuardianName: payload.role === 'student' ? '' : undefined,
      linkedGuardianMobile: payload.role === 'student' ? '' : undefined,
      photo: '',
    };

    setState((prev) => ({
      ...prev,
      location: payload.location,
      currentUser: user,
    }));
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      currentUser: null,
    }));
  };

  const switchRoleDemo = (role) => {
    setState((prev) => {
      const loc = prev.location ?? {
        city: 'Sreerampore',
        district: 'Hooghly',
        neighborhood: 'Serampore College Gate',
        detectionMethod: 'manual',
      };
      const baseUser = prev.currentUser;
      const presets = {
        student: {
          id: baseUser?.id || 'student-user',
          email: baseUser?.email || 'student@summrhome.in',
          name: baseUser?.role === 'student' ? baseUser.name : 'Student User',
          mobile: baseUser?.mobile || '+91 98300 00001',
          role: 'student',
          gender: baseUser?.gender || 'Male',
          location: loc,
          collegeOrOrg: baseUser?.collegeOrOrg || 'Serampore College',
          linkedGuardianName: baseUser?.linkedGuardianName || '',
          linkedGuardianMobile: baseUser?.linkedGuardianMobile || '',
          photo: baseUser?.photo || '',
        },
        owner: {
          id: 'owner-subrata',
          email: 'subrata.pg@summrhome.in',
          name: 'Subrata Chatterjee',
          mobile: '+91 98304 51289',
          role: 'owner',
          location: loc,
          collegeOrOrg: 'Prothom Alo & Ganga Breeze PGs',
        },
        guardian: {
          id: 'guardian-user',
          email: baseUser?.role === 'guardian' ? baseUser.email : '',
          name: baseUser?.linkedGuardianName || '',
          mobile: baseUser?.linkedGuardianMobile || '',
          role: 'guardian',
          location: loc,
          linkedStudentId: 'student-ward',
          linkedStudentName:
            baseUser?.role === 'student' ? baseUser.name : '',
        },
      };
      return {
        ...prev,
        currentUser: presets[role],
      };
    });
  };

  const updateStudentProfile = (updates) => {
    setState((prev) => {
      if (!prev.currentUser) return prev;
      return {
        ...prev,
        currentUser: {
          ...prev.currentUser,
          ...updates,
        },
      };
    });
  };

  const addPGListing = (listing) => {
    const newPg = {
      ...listing,
      id: `pg-${Date.now()}`,
      ownerId: state.currentUser?.id ?? 'owner-subrata',
      ownerName: state.currentUser?.name ?? 'PG Owner',
      ownerMobile: state.currentUser?.mobile ?? '+91 98304 51289',
      verified: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({
      ...prev,
      pgListings: [newPg, ...prev.pgListings],
    }));
    return newPg;
  };

  const updateBedCount = (pgId, sharingType, delta) => {
    setState((prev) => ({
      ...prev,
      pgListings: prev.pgListings.map((pg) => {
        if (pg.id !== pgId) return pg;
        return {
          ...pg,
          sharingOptions: pg.sharingOptions.map((opt) => {
            if (opt.type !== sharingType) return opt;
            const nextBeds = Math.max(
              0,
              Math.min(opt.totalBeds, opt.availableBeds + delta)
            );
            return { ...opt, availableBeds: nextBeds };
          }),
        };
      }),
    }));
  };

  const updateWeeklyMenu = (pgId, menu) => {
    setState((prev) => ({
      ...prev,
      pgListings: prev.pgListings.map((pg) =>
        pg.id === pgId ? { ...pg, weeklyMenu: menu } : pg
      ),
    }));
  };

  const createBooking = (payload) => {
    const newBooking = {
      ...payload,
      id: `bk-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings],
    }));
    return newBooking;
  };

  const updateBookingStatus = (bookingId, status) => {
    setState((prev) => {
      const target = prev.bookings.find((b) => b.id === bookingId);
      const wasPending = target?.status === 'Pending';

      const updatedBookings = prev.bookings.map((b) =>
        b.id === bookingId ? { ...b, status } : b
      );

      const updatedPGs =
        wasPending && status === 'Approved' && target
          ? prev.pgListings.map((pg) => {
              if (pg.id !== target.pgId) return pg;
              return {
                ...pg,
                sharingOptions: pg.sharingOptions.map((opt) =>
                  opt.type === target.sharingType
                    ? { ...opt, availableBeds: Math.max(0, opt.availableBeds - 1) }
                    : opt
                ),
              };
            })
          : prev.pgListings;

      return {
        ...prev,
        bookings: updatedBookings,
        pgListings: updatedPGs,
      };
    });
  };

  const addBazaarItem = (item) => {
    const newItem = {
      ...item,
      showPhone: Boolean(item.showPhone),
      id: `baz-${Date.now()}`,
      sellerId: state.currentUser?.id ?? 'student-user',
      sellerName: state.currentUser?.name ?? 'Student Seller',
      sellerMobile: state.currentUser?.mobile ?? '',
      createdAt: 'Just now',
      status: 'Available',
    };
    setState((prev) => ({
      ...prev,
      bazaarItems: [newItem, ...prev.bazaarItems],
    }));
    return newItem;
  };

  const toggleBazaarItemSold = (itemId) => {
    setState((prev) => ({
      ...prev,
      bazaarItems: prev.bazaarItems.map((item) =>
        item.id === itemId
          ? { ...item, status: item.status === 'Available' ? 'Sold' : 'Available' }
          : item
      ),
    }));
  };

  const updateAlertStatus = (alertId, status) => {
    setState((prev) => ({
      ...prev,
      guardianAlerts: prev.guardianAlerts.map((al) =>
        al.id === alertId ? { ...al, status } : al
      ),
    }));
  };

  const createNightOutAlert = (message, locationNote) => {
    const newAlert = {
      id: `al-${Date.now()}`,
      studentId: state.currentUser?.id ?? 'student-user',
      studentName: state.currentUser?.name ?? 'Student',
      pgTitle: 'Prothom Alo, Sreerampore',
      type: 'Night-Out Request',
      message,
      timestamp: 'Just now',
      locationNote,
      status: 'Pending Approval',
    };
    setState((prev) => ({
      ...prev,
      guardianAlerts: [newAlert, ...prev.guardianAlerts],
    }));
  };

  const sendChatMessage = (threadId, text) => {
    if (!text.trim() || !state.currentUser) return;
    const roleSuffix =
      state.currentUser.role === 'owner'
        ? ' (Owner)'
        : state.currentUser.role === 'guardian'
        ? ' (Guardian)'
        : '';
    const newMsg = {
      id: `msg-${Date.now()}`,
      threadId,
      senderId: state.currentUser.id,
      senderName: `${state.currentUser.name}${roleSuffix}`,
      senderRole: state.currentUser.role,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setState((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, newMsg],
    }));
  };

  const addRoommateProfile = (profile) => {
    const newProfile = {
      ...profile,
      id: `rm-${Date.now()}`,
      name: state.currentUser?.name || profile.name || 'Student',
      gender: state.currentUser?.gender || profile.gender || 'Male',
      mobile: state.currentUser?.mobile || '+91 98300 00001',
    };
    setState((prev) => ({
      ...prev,
      roommates: [newProfile, ...prev.roommates],
    }));
    return newProfile;
  };

  const toggleRoommateRequest = (profileId) => {
    setState((prev) => {
      const exists = prev.roommateRequests.includes(profileId);
      return {
        ...prev,
        roommateRequests: exists
          ? prev.roommateRequests.filter((id) => id !== profileId)
          : [...prev.roommateRequests, profileId],
      };
    });
  };

  const resetDemoState = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  };

  return (
    <AppStateContext.Provider
      value={{
        ...state,
        hydrated,
        setLocation,
        login,
        logout,
        switchRoleDemo,
        updateStudentProfile,
        addPGListing,
        updateBedCount,
        updateWeeklyMenu,
        createBooking,
        updateBookingStatus,
        addBazaarItem,
        toggleBazaarItemSold,
        updateAlertStatus,
        createNightOutAlert,
        sendChatMessage,
        addRoommateProfile,
        toggleRoommateRequest,
        resetDemoState,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }
  return ctx;
}
