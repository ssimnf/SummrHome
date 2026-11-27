'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  ArrowRight,
  Check,
  Utensils,
  Snowflake,
  BedDouble,
  Lock,
  Camera,
  Trash2,
} from 'lucide-react';
import {
  getStudentProfileStatus,
  useAppState,
} from '@/context/AppStateContext';
import { getTownColleges, getTownNeighborhoods } from '@/data/locations';
import SafePhoto from '@/components/SafePhoto';
import StudentAvatar from '@/components/StudentAvatar';

export function PGDetailModal({ pg, onClose }) {
  const {
    currentUser,
    location,
    createBooking,
    bookings,
    updateStudentProfile,
  } = useAppState();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [selectedSharing, setSelectedSharing] = useState(
    pg.sharingOptions[0]?.type || 'Double'
  );
  const [moveInDate, setMoveInDate] = useState('2026-12-01');
  const [guardianMobile, setGuardianMobile] = useState(
    currentUser?.linkedGuardianMobile || ''
  );
  const [note, setNote] = useState('');
  const [submittedBookingId, setSubmittedBookingId] = useState(null);

  const activeCity = location?.city || pg.city || 'Sreerampore';
  const localColleges = getTownColleges(activeCity);

  const [quickName, setQuickName] = useState(currentUser?.name || '');
  const [quickStudentDigits, setQuickStudentDigits] = useState(
    (currentUser?.mobile || '').replace(/\D/g, '').slice(-10)
  );
  const [quickCollege, setQuickCollege] = useState(
    currentUser?.collegeOrOrg || localColleges[0] || ''
  );
  const [quickGuardianName, setQuickGuardianName] = useState(
    currentUser?.linkedGuardianName || ''
  );
  const [quickGuardianDigits, setQuickGuardianDigits] = useState(
    (currentUser?.linkedGuardianMobile || '').replace(/\D/g, '').slice(-10)
  );
  const [quickPhoto, setQuickPhoto] = useState(currentUser?.photo || '');
  const [quickError, setQuickError] = useState('');

  const profileStatus = getStudentProfileStatus(currentUser);
  const isIncompleteStudent =
    currentUser?.role === 'student' && !profileStatus.isComplete;

  const existingBooking = bookings.find(
    (b) => b.pgId === pg.id && b.studentId === currentUser?.id
  );

  const selectedOption =
    pg.sharingOptions.find((o) => o.type === selectedSharing) ||
    pg.sharingOptions[0];

  const handleQuickPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setQuickPhoto(reader.result);
        updateStudentProfile({ photo: reader.result });
        setQuickError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQuickPhoto = () => {
    setQuickPhoto('');
    updateStudentProfile({ photo: '' });
  };

  const handleCompleteProfileSubmit = (e) => {
    e.preventDefault();
    if (!quickName.trim()) {
      setQuickError('Enter your full name.');
      return;
    }
    if (quickStudentDigits.length !== 10) {
      setQuickError('Enter a valid 10-digit student mobile number after +91.');
      return;
    }
    if (!quickCollege.trim()) {
      setQuickError('Select or enter your college name.');
      return;
    }
    if (!quickGuardianName.trim()) {
      setQuickError('Enter your guardian full name.');
      return;
    }
    if (quickGuardianDigits.length !== 10) {
      setQuickError('Enter a valid 10-digit guardian contact number after +91.');
      return;
    }
    if (!quickPhoto) {
      setQuickError('Upload your student photo to reach 100% completion.');
      return;
    }

    const formattedStudent = `+91 ${quickStudentDigits.slice(
      0,
      5
    )} ${quickStudentDigits.slice(5)}`;
    const formattedGuardian = `+91 ${quickGuardianDigits.slice(
      0,
      5
    )} ${quickGuardianDigits.slice(5)}`;

    updateStudentProfile({
      name: quickName.trim(),
      mobile: formattedStudent,
      collegeOrOrg: quickCollege.trim(),
      linkedGuardianName: quickGuardianName.trim(),
      linkedGuardianMobile: formattedGuardian,
      photo: quickPhoto,
    });
    setGuardianMobile(formattedGuardian);
    setQuickError('');
  };

  const handleBookSubmit = (e) => {
    e.preventDefault();
    if (!currentUser || isIncompleteStudent) return;
    const rawDigits = guardianMobile.replace(/\D/g, '').slice(-10);
    const formattedGuardian =
      rawDigits.length === 10
        ? `+91 ${rawDigits.slice(0, 5)} ${rawDigits.slice(5)}`
        : currentUser.linkedGuardianMobile || guardianMobile.trim();

    const created = createBooking({
      pgId: pg.id,
      pgTitle: pg.title,
      pgNeighborhood: `${pg.neighborhood}, ${pg.city}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentMobile: currentUser.mobile,
      studentPhoto: currentUser.photo || '',
      studentCollege: currentUser.collegeOrOrg || '',
      guardianName: currentUser.linkedGuardianName || '',
      guardianMobile: formattedGuardian,
      sharingType: selectedSharing,
      moveInDate,
      note: note.trim(),
    });
    setSubmittedBookingId(created.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={pg.title}
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[94vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate">
              {pg.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {pg.neighborhood}, {pg.city} ({pg.district}) · {pg.nearCollege} ·{' '}
              {pg.distanceText}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close PG details"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <SafePhoto
                src={pg.photos[activePhotoIdx] || pg.photos[0]}
                alt={pg.title}
                fallbackLabel={pg.title}
              />
            </div>

            {pg.photos.length > 1 && (
              <div className="flex items-center gap-2">
                {pg.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`w-20 aspect-4/3 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activePhotoIdx === idx
                        ? 'border-teal-700'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <SafePhoto
                      src={photo}
                      alt={`${pg.title} photo ${idx + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                About this PG
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {pg.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Included Amenities
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {pg.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 text-xs text-slate-700"
                  >
                    <Check className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Weekly Meal Menu
                </h3>
                <span className="text-xs text-slate-500">
                  {pg.foodIncluded ? pg.mealType : 'Optional Tiffin'}
                </span>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <th className="py-2 px-3 font-semibold">Day</th>
                      <th className="py-2 px-3 font-semibold">Breakfast</th>
                      <th className="py-2 px-3 font-semibold">Lunch</th>
                      <th className="py-2 px-3 font-semibold">Dinner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pg.weeklyMenu.map((m) => (
                      <tr key={m.day} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">
                          {m.day}
                        </td>
                        <td className="py-2 px-3">{m.breakfast}</td>
                        <td className="py-2 px-3">{m.lunch}</td>
                        <td className="py-2 px-3">{m.dinner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {pg.rules.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  House Rules & Safety
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4">
                  {pg.rules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-20 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-5">
              <div className="pb-4 border-b border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500">Monthly Rent</span>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    ₹{selectedOption?.rent.toLocaleString('en-IN')}
                    <span className="text-xs font-sans font-normal text-slate-500">
                      /bed
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-600 tabular-nums">
                  <div className="font-semibold text-slate-900">
                    {selectedOption?.availableBeds} of{' '}
                    {selectedOption?.totalBeds} beds free
                  </div>
                  <div>{pg.gender} PG</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Choose Sharing Room
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {pg.sharingOptions.map((opt) => {
                    const active = opt.type === selectedSharing;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setSelectedSharing(opt.type)}
                        className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                          active
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-semibold">{opt.type}</div>
                        <div
                          className={`text-[11px] font-mono tabular-nums ${
                            active ? 'text-teal-300' : 'text-slate-500'
                          }`}
                        >
                          ₹{opt.rent.toLocaleString('en-IN')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-200">
                <div>
                  Owner:{' '}
                  <span className="font-semibold text-slate-900">
                    {pg.ownerName}
                  </span>
                </div>
                {isIncompleteStudent ? (
                  <div className="inline-flex items-center gap-1.5 text-amber-800 font-medium">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Contact locked until Student Profile is 100% complete
                    </span>
                  </div>
                ) : (
                  <div className="font-mono tabular-nums">
                    Contact: {pg.ownerMobile}
                  </div>
                )}
              </div>

              {isIncompleteStudent ? (
                <form
                  onSubmit={handleCompleteProfileSubmit}
                  className="p-4 rounded-xl bg-white border border-amber-200 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <StudentAvatar
                      src={quickPhoto || currentUser?.photo}
                      alt={currentUser?.name}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">
                          Complete Student Profile
                        </span>
                        <span className="font-mono tabular-nums font-bold text-amber-700">
                          {profileStatus.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-amber-600 transition-all duration-300"
                          style={{ width: `${profileStatus.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    You can browse all PG details freely. To contact{' '}
                    <span className="font-semibold">{pg.ownerName}</span> or
                    send a booking request, reach 100% completion. Missing:{' '}
                    <span className="font-medium text-amber-800">
                      {profileStatus.missingFields.join(', ')}
                    </span>
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer">
                      <Camera className="w-3.5 h-3.5" />
                      <span>
                        {quickPhoto ? 'Change Photo' : 'Upload Photo'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQuickPhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {quickPhoto && (
                      <button
                        type="button"
                        onClick={handleRemoveQuickPhoto}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Student Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Student Contact (+91, 10 digits)
                    </label>
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-teal-700">
                      <span className="px-2.5 py-2 bg-slate-100 border-r border-slate-300 text-xs font-mono font-semibold text-slate-700">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        required
                        value={quickStudentDigits}
                        onChange={(e) =>
                          setQuickStudentDigits(
                            e.target.value.replace(/\D/g, '').slice(0, 10)
                          )
                        }
                        placeholder="10-digit number"
                        className="flex-1 px-2.5 py-2 text-xs font-mono tabular-nums focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      College Name
                    </label>
                    <select
                      value={
                        localColleges.includes(quickCollege)
                          ? quickCollege
                          : '__custom__'
                      }
                      onChange={(e) => {
                        if (e.target.value !== '__custom__') {
                          setQuickCollege(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                    >
                      {localColleges.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                      {!localColleges.includes(quickCollege) && quickCollege && (
                        <option value="__custom__">{quickCollege}</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Guardian Name
                    </label>
                    <input
                      type="text"
                      required
                      value={quickGuardianName}
                      onChange={(e) => setQuickGuardianName(e.target.value)}
                      placeholder="Parent or local guardian full name"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Guardian Contact (+91, 10 digits)
                    </label>
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-teal-700">
                      <span className="px-2.5 py-2 bg-slate-100 border-r border-slate-300 text-xs font-mono font-semibold text-slate-700">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        required
                        value={quickGuardianDigits}
                        onChange={(e) =>
                          setQuickGuardianDigits(
                            e.target.value.replace(/\D/g, '').slice(0, 10)
                          )
                        }
                        placeholder="10-digit guardian number"
                        className="flex-1 px-2.5 py-2 text-xs font-mono tabular-nums focus:outline-none"
                      />
                    </div>
                  </div>

                  {quickError && (
                    <p className="text-[11px] font-medium text-red-700">
                      {quickError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Save & Unlock PG Contact + Booking
                  </button>
                </form>
              ) : submittedBookingId || existingBooking ? (
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-1.5">
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-teal-700" />
                    <span>
                      Booking Request {existingBooking?.status || 'Pending'}
                    </span>
                  </div>
                  <p>
                    Sent to {pg.ownerName} for{' '}
                    <span className="font-semibold">
                      {existingBooking?.sharingType || selectedSharing} sharing
                    </span>
                    . Track approval in your My Profile tab or test Owner
                    Console to approve it live.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookSubmit} className="space-y-3 pt-2">
                  <div>
                    <label
                      htmlFor="move-in-date"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Expected Move-In Date
                    </label>
                    <input
                      id="move-in-date"
                      type="date"
                      required
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="guardian-mobile"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Guardian Contact Number (10 digits)
                    </label>
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-teal-700">
                      <span className="px-2.5 py-2 bg-slate-100 border-r border-slate-300 text-xs font-mono font-semibold text-slate-700">
                        +91
                      </span>
                      <input
                        id="guardian-mobile"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        required
                        value={(
                          guardianMobile ||
                          currentUser?.linkedGuardianMobile ||
                          ''
                        )
                          .replace(/\D/g, '')
                          .slice(-10)}
                        onChange={(e) =>
                          setGuardianMobile(
                            e.target.value.replace(/\D/g, '').slice(0, 10)
                          )
                        }
                        placeholder="10-digit guardian number"
                        className="flex-1 px-2.5 py-2 text-xs font-mono tabular-nums focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="booking-note"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Note to Owner (Optional)
                    </label>
                    <textarea
                      id="booking-note"
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="College year, food preference, or arrival time..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={
                      !selectedOption || selectedOption.availableBeds === 0
                    }
                    className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {selectedOption?.availableBeds === 0
                      ? 'No Beds Available in This Sharing'
                      : 'Send Booking Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PGMarketplace() {
  const { pgListings, location, currentUser, updateStudentProfile } =
    useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [areaScope, setAreaScope] = useState('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [sharingFilter, setSharingFilter] = useState('All');
  const [maxBudget, setMaxBudget] = useState(12000);
  const [acOnly, setAcOnly] = useState(false);
  const [foodOnly, setFoodOnly] = useState(false);
  const [genderFilter, setGenderFilter] = useState('All');
  const [selectedPG, setSelectedPG] = useState(null);

  const isStudent = currentUser?.role === 'student';
  const studentGender = currentUser?.gender || 'Male';
  const allowedStudentGenders =
    studentGender === 'Female' ? ['Girls', 'Co-ed'] : ['Boys', 'Co-ed'];

  const activeCity = location?.city || 'Sreerampore';
  const localNeighborhoods = getTownNeighborhoods(activeCity);
  const localColleges = getTownColleges(activeCity);

  const sortedPGs = pgListings
    .filter((pg) => {
      if (isStudent && !allowedStudentGenders.includes(pg.gender)) {
        return false;
      }

      if (
        areaScope === 'local' &&
        pg.city.toLowerCase() !== activeCity.toLowerCase()
      ) {
        return false;
      }

      if (
        selectedNeighborhood !== 'All' &&
        pg.neighborhood.toLowerCase() !== selectedNeighborhood.toLowerCase()
      ) {
        return false;
      }

      if (
        selectedCollege !== 'All' &&
        !pg.nearCollege.toLowerCase().includes(selectedCollege.toLowerCase()) &&
        !selectedCollege.toLowerCase().includes(pg.nearCollege.toLowerCase())
      ) {
        return false;
      }

      if (genderFilter !== 'All' && pg.gender !== genderFilter) {
        return false;
      }

      if (acOnly && !pg.acAvailable) return false;
      if (foodOnly && !pg.foodIncluded) return false;

      const matchingSharing = pg.sharingOptions.filter((opt) => {
        if (sharingFilter !== 'All' && opt.type !== sharingFilter) return false;
        return opt.rent <= maxBudget;
      });
      if (matchingSharing.length === 0) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${pg.title} ${pg.city} ${pg.neighborhood} ${pg.nearCollege} ${pg.district}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const aLocal = a.city.toLowerCase() === activeCity.toLowerCase() ? 0 : 1;
      const bLocal = b.city.toLowerCase() === activeCity.toLowerCase() ? 0 : 1;
      return aLocal - bLocal;
    });

  const clearFilters = () => {
    setSearchQuery('');
    setAreaScope('all');
    setSelectedNeighborhood('All');
    setSelectedCollege('All');
    setSharingFilter('All');
    setMaxBudget(12000);
    setAcOnly(false);
    setFoodOnly(false);
    setGenderFilter('All');
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-teal-700 mb-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>
                Showing stays prioritized near {activeCity} ·{' '}
                {location?.neighborhood || 'College Gate'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
              Verified Student PGs & Hostels
            </h1>
            <p className="text-sm text-slate-600 mt-1.5">
              Compare room photos, bed availability, weekly meal menus, and send
              direct booking requests without brokerage.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto self-start lg:self-auto">
            {isStudent && (
              <div
                className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
                role="group"
                aria-label="Your gender preference"
              >
                {['Male', 'Female'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      updateStudentProfile({ gender: g });
                      setGenderFilter('All');
                    }}
                    className={`flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      studentGender === g
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setAreaScope('local');
                  setSelectedNeighborhood('All');
                }}
                className={`flex-1 sm:flex-initial px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  areaScope === 'local'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Only {activeCity}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAreaScope('all');
                  setSelectedNeighborhood('All');
                }}
                className={`flex-1 sm:flex-initial px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  areaScope === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {activeCity} & Nearby Towns
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          <div className="sm:col-span-2 lg:col-span-3 relative min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Prothom Alo, para..."
              className="w-full h-11 pl-10 pr-3.5 text-sm leading-normal bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div className="lg:col-span-3 min-w-0">
            <select
              aria-label="Filter by college"
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full h-11 px-3.5 text-sm leading-normal bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
            >
              <option value="All">All Colleges in {activeCity}</option>
              {localColleges.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2 min-w-0">
            <select
              aria-label="Filter by neighborhood"
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="w-full h-11 px-3.5 text-sm leading-normal bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
            >
              <option value="All">All Paras</option>
              {localNeighborhoods.map((nb) => (
                <option key={nb} value={nb}>
                  {nb}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2 min-w-0">
            <select
              aria-label="Filter by sharing type"
              value={sharingFilter}
              onChange={(e) => setSharingFilter(e.target.value)}
              className="w-full h-11 px-3.5 text-sm leading-normal bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
            >
              <option value="All">Any Sharing</option>
              <option value="Single">Single Room</option>
              <option value="Double">Double Sharing</option>
              <option value="Triple">Triple Sharing</option>
            </select>
          </div>

          <div className="lg:col-span-2 min-w-0">
            <select
              aria-label="Filter by gender"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full h-11 px-3.5 text-sm leading-normal bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
            >
              {isStudent ? (
                <>
                  <option value="All">
                    {studentGender === 'Female'
                      ? 'Girls & Co-ed PGs'
                      : 'Boys & Co-ed PGs'}
                  </option>
                  <option value={studentGender === 'Female' ? 'Girls' : 'Boys'}>
                    {studentGender === 'Female' ? 'Only Girls PG' : 'Only Boys PG'}
                  </option>
                  <option value="Co-ed">Only Co-ed PG</option>
                </>
              ) : (
                <>
                  <option value="All">All Genders</option>
                  <option value="Boys">Boys PG</option>
                  <option value="Girls">Girls PG</option>
                  <option value="Co-ed">Co-ed PG</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium whitespace-nowrap">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Max Budget:</span>
              </span>
              <input
                type="range"
                min={3500}
                max={12000}
                step={500}
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="flex-1 sm:w-32 min-w-[100px] accent-teal-700 cursor-pointer"
              />
              <span className="font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                ₹{maxBudget.toLocaleString('en-IN')}/mo
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAcOnly((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                  acOnly
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Snowflake className="w-3.5 h-3.5" />
                <span>AC Available</span>
              </button>

              <button
                type="button"
                onClick={() => setFoodOnly((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                  foodOnly
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Food Included</span>
              </button>
            </div>
          </div>

          <div className="text-slate-500 tabular-nums">
            {sortedPGs.length} {sortedPGs.length === 1 ? 'listing' : 'listings'}{' '}
            found
          </div>
        </div>
      </div>

      {sortedPGs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <BedDouble className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            No PGs match your current filters
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Try expanding to nearby towns in Hooghly or increasing your monthly
            budget slider.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPGs.map((pg) => {
            const minRent = Math.min(...pg.sharingOptions.map((o) => o.rent));
            const totalFreeBeds = pg.sharingOptions.reduce(
              (acc, o) => acc + o.availableBeds,
              0
            );
            const sharingSummary = pg.sharingOptions
              .map((o) => o.type)
              .join(' / ');

            return (
              <article
                key={pg.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="aspect-4/3 bg-slate-100 overflow-hidden">
                  <SafePhoto
                    src={pg.photos[0]}
                    alt={pg.title}
                    fallbackLabel={pg.title}
                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                      <span className="font-medium text-teal-700">
                        {pg.city}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{pg.neighborhood}</span>
                      <span aria-hidden="true">·</span>
                      <span>{pg.gender}</span>
                    </div>

                    <h2 className="mt-1.5 text-base font-semibold text-slate-900 line-clamp-1">
                      {pg.title}
                    </h2>

                    <p className="text-xs text-slate-500 mt-1 truncate">
                      Near {pg.nearCollege} ({pg.distanceText})
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                      <div>Sharing: {sharingSummary}</div>
                      <div>
                        {pg.foodIncluded
                          ? `Meals: ${pg.mealType}`
                          : 'Meals: Optional Tiffin'}{' '}
                        · {pg.acAvailable ? 'AC & Non-AC' : 'Non-AC'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                        ₹{minRent.toLocaleString('en-IN')}
                        <span className="text-[11px] font-sans font-normal text-slate-500">
                          /mo onwards
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-teal-700 tabular-nums">
                        {totalFreeBeds} beds available
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedPG(pg)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>View & Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedPG && (
        <PGDetailModal pg={selectedPG} onClose={() => setSelectedPG(null)} />
      )}
    </section>
  );
}
