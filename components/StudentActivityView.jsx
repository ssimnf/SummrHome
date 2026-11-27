'use client';

import React, { useState } from 'react';
import {
  BedDouble,
  Camera,
  CheckCircle2,
  Clock,
  Package,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import {
  getStudentProfileStatus,
  useAppState,
} from '@/context/AppStateContext';
import { getTownColleges } from '@/data/locations';
import StudentAvatar from '@/components/StudentAvatar';

export default function StudentActivityView() {
  const {
    currentUser,
    location,
    bookings,
    bazaarItems,
    toggleBazaarItemSold,
    createNightOutAlert,
    updateStudentProfile,
  } = useAppState();

  const activeCity = location?.city || 'Sreerampore';
  const localColleges = getTownColleges(activeCity);

  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [gender, setGender] = useState(currentUser?.gender || 'Male');
  const [studentDigits, setStudentDigits] = useState(
    (currentUser?.mobile || '').replace(/\D/g, '').slice(-10)
  );
  const [collegeName, setCollegeName] = useState(
    currentUser?.collegeOrOrg || localColleges[0] || ''
  );
  const [guardianName, setGuardianName] = useState(
    currentUser?.linkedGuardianName || ''
  );
  const [guardianDigits, setGuardianDigits] = useState(
    (currentUser?.linkedGuardianMobile || '').replace(/\D/g, '').slice(-10)
  );
  const [photo, setPhoto] = useState(currentUser?.photo || '');
  const [profileSaved, setProfileSaved] = useState(false);

  const [nightOutReason, setNightOutReason] = useState('');
  const [nightOutDestination, setNightOutDestination] = useState(
    'Salt Lake Sector V'
  );
  const [alertSent, setAlertSent] = useState(false);

  const profileStatus = getStudentProfileStatus(currentUser);
  const myBookings = bookings.filter((b) => b.studentId === currentUser?.id);
  const myAds = bazaarItems.filter((i) => i.sellerId === currentUser?.id);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhoto(reader.result);
        updateStudentProfile({ photo: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto('');
    updateStudentProfile({ photo: '' });
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    const formattedStudent =
      studentDigits.length === 10
        ? `+91 ${studentDigits.slice(0, 5)} ${studentDigits.slice(5)}`
        : currentUser?.mobile || '';
    const formattedGuardian =
      guardianDigits.length === 10
        ? `+91 ${guardianDigits.slice(0, 5)} ${guardianDigits.slice(5)}`
        : '';

    updateStudentProfile({
      name: fullName.trim() || currentUser?.name,
      gender,
      mobile: formattedStudent,
      collegeOrOrg: collegeName.trim(),
      linkedGuardianName: guardianName.trim(),
      linkedGuardianMobile: formattedGuardian,
      photo,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleNightOutSubmit = (e) => {
    e.preventDefault();
    if (!nightOutReason.trim()) return;
    createNightOutAlert(nightOutReason.trim(), nightOutDestination.trim());
    setNightOutReason('');
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 3000);
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <StudentAvatar
              src={photo || currentUser?.photo}
              alt={currentUser?.name}
              size="xl"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-teal-700">
                Student Profile · {activeCity}
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                {currentUser?.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUser?.collegeOrOrg || 'Add your college name'} ·{' '}
                <span className="font-mono tabular-nums">
                  {currentUser?.mobile}
                </span>
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer">
                  <Camera className="w-3.5 h-3.5" />
                  <span>{photo ? 'Change Photo' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {photo && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:w-80 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Profile Completion
              </span>
              <span
                className={`font-mono tabular-nums font-bold ${
                  profileStatus.isComplete ? 'text-teal-700' : 'text-amber-700'
                }`}
              >
                {profileStatus.percentage}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  profileStatus.isComplete ? 'bg-teal-700' : 'bg-amber-600'
                }`}
                style={{ width: `${profileStatus.percentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-600">
              {profileStatus.isComplete
                ? '100% complete — you can contact PG owners and book beds.'
                : `Missing for PG booking: ${profileStatus.missingFields.join(
                    ', '
                  )}`}
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="prof-name"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Student Full Name
              </label>
              <input
                id="prof-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 px-3.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label
                htmlFor="prof-mobile"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Student Contact Number (10 digits)
              </label>
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-teal-700 h-11">
                <span className="px-3 h-full flex items-center bg-slate-100 border-r border-slate-300 text-xs font-mono font-semibold text-slate-700">
                  +91
                </span>
                <input
                  id="prof-mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  value={studentDigits}
                  onChange={(e) =>
                    setStudentDigits(
                      e.target.value.replace(/\D/g, '').slice(0, 10)
                    )
                  }
                  placeholder="10-digit number"
                  className="flex-1 px-3 text-sm font-mono tabular-nums focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="prof-college"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                College Name
              </label>
              <select
                id="prof-college"
                value={
                  localColleges.includes(collegeName) ? collegeName : '__custom__'
                }
                onChange={(e) => {
                  if (e.target.value !== '__custom__') {
                    setCollegeName(e.target.value);
                  }
                }}
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                {localColleges.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
                {!localColleges.includes(collegeName) && collegeName && (
                  <option value="__custom__">{collegeName}</option>
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="prof-gname"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Guardian Name
              </label>
              <input
                id="prof-gname"
                type="text"
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Parent or local guardian full name"
                className="w-full h-11 px-3.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label
                htmlFor="prof-gmobile"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Guardian Contact Number (10 digits)
              </label>
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-teal-700 h-11">
                <span className="px-3 h-full flex items-center bg-slate-100 border-r border-slate-300 text-xs font-mono font-semibold text-slate-700">
                  +91
                </span>
                <input
                  id="prof-gmobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  value={guardianDigits}
                  onChange={(e) =>
                    setGuardianDigits(
                      e.target.value.replace(/\D/g, '').slice(0, 10)
                    )
                  }
                  placeholder="10-digit guardian number"
                  className="flex-1 px-3 text-sm font-mono tabular-nums focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="prof-gender"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Gender (PG & Roomie Filter)
              </label>
              <select
                id="prof-gender"
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  updateStudentProfile({ gender: e.target.value });
                }}
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto h-11 px-6 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Save Student Profile
              </button>
            </div>
          </div>

          {profileSaved && (
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Profile saved ({getStudentProfileStatus(currentUser).percentage}
                % complete).
              </span>
            </p>
          )}
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-teal-700" />
              <span>PG Booking Requests</span>
            </h2>

            {myBookings.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">
                You have not sent any PG booking requests yet. Browse Find PG to
                request a bed.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {myBookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="py-3.5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {bk.pgTitle}
                      </div>
                      <div className="text-xs text-slate-500">
                        {bk.sharingType} Sharing · Move-in {bk.moveInDate} ·{' '}
                        {bk.pgNeighborhood}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold whitespace-nowrap ${
                        bk.status === 'Approved'
                          ? 'text-teal-700'
                          : bk.status === 'Declined'
                          ? 'text-red-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {bk.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={handleNightOutSubmit}
            className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Request Guardian Night-Out Approval</span>
            </h2>
            <p className="text-xs text-slate-500">
              Sends an instant alert to your linked Guardian portal for
              hackathon, lab, or weekend travel approval.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={nightOutReason}
                onChange={(e) => setNightOutReason(e.target.value)}
                placeholder="Reason (e.g., Late lab / visiting relative)"
                className="h-11 px-3.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              <input
                type="text"
                value={nightOutDestination}
                onChange={(e) => setNightOutDestination(e.target.value)}
                placeholder="Destination neighborhood"
                className="h-11 px-3.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              {alertSent ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Alert sent to Guardian Portal</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Notifies Guardian & PG Warden</span>
                </span>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Send Approval Request
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 h-fit">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-teal-700" />
            <span>My Bazaar Listings</span>
          </h2>

          {myAds.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">
              No items posted by you yet. Open Student Bazaar to sell or give
              away items locally.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {myAds.map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 font-mono tabular-nums">
                      {item.isFree
                        ? 'FREE'
                        : `₹${item.price.toLocaleString('en-IN')}`}{' '}
                      · {item.neighborhood} · {item.status}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleBazaarItemSold(item.id)}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {item.status === 'Available' ? 'Mark Sold' : 'Re-list'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
