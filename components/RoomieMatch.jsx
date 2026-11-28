'use client';

import React, { useState } from 'react';
import {
  Users,
  Moon,
  Sun,
  Utensils,
  BookOpen,
  MapPin,
  Phone,
  Send,
  Plus,
  X,
  Check,
  Calculator,
  Lock,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { getTownColleges, getTownNeighborhoods } from '@/data/locations';

function computeMatchScore(profile, prefs, activeCity) {
  let score = 40;
  if (profile.sleepSchedule === prefs.sleepSchedule) score += 22;
  if (profile.foodHabit === prefs.foodHabit) score += 14;
  if (profile.studyStyle === prefs.studyStyle) score += 12;
  if (profile.budget <= prefs.maxBudget) score += 7;
  if (profile.city.toLowerCase() === activeCity.toLowerCase()) score += 5;
  return Math.min(99, score);
}

function PostRoomieModal({ onClose }) {
  const { currentUser, location, pgListings, addRoommateProfile } =
    useAppState();
  const activeCity = location?.city || 'Sreerampore';
  const studentGender = currentUser?.gender || 'Male';
  const allowedPGs = pgListings.filter((p) =>
    studentGender === 'Female'
      ? p.gender === 'Girls' || p.gender === 'Co-ed'
      : p.gender === 'Boys' || p.gender === 'Co-ed'
  );
  const colleges = getTownColleges(activeCity);
  const neighborhoods = getTownNeighborhoods(activeCity);
  const localPGs = allowedPGs.filter(
    (p) => p.city.toLowerCase() === activeCity.toLowerCase()
  );

  const [college, setCollege] = useState(
    currentUser?.collegeOrOrg || colleges[0]
  );
  const [year, setYear] = useState('1st Year B.Tech / B.Sc');
  const [neighborhood, setNeighborhood] = useState(
    location?.neighborhood || neighborhoods[0]
  );
  const [targetPG, setTargetPG] = useState(
    localPGs[0]?.title || pgListings[0]?.title || 'Prothom Alo'
  );
  const [sharingPreference, setSharingPreference] = useState('Double');
  const [budget, setBudget] = useState('5200');
  const [sleepSchedule, setSleepSchedule] = useState('Night Owl');
  const [foodHabit, setFoodHabit] = useState('Non-Veg');
  const [studyStyle, setStudyStyle] = useState('Quiet Focus');
  const [commute, setCommute] = useState('Walking / Local Train');
  const [bio, setBio] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bio.trim()) return;
    addRoommateProfile({
      college,
      year: year.trim(),
      city: activeCity,
      neighborhood,
      targetPG,
      sharingPreference,
      budget: Math.max(2500, Number(budget) || 5000),
      sleepSchedule,
      foodHabit,
      studyStyle,
      commute: commute.trim() || 'Local Commute',
      bio: bio.trim(),
      lookingFor: '1 Roommate',
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Post Roommate Profile"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[94vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Post Your Roommate Card
            </h2>
            <p className="text-xs text-slate-500">
              Match with compatible students in {activeCity}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                College ({activeCity})
              </label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg"
              >
                {colleges.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Course & Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full h-11 px-3 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Preferred Para
              </label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg"
              >
                {neighborhoods.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target PG
              </label>
              <select
                value={targetPG}
                onChange={(e) => setTargetPG(e.target.value)}
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg"
              >
                {allowedPGs.map((p) => (
                  <option key={p.id} value={p.title}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Budget Share (₹/mo)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full h-11 px-3 text-sm font-mono tabular-nums border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Sharing
              </label>
              <select
                value={sharingPreference}
                onChange={(e) => setSharingPreference(e.target.value)}
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg"
              >
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Sleep Vibe
              </label>
              <select
                value={sleepSchedule}
                onChange={(e) => setSleepSchedule(e.target.value)}
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg"
              >
                <option value="Night Owl">Night Owl</option>
                <option value="Early Riser">Early Riser</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Food Habit
              </label>
              <select
                value={foodHabit}
                onChange={(e) => setFoodHabit(e.target.value)}
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg"
              >
                <option value="Non-Veg">Non-Veg</option>
                <option value="Veg">Veg</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Study Style
              </label>
              <select
                value={studyStyle}
                onChange={(e) => setStudyStyle(e.target.value)}
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg"
              >
                <option value="Quiet Focus">Quiet Focus</option>
                <option value="Group Prep">Group Prep</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Daily Commute Route
            </label>
            <input
              type="text"
              value={commute}
              onChange={(e) => setCommute(e.target.value)}
              placeholder="e.g., Walking to College Gate or Bandel Local"
              className="w-full h-11 px-3 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              About You & Shared Items Note
            </label>
            <textarea
              rows={3}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Mention study hours, cleanliness habits, or Bazaar items you already own to share (kettle, router)..."
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Publish Roomie Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RoomieChatModal({ profile, score, onClose }) {
  const { currentUser, chatMessages, sendChatMessage } = useAppState();
  const [text, setText] = useState('');
  const threadId = `roomie-${profile.id}`;
  const messages = chatMessages.filter((m) => m.threadId === threadId);

  const sharedKitEstimate = profile.sharingPreference === 'Triple' ? 560 : 850;

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendChatMessage(threadId, text);
    setText('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Connect with ${profile.name}`}
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[94vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-teal-700 tabular-nums">
              {score}% Study & Lifestyle Match · {profile.city}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {profile.name} — {profile.year}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
            <div>
              <div className="text-slate-500">Target PG & Sharing</div>
              <div className="font-semibold text-slate-900 mt-0.5">
                {profile.targetPG} ({profile.sharingPreference})
              </div>
            </div>
            <div>
              <div className="text-slate-500">Direct Mobile</div>
              <div className="font-mono tabular-nums font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-700" />
                <span>{profile.mobile}</span>
              </div>
            </div>
            <div>
              <div className="text-slate-500">Monthly Room Share</div>
              <div className="font-mono tabular-nums font-semibold text-slate-900 mt-0.5">
                ₹{profile.budget.toLocaleString('en-IN')}/mo
              </div>
            </div>
            <div>
              <div className="text-slate-500">Split Bazaar Starter Kit</div>
              <div className="font-mono tabular-nums font-semibold text-teal-700 mt-0.5">
                ~₹{sharedKitEstimate} per student (Kettle + Router + Extension)
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
            <div className="text-xs font-semibold text-slate-700">
              Coordinate PG Visit & Room Split
            </div>
            <div className="max-h-56 overflow-y-auto space-y-2">
              {messages.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  Say hi to {profile.name} to visit {profile.targetPG} together
                  or split room essentials.
                </p>
              ) : (
                messages.map((m) => {
                  const isSelf = m.senderId === currentUser?.id;
                  return (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-lg text-xs ${
                        isSelf
                          ? 'bg-teal-700 text-white ml-8'
                          : 'bg-white border border-slate-200 text-slate-800 mr-8'
                      }`}
                    >
                      <div className="flex justify-between text-[10px] opacity-80 mb-0.5">
                        <span className="font-semibold">{m.senderName}</span>
                        <span>{m.timestamp}</span>
                      </div>
                      <p>{m.text}</p>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Message ${profile.name}...`}
                className="flex-1 h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoomieMatch() {
  const {
    location,
    currentUser,
    roommates,
    roommateRequests,
    toggleRoommateRequest,
  } = useAppState();

  const activeCity = location?.city || 'Sreerampore';
  const isStudent = currentUser?.role === 'student';
  const [guestGender, setGuestGender] = useState('Male');
  const activeGender = isStudent ? currentUser?.gender || 'Male' : guestGender;

  const [sleepSchedule, setSleepSchedule] = useState('Night Owl');
  const [foodHabit, setFoodHabit] = useState('Non-Veg');
  const [studyStyle, setStudyStyle] = useState('Quiet Focus');
  const [maxBudget, setMaxBudget] = useState(7500);
  const [onlyLocalCity, setOnlyLocalCity] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeProfile, setActiveProfile] = useState(null);

  const prefs = { sleepSchedule, foodHabit, studyStyle, maxBudget };

  const rankedRoommates = roommates
    .filter((rm) => {
      if ((rm.gender || 'Male') !== activeGender) {
        return false;
      }
      if (onlyLocalCity && rm.city.toLowerCase() !== activeCity.toLowerCase()) {
        return false;
      }
      return rm.budget <= maxBudget;
    })
    .map((rm) => ({
      ...rm,
      matchScore: computeMatchScore(rm, prefs, activeCity),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  const sharedKitSavedPerPerson = 850;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-teal-700 mb-2">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>
                Showing {activeGender} Roommates Only · {activeCity}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
              Find a Compatible PG Roommate & Split Costs
            </h1>
            <p className="text-sm text-slate-600 mt-1.5">
              Match by sleep rhythm, study style, food habit, and college commute
              in {activeCity}—then team up to split a Double/Triple PG room and
              Bazaar essentials.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {isStudent ? (
              <div
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 whitespace-nowrap"
                title="Gender is locked from login"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{activeGender} Only</span>
              </div>
            ) : (
              <div
                className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
                role="group"
                aria-label="Roommate gender filter"
              >
                {['Male', 'Female'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGuestGender(g)}
                    className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      activeGender === g
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowPostModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post My Roomie Card</span>
            </button>
          </div>
        </div>

        <div className="pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <span className="block text-[11px] font-medium text-slate-500 mb-1.5">
              Your Sleep Rhythm
            </span>
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg h-11">
              {['Night Owl', 'Early Riser'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSleepSchedule(opt)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-md cursor-pointer ${
                    sleepSchedule === opt
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  {opt === 'Night Owl' ? (
                    <Moon className="w-3.5 h-3.5" />
                  ) : (
                    <Sun className="w-3.5 h-3.5" />
                  )}
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-medium text-slate-500 mb-1.5">
              Food Preference
            </span>
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg h-11">
              {['Non-Veg', 'Veg'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFoodHabit(opt)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-md cursor-pointer ${
                    foodHabit === opt
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-medium text-slate-500 mb-1.5">
              Study Style
            </span>
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg h-11">
              {['Quiet Focus', 'Group Prep'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStudyStyle(opt)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-md cursor-pointer ${
                    studyStyle === opt
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1.5">
              <span>Max Rent Share</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                ₹{maxBudget.toLocaleString('en-IN')}/mo
              </span>
            </div>
            <div className="flex items-center gap-2 h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg">
              <input
                type="range"
                min={3500}
                max={9000}
                step={500}
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-teal-700 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
          <div className="inline-flex items-center gap-2 text-slate-600">
            <Calculator className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              Teaming up on a Double PG + splitting a Kettle, Router & Spike
              Guard from Student Bazaar saves ~
              <strong className="font-mono tabular-nums text-slate-900">
                ₹{sharedKitSavedPerPerson}
              </strong>{' '}
              per student on Day 1.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setOnlyLocalCity((v) => !v)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap self-start sm:self-auto cursor-pointer ${
              onlyLocalCity
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {onlyLocalCity ? `Only ${activeCity}` : `Show All Nearby Towns`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rankedRoommates.map((rm) => {
          const requested = roommateRequests.includes(rm.id);
          return (
            <article
              key={rm.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span className="font-medium text-teal-700">
                        {rm.city}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{rm.neighborhood}</span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-1 truncate">
                      {rm.name}
                    </h2>
                    <p className="text-xs text-slate-500 truncate">
                      {rm.year} · {rm.college}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-teal-700 font-mono tabular-nums">
                      {rm.matchScore}%
                    </div>
                    <div className="text-[11px] text-slate-500">Match</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {rm.bio}
                </p>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div>
                    Target PG:{' '}
                    <span className="font-semibold text-slate-900">
                      {rm.targetPG}
                    </span>{' '}
                    ({rm.sharingPreference})
                  </div>
                  <div>
                    Vibe: {rm.sleepSchedule} · {rm.foodHabit} · {rm.studyStyle}
                  </div>
                  <div className="truncate">Commute: {rm.commute}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                    ₹{rm.budget.toLocaleString('en-IN')}
                    <span className="text-[11px] font-sans font-normal text-slate-500">
                      /mo share
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {rm.lookingFor}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleRoommateRequest(rm.id)}
                    className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                      requested
                        ? 'bg-teal-50 border-teal-700 text-teal-800'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {requested && <Check className="w-3.5 h-3.5" />}
                    <span>{requested ? 'Teamed Up' : 'Team Up'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveProfile(rm)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {showPostModal && (
        <PostRoomieModal onClose={() => setShowPostModal(false)} />
      )}

      {activeProfile && (
        <RoomieChatModal
          profile={activeProfile}
          score={activeProfile.matchScore}
          onClose={() => setActiveProfile(null)}
        />
      )}
    </section>
  );
}
