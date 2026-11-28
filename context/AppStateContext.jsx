'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  INITIAL_BAZAAR_ITEMS,
  INITIAL_BOOKINGS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_GUARDIAN_ALERTS,
  INITIAL_PG_LISTINGS,
  INITIAL_ROOMMATE_PROFILES,
} from '@/data/mockData';
import {
  OperationType,
  auth,
  clampString,
  compressDataUrl,
  db,
  googleProvider,
  handleFirestoreError,
  sanitizeId,
  testConnection,
} from '@/lib/firebase';

const LOCATION_STORAGE_KEY = 'summrhome_location_v1';

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
  notifications: [],
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

function mergeById(firestoreDocs, seedDocs) {
  const map = new Map();
  for (const item of seedDocs) {
    map.set(item.id, item);
  }
  for (const item of firestoreDocs) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
}

function toMillis(ts) {
  if (!ts) return 0;
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (typeof ts.seconds === 'number') return ts.seconds * 1000;
  if (typeof ts === 'string') {
    const parsed = Date.parse(ts);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function formatRelativeTime(ts) {
  const ms = toMillis(ts);
  if (!ms) return 'Just now';
  const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (diffSec < 60) return 'Just now';
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(ms).toLocaleDateString();
}

export function AppStateProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [fatalError, setFatalError] = useState(null);

  if (fatalError) {
    throw fatalError;
  }

  const surfaceFirestoreError = useCallback((err, op, path) => {
    try {
      handleFirestoreError(err, op, path);
    } catch (wrapped) {
      setFatalError(wrapped);
    }
  }, []);

  const pushNotification = useCallback(
    async ({ recipientUid, type, title, message, targetTab }) => {
      const uid = auth.currentUser?.uid;
      if (!uid || !recipientUid) return;
      const notifId = sanitizeId(`notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
      const payload = {
        id: notifId,
        recipientUid: sanitizeId(recipientUid),
        senderUid: uid,
        type: ['booking', 'bazaar', 'roomie', 'guardian', 'system'].includes(type)
          ? type
          : 'system',
        title: clampString(title || 'SummrHome Update', 140),
        message: clampString(message || 'New activity in your account.', 500),
        targetTab: ['pg', 'bazaar', 'roomies', 'dashboard'].includes(targetTab)
          ? targetTab
          : 'dashboard',
        read: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      try {
        await setDoc(doc(db, 'notifications', notifId), payload);
      } catch (err) {
        surfaceFirestoreError(err, OperationType.CREATE, `notifications/${notifId}`);
      }
    },
    [surfaceFirestoreError]
  );

  // Boot connection test + restore location + listen to Firebase Auth
  useEffect(() => {
    testConnection();
    let savedLoc = null;
    try {
      const rawLoc = window.localStorage.getItem(LOCATION_STORAGE_KEY);
      if (rawLoc) savedLoc = JSON.parse(rawLoc);
    } catch {
      // Ignore corrupt local storage
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setState({
          ...defaultState,
          location: savedLoc,
        });
        setHydrated(true);
        return;
      }

      const uid = fbUser.uid;
      try {
        const [pubSnap, privSnap] = await Promise.all([
          getDoc(doc(db, 'users', uid)),
          getDoc(doc(db, 'users', uid, 'private', 'info')),
        ]);

        if (pubSnap.exists()) {
          const pub = pubSnap.data();
          const priv = privSnap.exists() ? privSnap.data() : {};
          const restoredLoc = savedLoc || {
            city: pub.city || 'Sreerampore',
            district: pub.city || 'Hooghly',
            neighborhood: pub.neighborhood || 'Serampore College Gate',
            detectionMethod: 'manual',
          };
          try {
            window.localStorage.setItem(
              LOCATION_STORAGE_KEY,
              JSON.stringify(restoredLoc)
            );
          } catch {
            // Ignore storage errors
          }

          const restoredUser = {
            id: uid,
            uid,
            email: priv.email || fbUser.email || '',
            name: pub.name || fbUser.displayName || 'SummrHome User',
            mobile: priv.mobile || '',
            role: pub.role,
            gender: pub.role === 'student' ? pub.gender || 'Male' : undefined,
            location: restoredLoc,
            collegeOrOrg: pub.collegeOrOrg || '',
            linkedStudentId: pub.role === 'guardian' ? 'student-ward' : undefined,
            linkedStudentName: pub.linkedStudentName || '',
            linkedGuardianName: priv.linkedGuardianName || '',
            linkedGuardianMobile: priv.linkedGuardianMobile || '',
            photo: pub.photo || '',
          };

          setState((prev) => ({
            ...prev,
            location: restoredLoc,
            currentUser: restoredUser,
            roommateRequests: Array.isArray(priv.roommateRequests)
              ? priv.roommateRequests
              : [],
          }));
        } else {
          // Authenticated via Google, awaiting role/gender/OTP registration form
          setState((prev) => ({
            ...prev,
            location: prev.location || savedLoc,
            currentUser: null,
          }));
        }
      } catch (err) {
        surfaceFirestoreError(err, OperationType.GET, `users/${uid}`);
      } finally {
        setHydrated(true);
      }
    });

    return () => unsubscribe();
  }, [surfaceFirestoreError]);

  const currentUid = state.currentUser?.uid || null;
  const currentRole = state.currentUser?.role || null;

  // Real-time Firestore listeners (strictly gated behind authenticated & registered user)
  useEffect(() => {
    if (!hydrated || !firebaseUser || !currentUid || !currentRole) {
      return;
    }

    const unsubs = [];

    unsubs.push(
      onSnapshot(
        doc(db, 'users', currentUid, 'private', 'info'),
        (snap) => {
          if (!snap.exists()) return;
          const priv = snap.data();
          setState((prev) => ({
            ...prev,
            currentUser: prev.currentUser
              ? {
                  ...prev.currentUser,
                  email: priv.email || prev.currentUser.email,
                  mobile: priv.mobile ?? prev.currentUser.mobile,
                  linkedGuardianName:
                    priv.linkedGuardianName ?? prev.currentUser.linkedGuardianName,
                  linkedGuardianMobile:
                    priv.linkedGuardianMobile ??
                    prev.currentUser.linkedGuardianMobile,
                }
              : prev.currentUser,
            roommateRequests: Array.isArray(priv.roommateRequests)
              ? priv.roommateRequests
              : prev.roommateRequests,
          }));
        },
        (err) =>
          surfaceFirestoreError(
            err,
            OperationType.GET,
            `users/${currentUid}/private/info`
          )
      )
    );

    const notifQuery = query(
      collection(db, 'notifications'),
      where('recipientUid', '==', currentUid),
      limit(40)
    );
    unsubs.push(
      onSnapshot(
        notifQuery,
        (snap) => {
          const list = snap.docs
            .map((d) => {
              const data = d.data();
              return {
                ...data,
                id: d.id,
                timeLabel: formatRelativeTime(data.createdAt),
                sortMs: toMillis(data.createdAt),
              };
            })
            .sort((a, b) => b.sortMs - a.sortMs);
          setState((prev) => ({ ...prev, notifications: list }));
        },
        (err) => surfaceFirestoreError(err, OperationType.LIST, 'notifications')
      )
    );

    const pgQuery = query(collection(db, 'pgListings'), limit(50));
    unsubs.push(
      onSnapshot(
        pgQuery,
        (snap) => {
          const docs = snap.docs.map((d) => {
            const data = d.data();
            return {
              ...data,
              id: d.id,
              ownerId: data.ownerUid,
              ownerMobile: data.businessContact || '+91 98304 51289',
            };
          });
          setState((prev) => ({
            ...prev,
            pgListings: mergeById(docs, INITIAL_PG_LISTINGS),
          }));
        },
        (err) => surfaceFirestoreError(err, OperationType.LIST, 'pgListings')
      )
    );

    const bookingField = currentRole === 'owner' ? 'ownerUid' : 'studentUid';
    if (currentRole === 'student' || currentRole === 'owner') {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where(bookingField, '==', currentUid),
        limit(50)
      );
      unsubs.push(
        onSnapshot(
          bookingsQuery,
          (snap) => {
            const docs = snap.docs
              .map((d) => {
                const data = d.data();
                return {
                  ...data,
                  id: d.id,
                  studentId: data.studentUid,
                  sortMs: toMillis(data.createdAt),
                  createdAtLabel: data.moveInDate || 'Recently',
                };
              })
              .sort((a, b) => b.sortMs - a.sortMs);
            setState((prev) => ({
              ...prev,
              bookings:
                currentRole === 'owner'
                  ? mergeById(docs, INITIAL_BOOKINGS)
                  : docs,
            }));
          },
          (err) => surfaceFirestoreError(err, OperationType.LIST, 'bookings')
        )
      );
    }

    const bazaarQuery = query(collection(db, 'bazaarItems'), limit(60));
    unsubs.push(
      onSnapshot(
        bazaarQuery,
        (snap) => {
          const docs = snap.docs
            .map((d) => {
              const data = d.data();
              return {
                ...data,
                id: d.id,
                sellerId: data.sellerUid,
                sellerMobile: data.showPhone ? data.contactNumber || '' : '',
                createdAt: formatRelativeTime(data.createdAt),
                sortMs: toMillis(data.createdAt),
              };
            })
            .sort((a, b) => b.sortMs - a.sortMs);
          setState((prev) => ({
            ...prev,
            bazaarItems: mergeById(docs, INITIAL_BAZAAR_ITEMS),
          }));
        },
        (err) => surfaceFirestoreError(err, OperationType.LIST, 'bazaarItems')
      )
    );

    const roomieQuery = query(collection(db, 'roommates'), limit(60));
    unsubs.push(
      onSnapshot(
        roomieQuery,
        (snap) => {
          const docs = snap.docs.map((d) => ({
            ...d.data(),
            id: d.id,
          }));
          setState((prev) => ({
            ...prev,
            roommates: mergeById(docs, INITIAL_ROOMMATE_PROFILES),
          }));
        },
        (err) => surfaceFirestoreError(err, OperationType.LIST, 'roommates')
      )
    );

    if (currentRole === 'student' || currentRole === 'guardian') {
      const alertField =
        currentRole === 'guardian' ? 'guardianUid' : 'studentUid';
      const alertsQuery = query(
        collection(db, 'guardianAlerts'),
        where(alertField, '==', currentUid),
        limit(40)
      );
      unsubs.push(
        onSnapshot(
          alertsQuery,
          (snap) => {
            const docs = snap.docs
              .map((d) => {
                const data = d.data();
                return {
                  ...data,
                  id: d.id,
                  studentId: data.studentUid,
                  timestamp: formatRelativeTime(data.createdAt),
                  sortMs: toMillis(data.createdAt),
                };
              })
              .sort((a, b) => b.sortMs - a.sortMs);
            setState((prev) => ({
              ...prev,
              guardianAlerts:
                currentRole === 'guardian'
                  ? mergeById(docs, INITIAL_GUARDIAN_ALERTS)
                  : docs,
            }));
          },
          (err) =>
            surfaceFirestoreError(err, OperationType.LIST, 'guardianAlerts')
        )
      );
    }

    const chatQuery = query(collection(db, 'chatMessages'), limit(100));
    unsubs.push(
      onSnapshot(
        chatQuery,
        (snap) => {
          const docs = snap.docs
            .map((d) => {
              const data = d.data();
              return {
                ...data,
                id: d.id,
                senderId: data.senderUid,
                timestamp: data.timestampLabel || formatRelativeTime(data.createdAt),
                sortMs: toMillis(data.createdAt),
              };
            })
            .sort((a, b) => a.sortMs - b.sortMs);
          setState((prev) => ({
            ...prev,
            chatMessages: mergeById(docs, INITIAL_CHAT_MESSAGES),
          }));
        },
        (err) => surfaceFirestoreError(err, OperationType.LIST, 'chatMessages')
      )
    );

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [hydrated, firebaseUser, currentUid, currentRole, surfaceFirestoreError]);

  const setLocation = (location) => {
    try {
      window.localStorage.setItem(
        LOCATION_STORAGE_KEY,
        JSON.stringify(location)
      );
    } catch {
      // Ignore storage errors
    }

    setState((prev) => ({
      ...prev,
      location,
      currentUser: prev.currentUser
        ? { ...prev.currentUser, location }
        : prev.currentUser,
    }));

    const uid = auth.currentUser?.uid;
    if (uid && state.currentUser) {
      updateDoc(doc(db, 'users', uid), {
        city: clampString(location.city, 80),
        neighborhood: clampString(location.neighborhood, 100),
        updatedAt: serverTimestamp(),
      }).catch((err) =>
        surfaceFirestoreError(err, OperationType.UPDATE, `users/${uid}`)
      );
    }
  };

  const signInWithGoogle = async () => {
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (payload) => {
    setAuthLoading(true);
    try {
      let fbUser = auth.currentUser;
      if (!fbUser) {
        const result = await signInWithPopup(auth, googleProvider);
        fbUser = result.user;
      }
      const uid = fbUser.uid;
      const userRef = doc(db, 'users', uid);
      const privRef = doc(db, 'users', uid, 'private', 'info');
      const existingSnap = await getDoc(userRef);

      if (existingSnap.exists()) {
        // Returning account: respect stored locked role & gender
        const pub = existingSnap.data();
        const privSnap = await getDoc(privRef);
        const priv = privSnap.exists() ? privSnap.data() : {};
        const userObj = {
          id: uid,
          uid,
          email: priv.email || fbUser.email || '',
          name: pub.name || fbUser.displayName || 'SummrHome User',
          mobile: priv.mobile || payload.mobile.trim(),
          role: pub.role,
          gender: pub.role === 'student' ? pub.gender || 'Male' : undefined,
          location: payload.location,
          collegeOrOrg: pub.collegeOrOrg || '',
          linkedStudentId: pub.role === 'guardian' ? 'student-ward' : undefined,
          linkedStudentName: pub.linkedStudentName || '',
          linkedGuardianName: priv.linkedGuardianName || '',
          linkedGuardianMobile: priv.linkedGuardianMobile || '',
          photo: pub.photo || '',
        };
        setState((prev) => ({
          ...prev,
          location: payload.location,
          currentUser: userObj,
        }));
        return userObj;
      }

      const cleanCity = clampString(payload.location?.city || 'Sreerampore', 80);
      const cleanNb = clampString(
        payload.location?.neighborhood || 'College Gate',
        100
      );
      const cleanName = clampString(
        payload.name?.trim() || fbUser.displayName || 'SummrHome User',
        100
      );
      const cleanEmail = clampString(
        fbUser.email || payload.email?.trim() || '',
        150
      );
      const cleanMobile = clampString(payload.mobile?.trim() || '', 25);
      const cleanOrg = clampString(payload.collegeOrOrg || '', 150);

      const publicDoc = {
        uid,
        name: cleanName,
        role: payload.role,
        ...(payload.role === 'student'
          ? { gender: payload.gender === 'Female' ? 'Female' : 'Male' }
          : {}),
        collegeOrOrg: cleanOrg,
        city: cleanCity,
        neighborhood: cleanNb,
        photo: '',
        ...(payload.role === 'guardian'
          ? { linkedStudentName: cleanOrg || 'Linked Ward' }
          : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const privateDoc = {
        uid,
        email: cleanEmail,
        mobile: cleanMobile,
        linkedGuardianName: '',
        linkedGuardianMobile: '',
        roommateRequests: [],
        updatedAt: serverTimestamp(),
      };

      const welcomeId = sanitizeId(`notif-welcome-${Date.now()}`);
      const welcomeNotif = {
        id: welcomeId,
        recipientUid: uid,
        senderUid: uid,
        type: 'system',
        title: 'Account & Cloud Storage Active',
        message: `Welcome ${cleanName}! Your ${payload.role} profile and notifications are now synced to SummrHome Cloud.`,
        targetTab: payload.role === 'student' ? 'pg' : 'dashboard',
        read: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const batch = writeBatch(db);
      batch.set(userRef, publicDoc);
      batch.set(privRef, privateDoc);
      batch.set(doc(db, 'notifications', welcomeId), welcomeNotif);
      await batch.commit();

      const newUser = {
        id: uid,
        uid,
        email: cleanEmail,
        name: cleanName,
        mobile: cleanMobile,
        role: payload.role,
        gender:
          payload.role === 'student'
            ? payload.gender === 'Female'
              ? 'Female'
              : 'Male'
            : undefined,
        location: payload.location,
        collegeOrOrg: cleanOrg,
        linkedStudentId:
          payload.role === 'guardian' ? 'student-ward' : undefined,
        linkedStudentName:
          payload.role === 'guardian' ? cleanOrg || 'Linked Ward' : '',
        linkedGuardianName: '',
        linkedGuardianMobile: '',
        photo: '',
      };

      setState((prev) => ({
        ...prev,
        location: payload.location,
        currentUser: newUser,
      }));
      return newUser;
    } catch (err) {
      surfaceFirestoreError(err, OperationType.WRITE, 'users');
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      setState((prev) => ({
        ...defaultState,
        location: prev.location,
      }));
    }
  };

  const switchRoleDemo = (role) => {
    setState((prev) => {
      if (prev.currentUser?.role === 'student' && role !== 'student') {
        return prev;
      }
      return prev;
    });
  };

  const updateStudentProfile = async (updates) => {
    const uid = auth.currentUser?.uid;
    const prevUser = state.currentUser;
    if (!prevUser) return;

    const wasComplete = getStudentProfileStatus(prevUser).isComplete;
    const safeUpdates = { ...updates };
    if (prevUser.role === 'student' && prevUser.gender) {
      delete safeUpdates.gender;
    }
    delete safeUpdates.role;

    let compressedPhoto = safeUpdates.photo;
    if (typeof compressedPhoto === 'string' && compressedPhoto.length > 0) {
      compressedPhoto = await compressDataUrl(compressedPhoto, 400, 0.72);
      safeUpdates.photo = compressedPhoto;
    }

    const nextUser = {
      ...prevUser,
      ...safeUpdates,
    };

    setState((prev) => ({
      ...prev,
      currentUser: nextUser,
    }));

    if (!uid) return;

    try {
      const batch = writeBatch(db);
      const publicPatch = {
        updatedAt: serverTimestamp(),
      };
      if (typeof safeUpdates.name === 'string') {
        publicPatch.name = clampString(safeUpdates.name || prevUser.name, 100);
      }
      if (typeof safeUpdates.collegeOrOrg === 'string') {
        publicPatch.collegeOrOrg = clampString(safeUpdates.collegeOrOrg, 150);
      }
      if (typeof safeUpdates.photo === 'string') {
        publicPatch.photo = clampString(safeUpdates.photo, 200000);
      }

      const privatePatch = {
        updatedAt: serverTimestamp(),
      };
      let hasPrivate = false;
      if (typeof safeUpdates.mobile === 'string') {
        privatePatch.mobile = clampString(safeUpdates.mobile, 25);
        hasPrivate = true;
      }
      if (typeof safeUpdates.linkedGuardianName === 'string') {
        privatePatch.linkedGuardianName = clampString(
          safeUpdates.linkedGuardianName,
          100
        );
        hasPrivate = true;
      }
      if (typeof safeUpdates.linkedGuardianMobile === 'string') {
        privatePatch.linkedGuardianMobile = clampString(
          safeUpdates.linkedGuardianMobile,
          25
        );
        hasPrivate = true;
      }

      batch.update(doc(db, 'users', uid), publicPatch);
      if (hasPrivate) {
        batch.update(doc(db, 'users', uid, 'private', 'info'), privatePatch);
      }
      await batch.commit();

      const isNowComplete = getStudentProfileStatus(nextUser).isComplete;
      if (!wasComplete && isNowComplete) {
        pushNotification({
          recipientUid: uid,
          type: 'system',
          title: 'Profile 100% Complete',
          message:
            'Your student profile is verified. PG owner phone numbers and bed booking are now unlocked.',
          targetTab: 'pg',
        });
      }
    } catch (err) {
      surfaceFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const addPGListing = (listing) => {
    const uid = auth.currentUser?.uid || state.currentUser?.uid || 'owner-subrata';
    const pgId = sanitizeId(`pg-${Date.now()}`);
    const newPg = {
      ...listing,
      id: pgId,
      ownerId: uid,
      ownerUid: uid,
      ownerName: clampString(state.currentUser?.name || 'PG Owner', 100),
      ownerMobile: clampString(
        state.currentUser?.mobile || '+91 98304 51289',
        25
      ),
      verified: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setState((prev) => ({
      ...prev,
      pgListings: [newPg, ...prev.pgListings],
    }));

    if (auth.currentUser?.uid) {
      Promise.all(
        (listing.photos || []).slice(0, 6).map((p) => compressDataUrl(p, 640, 0.72))
      )
        .then((cleanPhotos) =>
          setDoc(doc(db, 'pgListings', pgId), {
            id: pgId,
            ownerUid: uid,
            ownerName: clampString(newPg.ownerName, 100),
            businessContact: clampString(newPg.ownerMobile, 25),
            title: clampString(listing.title, 140),
            city: clampString(listing.city, 80),
            district: clampString(listing.district || listing.city, 80),
            neighborhood: clampString(listing.neighborhood, 100),
            nearCollege: clampString(listing.nearCollege, 150),
            distanceText: clampString(listing.distanceText || '400 m walk', 60),
            gender: listing.gender,
            sharingOptions: (listing.sharingOptions || []).slice(0, 5),
            acAvailable: Boolean(listing.acAvailable),
            foodIncluded: Boolean(listing.foodIncluded),
            mealType: clampString(listing.mealType || 'Veg & Non-Veg', 60),
            weeklyMenu: (listing.weeklyMenu || []).slice(0, 7),
            amenities: (listing.amenities || []).slice(0, 15),
            photos: cleanPhotos.filter(Boolean),
            rules: (listing.rules || []).slice(0, 10),
            description: clampString(listing.description, 1000),
            verified: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        )
        .then(() =>
          pushNotification({
            recipientUid: uid,
            type: 'booking',
            title: 'PG Property Published',
            message: `${listing.title} is now live in ${listing.city}.`,
            targetTab: 'dashboard',
          })
        )
        .catch((err) =>
          surfaceFirestoreError(err, OperationType.CREATE, `pgListings/${pgId}`)
        );
    }

    return newPg;
  };

  const updateBedCount = (pgId, sharingType, delta) => {
    let nextSharingOptions = null;
    let targetOwnerUid = null;
    setState((prev) => ({
      ...prev,
      pgListings: prev.pgListings.map((pg) => {
        if (pg.id !== pgId) return pg;
        targetOwnerUid = pg.ownerUid || pg.ownerId;
        nextSharingOptions = pg.sharingOptions.map((opt) => {
          if (opt.type !== sharingType) return opt;
          const nextBeds = Math.max(
            0,
            Math.min(opt.totalBeds, opt.availableBeds + delta)
          );
          return { ...opt, availableBeds: nextBeds };
        });
        return { ...pg, sharingOptions: nextSharingOptions };
      }),
    }));

    const uid = auth.currentUser?.uid;
    if (uid && nextSharingOptions && targetOwnerUid === uid) {
      updateDoc(doc(db, 'pgListings', pgId), {
        sharingOptions: nextSharingOptions,
        updatedAt: serverTimestamp(),
      }).catch((err) =>
        surfaceFirestoreError(err, OperationType.UPDATE, `pgListings/${pgId}`)
      );
    }
  };

  const updateWeeklyMenu = (pgId, menu) => {
    const targetPg = state.pgListings.find((p) => p.id === pgId);
    setState((prev) => ({
      ...prev,
      pgListings: prev.pgListings.map((pg) =>
        pg.id === pgId ? { ...pg, weeklyMenu: menu } : pg
      ),
    }));

    const uid = auth.currentUser?.uid;
    if (uid && (targetPg?.ownerUid || targetPg?.ownerId) === uid) {
      updateDoc(doc(db, 'pgListings', pgId), {
        weeklyMenu: menu.slice(0, 7),
        updatedAt: serverTimestamp(),
      }).catch((err) =>
        surfaceFirestoreError(err, OperationType.UPDATE, `pgListings/${pgId}`)
      );
    }
  };

  const createBooking = (payload) => {
    const uid = auth.currentUser?.uid || state.currentUser?.uid || 'student-user';
    const targetPg = state.pgListings.find((p) => p.id === payload.pgId);
    const ownerUid = sanitizeId(
      targetPg?.ownerUid || targetPg?.ownerId || 'owner-subrata'
    );
    const bookingId = sanitizeId(`bk-${Date.now()}`);
    const newBooking = {
      ...payload,
      id: bookingId,
      studentId: uid,
      studentUid: uid,
      ownerUid,
      status: 'Pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setState((prev) => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings],
    }));

    if (auth.currentUser?.uid) {
      setDoc(doc(db, 'bookings', bookingId), {
        id: bookingId,
        pgId: sanitizeId(payload.pgId),
        pgTitle: clampString(payload.pgTitle, 140),
        ownerUid,
        studentUid: uid,
        studentName: clampString(payload.studentName, 100),
        studentMobile: clampString(payload.studentMobile || '', 25),
        guardianName: clampString(payload.guardianName || '', 100),
        guardianMobile: clampString(payload.guardianMobile || '', 25),
        sharingType: payload.sharingType,
        moveInDate: clampString(payload.moveInDate || '2026-12-01', 20),
        note: clampString(payload.note || '', 500),
        status: 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
        .then(() => {
          pushNotification({
            recipientUid: uid,
            type: 'booking',
            title: 'Booking Request Sent',
            message: `Your ${payload.sharingType} bed request for ${payload.pgTitle} is pending owner review.`,
            targetTab: 'dashboard',
          });
          if (ownerUid !== uid && !ownerUid.includes('-')) {
            pushNotification({
              recipientUid: ownerUid,
              type: 'booking',
              title: 'New PG Booking Request',
              message: `${payload.studentName} requested a ${payload.sharingType} bed at ${payload.pgTitle}.`,
              targetTab: 'dashboard',
            });
          }
        })
        .catch((err) =>
          surfaceFirestoreError(
            err,
            OperationType.CREATE,
            `bookings/${bookingId}`
          )
        );
    }

    return newBooking;
  };

  const updateBookingStatus = (bookingId, status) => {
    const target = state.bookings.find((b) => b.id === bookingId);
    setState((prev) => {
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

    const uid = auth.currentUser?.uid;
    if (uid && target?.ownerUid === uid) {
      updateDoc(doc(db, 'bookings', bookingId), {
        status,
        updatedAt: serverTimestamp(),
      })
        .then(() => {
          if (target?.studentUid) {
            pushNotification({
              recipientUid: target.studentUid,
              type: 'booking',
              title: `Booking ${status}`,
              message: `Your request for ${target.pgTitle} (${target.sharingType}) has been ${status.toLowerCase()}.`,
              targetTab: 'dashboard',
            });
          }
        })
        .catch((err) =>
          surfaceFirestoreError(
            err,
            OperationType.UPDATE,
            `bookings/${bookingId}`
          )
        );
    }
  };

  const addBazaarItem = (item) => {
    const uid = auth.currentUser?.uid || state.currentUser?.uid || 'student-user';
    const itemId = sanitizeId(`baz-${Date.now()}`);
    const showPhone = Boolean(item.showPhone);
    const contactNum = showPhone
      ? clampString(state.currentUser?.mobile || '', 25)
      : '';

    const newItem = {
      ...item,
      showPhone,
      id: itemId,
      sellerId: uid,
      sellerUid: uid,
      sellerName: clampString(state.currentUser?.name || 'Student Seller', 100),
      sellerMobile: contactNum,
      createdAt: 'Just now',
      status: 'Available',
    };

    setState((prev) => ({
      ...prev,
      bazaarItems: [newItem, ...prev.bazaarItems],
    }));

    if (auth.currentUser?.uid) {
      Promise.all(
        (item.photos || []).slice(0, 5).map((p) => compressDataUrl(p, 640, 0.72))
      )
        .then((cleanPhotos) =>
          setDoc(doc(db, 'bazaarItems', itemId), {
            id: itemId,
            sellerUid: uid,
            sellerName: clampString(newItem.sellerName, 100),
            contactNumber: contactNum,
            showPhone,
            title: clampString(item.title, 140),
            category: clampString(item.category, 60),
            price: Math.max(0, Math.min(500000, Number(item.price) || 0)),
            condition: clampString(item.condition || 'Used', 40),
            city: clampString(item.city || 'Sreerampore', 80),
            neighborhood: clampString(item.neighborhood || 'College Gate', 100),
            description: clampString(item.description, 1000),
            photos: cleanPhotos.filter(Boolean),
            status: 'Available',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        )
        .then(() =>
          pushNotification({
            recipientUid: uid,
            type: 'bazaar',
            title: 'Bazaar Ad Published',
            message: `"${item.title}" is now listed on Student Bazaar.`,
            targetTab: 'bazaar',
          })
        )
        .catch((err) =>
          surfaceFirestoreError(
            err,
            OperationType.CREATE,
            `bazaarItems/${itemId}`
          )
        );
    }

    return newItem;
  };

  const toggleBazaarItemSold = (itemId) => {
    const target = state.bazaarItems.find((i) => i.id === itemId);
    const nextStatus = target?.status === 'Available' ? 'Sold' : 'Available';
    setState((prev) => ({
      ...prev,
      bazaarItems: prev.bazaarItems.map((item) =>
        item.id === itemId ? { ...item, status: nextStatus } : item
      ),
    }));

    const uid = auth.currentUser?.uid;
    if (uid && (target?.sellerUid || target?.sellerId) === uid) {
      updateDoc(doc(db, 'bazaarItems', itemId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      }).catch((err) =>
        surfaceFirestoreError(
          err,
          OperationType.UPDATE,
          `bazaarItems/${itemId}`
        )
      );
    }
  };

  const updateAlertStatus = (alertId, status) => {
    const target = state.guardianAlerts.find((a) => a.id === alertId);
    setState((prev) => ({
      ...prev,
      guardianAlerts: prev.guardianAlerts.map((al) =>
        al.id === alertId ? { ...al, status } : al
      ),
    }));

    const uid = auth.currentUser?.uid;
    if (uid && target?.guardianUid === uid) {
      updateDoc(doc(db, 'guardianAlerts', alertId), {
        status,
        updatedAt: serverTimestamp(),
      })
        .then(() => {
          if (target?.studentUid) {
            pushNotification({
              recipientUid: target.studentUid,
              type: 'guardian',
              title: `Night-Out ${status}`,
              message: `Your night-out alert (${target.message}) was marked ${status}.`,
              targetTab: 'dashboard',
            });
          }
        })
        .catch((err) =>
          surfaceFirestoreError(
            err,
            OperationType.UPDATE,
            `guardianAlerts/${alertId}`
          )
        );
    }
  };

  const createNightOutAlert = (message, locationNote) => {
    const uid = auth.currentUser?.uid || state.currentUser?.uid || 'student-user';
    const alertId = sanitizeId(`al-${Date.now()}`);
    const newAlert = {
      id: alertId,
      studentId: uid,
      studentUid: uid,
      guardianUid: uid,
      studentName: clampString(state.currentUser?.name || 'Student', 100),
      pgTitle: 'Prothom Alo, Sreerampore',
      type: 'Night-Out Request',
      message: clampString(message, 500),
      locationNote: clampString(locationNote || 'Local Area', 150),
      timestamp: 'Just now',
      status: 'Pending Approval',
    };

    setState((prev) => ({
      ...prev,
      guardianAlerts: [newAlert, ...prev.guardianAlerts],
    }));

    if (auth.currentUser?.uid) {
      setDoc(doc(db, 'guardianAlerts', alertId), {
        id: alertId,
        studentUid: uid,
        guardianUid: uid,
        studentName: newAlert.studentName,
        pgTitle: newAlert.pgTitle,
        type: newAlert.type,
        message: newAlert.message,
        locationNote: newAlert.locationNote,
        status: 'Pending Approval',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
        .then(() =>
          pushNotification({
            recipientUid: uid,
            type: 'guardian',
            title: 'Night-Out Request Sent',
            message: `Alert logged for ${newAlert.locationNote}: "${newAlert.message}"`,
            targetTab: 'dashboard',
          })
        )
        .catch((err) =>
          surfaceFirestoreError(
            err,
            OperationType.CREATE,
            `guardianAlerts/${alertId}`
          )
        );
    }
  };

  const sendChatMessage = (threadId, text, recipientUid) => {
    if (!text.trim() || !state.currentUser) return;
    const uid = auth.currentUser?.uid || state.currentUser.id;
    const msgId = sanitizeId(`msg-${Date.now()}`);
    const cleanThreadId = sanitizeId(threadId);
    const roleSuffix =
      state.currentUser.role === 'owner'
        ? ' (Owner)'
        : state.currentUser.role === 'guardian'
        ? ' (Guardian)'
        : '';
    const senderName = clampString(`${state.currentUser.name}${roleSuffix}`, 120);
    const timestampLabel = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMsg = {
      id: msgId,
      threadId: cleanThreadId,
      senderId: uid,
      senderUid: uid,
      senderName,
      senderRole: state.currentUser.role,
      text: clampString(text.trim(), 1000),
      timestamp: timestampLabel,
    };

    setState((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, newMsg],
    }));

    if (auth.currentUser?.uid) {
      setDoc(doc(db, 'chatMessages', msgId), {
        id: msgId,
        threadId: cleanThreadId,
        senderUid: uid,
        senderName,
        senderRole: state.currentUser.role,
        text: newMsg.text,
        timestampLabel,
        createdAt: serverTimestamp(),
      })
        .then(() => {
          if (recipientUid && recipientUid !== uid && !recipientUid.includes('-')) {
            pushNotification({
              recipientUid,
              type: 'bazaar',
              title: `New Message from ${state.currentUser.name}`,
              message: newMsg.text,
              targetTab: threadId.startsWith('roomie-') ? 'roomies' : 'bazaar',
            });
          }
        })
        .catch((err) =>
          surfaceFirestoreError(
            err,
            OperationType.CREATE,
            `chatMessages/${msgId}`
          )
        );
    }
  };

  const addRoommateProfile = (profile) => {
    const uid = auth.currentUser?.uid || state.currentUser?.uid || 'student-user';
    const profileId = sanitizeId(`rm-${Date.now()}`);
    const newProfile = {
      ...profile,
      id: profileId,
      studentUid: uid,
      name: clampString(state.currentUser?.name || profile.name || 'Student', 100),
      gender: state.currentUser?.gender || profile.gender || 'Male',
      mobile: state.currentUser?.mobile || '',
    };

    setState((prev) => ({
      ...prev,
      roommates: [newProfile, ...prev.roommates],
    }));

    if (auth.currentUser?.uid) {
      setDoc(doc(db, 'roommates', profileId), {
        id: profileId,
        studentUid: uid,
        name: newProfile.name,
        gender: newProfile.gender === 'Female' ? 'Female' : 'Male',
        college: clampString(profile.college || 'Local College', 150),
        year: clampString(profile.year || '1st Year', 40),
        city: clampString(profile.city || 'Sreerampore', 80),
        neighborhood: clampString(profile.neighborhood || 'College Gate', 100),
        targetPG: clampString(profile.targetPG || 'Nearby PG', 140),
        sharing: clampString(profile.sharing || 'Double', 40),
        budget: Math.max(0, Math.min(100000, Number(profile.budget) || 5500)),
        sleepSchedule: clampString(profile.sleepSchedule || 'Night Owl', 40),
        foodHabit: clampString(profile.foodHabit || 'Non-Veg', 40),
        studyStyle: clampString(profile.studyStyle || 'Quiet Focus', 40),
        bio: clampString(profile.bio || 'Looking for a compatible roommate.', 500),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
        .then(() =>
          pushNotification({
            recipientUid: uid,
            type: 'roomie',
            title: 'Roomie Card Posted',
            message: `Your ${newProfile.gender} roommate card is live in ${newProfile.city}.`,
            targetTab: 'roomies',
          })
        )
        .catch((err) =>
          surfaceFirestoreError(
            err,
            OperationType.CREATE,
            `roommates/${profileId}`
          )
        );
    }

    return newProfile;
  };

  const toggleRoommateRequest = (profileId) => {
    const exists = state.roommateRequests.includes(profileId);
    const nextList = exists
      ? state.roommateRequests.filter((id) => id !== profileId)
      : [...state.roommateRequests, profileId].slice(0, 50);

    setState((prev) => ({
      ...prev,
      roommateRequests: nextList,
    }));

    const uid = auth.currentUser?.uid;
    if (uid) {
      updateDoc(doc(db, 'users', uid, 'private', 'info'), {
        roommateRequests: nextList,
        updatedAt: serverTimestamp(),
      })
        .then(() => {
          if (!exists) {
            const targetRm = state.roommates.find((r) => r.id === profileId);
            pushNotification({
              recipientUid: uid,
              type: 'roomie',
              title: 'Roomie Team-Up Sent',
              message: `You teamed up with ${targetRm?.name || 'a roommate'}.`,
              targetTab: 'roomies',
            });
          }
        })
        .catch((err) =>
          surfaceFirestoreError(
            err,
            OperationType.UPDATE,
            `users/${uid}/private/info`
          )
        );
    }
  };

  const markNotificationRead = (notifId) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === notifId ? { ...n, read: true } : n
      ),
    }));
    const uid = auth.currentUser?.uid;
    if (uid) {
      updateDoc(doc(db, 'notifications', notifId), {
        read: true,
        updatedAt: serverTimestamp(),
      }).catch((err) =>
        surfaceFirestoreError(
          err,
          OperationType.UPDATE,
          `notifications/${notifId}`
        )
      );
    }
  };

  const markAllNotificationsRead = () => {
    const unread = state.notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));

    const uid = auth.currentUser?.uid;
    if (uid) {
      const batch = writeBatch(db);
      unread.forEach((n) => {
        batch.update(doc(db, 'notifications', n.id), {
          read: true,
          updatedAt: serverTimestamp(),
        });
      });
      batch
        .commit()
        .catch((err) =>
          surfaceFirestoreError(err, OperationType.UPDATE, 'notifications')
        );
    }
  };

  const deleteNotification = (notifId) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== notifId),
    }));
    const uid = auth.currentUser?.uid;
    if (uid) {
      deleteDoc(doc(db, 'notifications', notifId)).catch((err) =>
        surfaceFirestoreError(
          err,
          OperationType.DELETE,
          `notifications/${notifId}`
        )
      );
    }
  };

  const resetDemoState = async () => {
    window.localStorage.removeItem(LOCATION_STORAGE_KEY);
    await signOut(auth);
    setState(defaultState);
  };

  return (
    <AppStateContext.Provider
      value={{
        ...state,
        firebaseUser,
        authLoading,
        hydrated,
        setLocation,
        signInWithGoogle,
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
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
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
