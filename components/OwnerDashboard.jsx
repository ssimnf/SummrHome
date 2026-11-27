'use client';

import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Check,
  X,
  Send,
  Utensils,
  BedDouble,
  Upload,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { DEFAULT_WEEKLY_MENU } from '@/data/mockData';
import { getTownNeighborhoods, LOCAL_TOWNS } from '@/data/locations';
import SafePhoto from '@/components/SafePhoto';
import StudentAvatar from '@/components/StudentAvatar';

const PG_PHOTO_PRESETS = [
  { label: 'Single AC Room', src: '/images/pg-single-ac.jpg' },
  { label: 'Double Sharing', src: '/images/pg-double-sharing.jpg' },
  { label: 'Triple Budget', src: '/images/pg-triple-budget.jpg' },
];

export default function OwnerDashboard() {
  const {
    currentUser,
    location,
    pgListings,
    bookings,
    chatMessages,
    addPGListing,
    updateBedCount,
    updateWeeklyMenu,
    updateBookingStatus,
    sendChatMessage,
  } = useAppState();

  const [showNewPGForm, setShowNewPGForm] = useState(false);
  const [editingMenuPgId, setEditingMenuPgId] = useState(null);
  const [menuDraft, setMenuDraft] = useState([]);
  const [replyText, setReplyText] = useState('');

  const [title, setTitle] = useState('');
  const [city, setCity] = useState(location?.city || 'Sreerampore');
  const [neighborhood, setNeighborhood] = useState(
    location?.neighborhood || 'Serampore College Gate'
  );
  const [nearCollege, setNearCollege] = useState('Serampore College');
  const [gender, setGender] = useState('Boys');
  const [acAvailable, setAcAvailable] = useState(true);
  const [foodIncluded, setFoodIncluded] = useState(true);
  const [doubleRent, setDoubleRent] = useState('5200');
  const [doubleBeds, setDoubleBeds] = useState('4');
  const [singleRent, setSingleRent] = useState('7400');
  const [singleBeds, setSingleBeds] = useState('2');
  const [description, setDescription] = useState('');
  const [photoSrc, setPhotoSrc] = useState(PG_PHOTO_PRESETS[0].src);

  const ownerPGs = pgListings;
  const totalFreeBeds = ownerPGs.reduce(
    (sum, pg) =>
      sum + pg.sharingOptions.reduce((s, o) => s + o.availableBeds, 0),
    0
  );
  const pendingBookings = bookings.filter((b) => b.status === 'Pending');

  const guardianThreadId = 'guardian-owner-pg-sreerampore-1';
  const guardianMessages = chatMessages.filter(
    (m) => m.threadId === guardianThreadId
  );

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setPhotoSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePG = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const townCfg = LOCAL_TOWNS.find((t) => t.city === city);
    addPGListing({
      title: title.trim(),
      city,
      district: townCfg?.district || city,
      neighborhood,
      nearCollege: nearCollege.trim() || `${city} College`,
      distanceText: '400 m walk',
      gender,
      sharingOptions: [
        {
          type: 'Single',
          rent: Number(singleRent) || 7000,
          availableBeds: Number(singleBeds) || 2,
          totalBeds: Number(singleBeds) || 2,
        },
        {
          type: 'Double',
          rent: Number(doubleRent) || 5200,
          availableBeds: Number(doubleBeds) || 4,
          totalBeds: Number(doubleBeds) || 4,
        },
      ],
      acAvailable,
      foodIncluded,
      mealType: foodIncluded ? 'Veg & Non-Veg' : 'Optional',
      weeklyMenu: DEFAULT_WEEKLY_MENU,
      amenities: [
        'Fiber Wi-Fi',
        foodIncluded ? '3 Home Meals' : 'Kitchen Access',
        'CCTV Security',
        'RO Drinking Water',
      ],
      photos: [photoSrc],
      rules: ['Gate closes 10:30 PM; guardian approval for night-out.'],
      description:
        description.trim() ||
        `Student-friendly PG in ${neighborhood}, ${city} near ${nearCollege}.`,
    });
    setTitle('');
    setDescription('');
    setShowNewPGForm(false);
  };

  const startEditMenu = (pgId, currentMenu) => {
    setEditingMenuPgId(pgId);
    setMenuDraft(currentMenu.map((d) => ({ ...d })));
  };

  const saveMenu = (pgId) => {
    updateWeeklyMenu(pgId, menuDraft);
    setEditingMenuPgId(null);
  };

  const handleReplyGuardian = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendChatMessage(guardianThreadId, replyText);
    setReplyText('');
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-teal-700">
            PG Owner & Warden Console · {currentUser?.name}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Property, Bed & Booking Operations
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowNewPGForm((v) => !v)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showNewPGForm ? 'Close New PG Form' : 'List New PG'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Active PG Properties</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {ownerPGs.length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Total Vacant Beds</div>
          <div className="text-2xl font-bold text-teal-700 font-mono tabular-nums mt-1">
            {totalFreeBeds}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Pending Booking Requests</div>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1">
            {pendingBookings.length}
          </div>
        </div>
      </div>

      {showNewPGForm && (
        <form
          onSubmit={handleCreatePG}
          className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-base font-bold text-slate-900">
            Publish a New PG Listing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                PG / Hostel Name
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Carew Road Scholars PG"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Gender Policy
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              >
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Co-ed">Co-ed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Town / City
              </label>
              <select
                value={city}
                onChange={(e) => {
                  const next = e.target.value;
                  setCity(next);
                  setNeighborhood(getTownNeighborhoods(next)[0]);
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              >
                {LOCAL_TOWNS.map((t) => (
                  <option key={t.city} value={t.city}>
                    {t.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Neighborhood / Para
              </label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              >
                {getTownNeighborhoods(city).map((nb) => (
                  <option key={nb} value={nb}>
                    {nb}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nearest College
              </label>
              <input
                type="text"
                value={nearCollege}
                onChange={(e) => setNearCollege(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Single Rent (₹)
              </label>
              <input
                type="number"
                value={singleRent}
                onChange={(e) => setSingleRent(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Single Beds
              </label>
              <input
                type="number"
                value={singleBeds}
                onChange={(e) => setSingleBeds(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Double Rent (₹)
              </label>
              <input
                type="number"
                value={doubleRent}
                onChange={(e) => setDoubleRent(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Double Beds
              </label>
              <input
                type="number"
                value={doubleBeds}
                onChange={(e) => setDoubleBeds(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-700">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={acAvailable}
                onChange={(e) => setAcAvailable(e.target.checked)}
                className="accent-teal-700"
              />
              <span>AC Rooms Available</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={foodIncluded}
                onChange={(e) => setFoodIncluded(e.target.checked)}
                className="accent-teal-700"
              />
              <span>3 Daily Meals Included</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Highlight walking distance to station/college, meals, security..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                <Upload className="w-4 h-4 text-teal-700" />
                <span>Upload Room Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PG_PHOTO_PRESETS.map((p) => (
                  <button
                    key={p.src}
                    type="button"
                    onClick={() => setPhotoSrc(p.src)}
                    className={`px-2.5 py-1 text-[11px] rounded border cursor-pointer ${
                      photoSrc === p.src
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowNewPGForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Publish PG Listing
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Student Booking Requests
          </h2>
          <span className="text-xs text-slate-500 tabular-nums">
            {bookings.length} total requests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-3 px-4 font-semibold">Student</th>
                <th className="py-3 px-4 font-semibold">PG & Sharing</th>
                <th className="py-3 px-4 font-semibold">Move-In</th>
                <th className="py-3 px-4 font-semibold">Guardian Mobile</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((bk) => (
                <tr key={bk.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <StudentAvatar
                        src={bk.studentPhoto}
                        alt={bk.studentName}
                        size="sm"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">
                          {bk.studentName}
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-slate-500">
                          {bk.studentMobile}
                        </div>
                        {bk.studentCollege && (
                          <div className="text-[11px] text-slate-500">
                            {bk.studentCollege}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">
                      {bk.pgTitle}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {bk.sharingType} Sharing · {bk.pgNeighborhood}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                    {bk.moveInDate}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {bk.guardianName && (
                      <div className="text-[11px] font-medium text-slate-900">
                        {bk.guardianName}
                      </div>
                    )}
                    <div className="font-mono tabular-nums text-slate-600">
                      {bk.guardianMobile || 'Not provided'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        bk.status === 'Approved'
                          ? 'text-teal-700'
                          : bk.status === 'Declined'
                          ? 'text-red-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {bk.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {bk.status === 'Pending' ? (
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(bk.id, 'Approved')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-md cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(bk.id, 'Declined')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-md cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Manage Bed Availability & Meal Menus
          </h2>

          {ownerPGs.slice(0, 4).map((pg) => (
            <div
              key={pg.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <SafePhoto src={pg.photos[0]} alt={pg.title} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {pg.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {pg.neighborhood}, {pg.city} · {pg.gender}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    editingMenuPgId === pg.id
                      ? setEditingMenuPgId(null)
                      : startEditMenu(pg.id, pg.weeklyMenu)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-800 whitespace-nowrap cursor-pointer"
                >
                  <Utensils className="w-3.5 h-3.5 text-teal-700" />
                  <span>
                    {editingMenuPgId === pg.id ? 'Close Menu' : 'Edit Meal Menu'}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                {pg.sharingOptions.map((opt) => (
                  <div
                    key={opt.type}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-slate-500" />
                        <span>{opt.type}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {opt.availableBeds}/{opt.totalBeds} free
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Decrease ${opt.type} beds`}
                        onClick={() => updateBedCount(pg.id, opt.type, -1)}
                        className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Increase ${opt.type} beds`}
                        onClick={() => updateBedCount(pg.id, opt.type, 1)}
                        className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {editingMenuPgId === pg.id && (
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="text-xs font-semibold text-slate-900">
                    Update Weekly Meal Menu (Changes appear live for students)
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {menuDraft.map((row, idx) => (
                      <div
                        key={row.day}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center text-xs p-2.5 sm:p-0 rounded-lg bg-slate-50 sm:bg-transparent"
                      >
                        <span className="sm:col-span-2 font-semibold text-slate-900">
                          {row.day}
                        </span>
                        <input
                          type="text"
                          value={row.breakfast}
                          onChange={(e) => {
                            const next = [...menuDraft];
                            next[idx] = { ...row, breakfast: e.target.value };
                            setMenuDraft(next);
                          }}
                          className="sm:col-span-3 px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                          placeholder="Breakfast"
                          aria-label={`${row.day} breakfast`}
                        />
                        <input
                          type="text"
                          value={row.lunch}
                          onChange={(e) => {
                            const next = [...menuDraft];
                            next[idx] = { ...row, lunch: e.target.value };
                            setMenuDraft(next);
                          }}
                          className="sm:col-span-4 px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                          placeholder="Lunch"
                          aria-label={`${row.day} lunch`}
                        />
                        <input
                          type="text"
                          value={row.dinner}
                          onChange={(e) => {
                            const next = [...menuDraft];
                            next[idx] = { ...row, dinner: e.target.value };
                            setMenuDraft(next);
                          }}
                          className="sm:col-span-3 px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                          placeholder="Dinner"
                          aria-label={`${row.day} dinner`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => saveMenu(pg.id)}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Save Weekly Menu
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col h-full min-h-[420px]">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Guardian Messages
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct channel with Registered Guardian
              </p>
            </div>

            <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[340px]">
              {guardianMessages.map((msg) => {
                const isOwner = msg.senderRole === 'owner';
                return (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl text-xs ${
                      isOwner
                        ? 'bg-slate-900 text-white ml-8'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] opacity-75 mb-1">
                      <span className="font-semibold">{msg.senderName}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={handleReplyGuardian}
              className="pt-3 border-t border-slate-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Reply to guardian..."
                className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              <button
                type="submit"
                aria-label="Send reply to guardian"
                className="p-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
