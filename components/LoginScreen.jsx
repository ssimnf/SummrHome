'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  GraduationCap,
  Building2,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  KeyRound,
  Sun,
  LogIn,
} from 'lucide-react';
import { getTownColleges } from '@/data/locations';

const ROLE_OPTIONS = [
  {
    id: 'student',
    label: 'Student',
    subtitle: 'Find PGs & trade campus items',
    icon: GraduationCap,
  },
  {
    id: 'owner',
    label: 'PG Owner / Admin',
    subtitle: 'Manage beds, meals & bookings',
    icon: Building2,
  },
  {
    id: 'guardian',
    label: 'Guardian',
    subtitle: 'Track check-ins & message owner',
    icon: ShieldCheck,
  },
];

const DEFAULT_OTP = '363636';

export default function LoginScreen({
  location,
  firebaseUser,
  authLoading,
  onBackToGPS,
  onGoogleSignIn,
  onLogin,
}) {
  const localColleges = getTownColleges(location.city);

  const [role, setRole] = useState('student');
  const [gender, setGender] = useState('Male');
  const [name, setName] = useState(firebaseUser?.displayName || '');
  const [email, setEmail] = useState(firebaseUser?.email || '');
  const [mobile, setMobile] = useState('');
  const [collegeOrOrg, setCollegeOrOrg] = useState(localColleges[0] || '');
  const [customCollege, setCustomCollege] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [formError, setFormError] = useState(null);

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    setFormError(null);
    if (nextRole === 'student') {
      setCollegeOrOrg(localColleges[0] || '');
    } else {
      setCollegeOrOrg('');
    }
  };

  const handleGoogleButton = async () => {
    setFormError(null);
    try {
      const fbUser = await onGoogleSignIn();
      if (fbUser?.email && !email) setEmail(fbUser.email);
      if (fbUser?.displayName && !name) setName(fbUser.displayName);
    } catch (err) {
      setFormError(
        err?.code === 'auth/popup-closed-by-user'
          ? 'Google sign-in popup was closed. Please try again.'
          : err?.message || 'Google sign-in failed. Please try again.'
      );
    }
  };

  const handleSendOtp = () => {
    if (mobile.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number after +91.');
      return;
    }
    setFormError(null);
    setOtpSent(true);
    setOtpInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || mobile.length !== 10) {
      setFormError('Please fill Full Name and a 10-digit Mobile Number.');
      return;
    }

    if (!otpSent) {
      setFormError('Please click "Send OTP" to verify your mobile number.');
      return;
    }

    if (otpInput.trim() !== DEFAULT_OTP) {
      setFormError('Invalid OTP. Please check the 6-digit code and try again.');
      return;
    }

    setFormError(null);
    const finalOrg =
      role === 'student' && collegeOrOrg === '__other__'
        ? customCollege.trim() || `${location.city} College`
        : collegeOrOrg;

    const formattedMobile = `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;

    try {
      await onLogin({
        role,
        gender: role === 'student' ? gender : undefined,
        email: firebaseUser?.email || email || 'google-user@summrhome.in',
        name,
        mobile: formattedMobile,
        location,
        collegeOrOrg: finalOrg,
      });
    } catch (err) {
      setFormError(
        err?.code === 'auth/popup-closed-by-user'
          ? 'Google sign-in popup was closed before completing setup.'
          : err?.message || 'Unable to sign in right now. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between px-4 py-8 sm:px-8">
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between gap-4">
        <span className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 font-display whitespace-nowrap">
          <Sun
            className="w-5 h-5 text-slate-950 fill-slate-950 shrink-0"
            strokeWidth={2.2}
            aria-hidden="true"
          />
          <span>SummrHome</span>
        </span>
        <button
          type="button"
          onClick={onBackToGPS}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Change GPS Location</span>
        </button>
      </header>

      <main className="max-w-5xl w-full mx-auto my-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-teal-700 mb-3">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>
                  {location.city} · {location.neighborhood}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
                Sign in to explore {location.city}
              </h1>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Sign in with Google to save your profile, PG bookings, Bazaar
                ads, and real-time notifications in the cloud.
              </p>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <p className="text-xs font-medium text-slate-500">
                  Select Your Account Role
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {ROLE_OPTIONS.map((item) => {
                    const Icon = item.icon;
                    const active = role === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleRoleChange(item.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                          active
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            active ? 'text-teal-300' : 'text-teal-700'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold">
                            {item.label}
                          </div>
                          <div
                            className={`text-[11px] truncate ${
                              active ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            {item.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
              Location locked: {location.city}, {location.district} (
              {location.detectionMethod === 'gps' ? 'GPS Verified' : 'Manual Area'}
              )
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-center">
            <h2 className="text-xl font-semibold text-slate-900">
              Account Sign In & Mobile OTP
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Returning users can sign straight in with Google to restore stored
              data. New users complete quick onboarding below.
            </p>

            <div className="mt-4">
              {firebaseUser ? (
                <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-teal-900 font-medium min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                    <span className="truncate">
                      Google Verified: {firebaseUser.email}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-teal-700 whitespace-nowrap">
                    Complete setup below
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={handleGoogleButton}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>
                    {authLoading
                      ? 'Connecting with Google...'
                      : 'Sign in with Google (Restore or Register)'}
                  </span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="login-name"
                    className="block text-xs font-medium text-slate-700 mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="login-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-medium text-slate-700 mb-1.5"
                  >
                    Google Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={firebaseUser?.email || email}
                    readOnly={Boolean(firebaseUser?.email)}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Filled automatically via Google Sign-In"
                    className={`w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700 ${
                      firebaseUser?.email ? 'bg-slate-50 text-slate-600' : ''
                    }`}
                  />
                </div>
              </div>

              {role === 'student' && (
                <div>
                  <span className="block text-xs font-medium text-slate-700 mb-1.5">
                    Gender (Locked After Login · Filters Matching PGs & Roomies)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {['Male', 'Female'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2.5 px-4 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                          gender === g
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="login-mobile"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Mobile Number (10 digits) & OTP Verification
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex flex-1 items-center border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-teal-700">
                    <span className="px-3 py-2.5 bg-slate-100 border-r border-slate-300 text-sm font-mono font-semibold text-slate-700 select-none">
                      +91
                    </span>
                    <input
                      id="login-mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      required
                      value={mobile}
                      onChange={(e) => {
                        const digits = e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 10);
                        setMobile(digits);
                        if (otpSent) {
                          setOtpSent(false);
                          setOtpInput('');
                        }
                      }}
                      placeholder="10-digit mobile number"
                      className="flex-1 px-3 py-2.5 text-sm font-mono tabular-nums focus:outline-none bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-teal-900">
                    <span className="font-semibold inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-700" />
                      <span>OTP sent to +91 {mobile}</span>
                    </span>
                    <span className="text-teal-800 font-mono font-bold">
                      Demo OTP: 363636
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={otpInput}
                      onChange={(e) =>
                        setOtpInput(
                          e.target.value.replace(/\D/g, '').slice(0, 6)
                        )
                      }
                      placeholder="Enter 363636"
                      className="w-full pl-10 pr-3.5 py-2 text-sm font-mono tracking-widest tabular-nums bg-white border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="login-org"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  {role === 'student'
                    ? `College in ${location.city}`
                    : role === 'owner'
                    ? 'PG Property Name'
                    : 'Linked Student Name'}
                </label>
                {role === 'student' ? (
                  <select
                    id="login-org"
                    value={collegeOrOrg}
                    onChange={(e) => setCollegeOrOrg(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  >
                    {localColleges.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                    <option value="__other__">Other College / Institute</option>
                  </select>
                ) : (
                  <input
                    id="login-org"
                    type="text"
                    value={collegeOrOrg}
                    onChange={(e) => setCollegeOrOrg(e.target.value)}
                    placeholder={
                      role === 'owner'
                        ? 'e.g., Prothom Alo'
                        : 'Enter student full name'
                    }
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                )}
              </div>

              {role === 'student' && collegeOrOrg === '__other__' && (
                <div>
                  <label
                    htmlFor="custom-college"
                    className="block text-xs font-medium text-slate-700 mb-1.5"
                  >
                    Enter Your College Name
                  </label>
                  <input
                    id="custom-college"
                    type="text"
                    required
                    value={customCollege}
                    onChange={(e) => setCustomCollege(e.target.value)}
                    placeholder={`College in ${location.city}`}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              )}

              {formError && (
                <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <span>
                    {authLoading
                      ? 'Saving to SummrHome Cloud...'
                      : firebaseUser
                      ? `Save Profile & Enter as ${ROLE_OPTIONS.find((r) => r.id === role)?.label}`
                      : `Verify with Google & Enter as ${ROLE_OPTIONS.find((r) => r.id === role)?.label}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>

      <footer className="max-w-5xl w-full mx-auto text-xs text-slate-500 flex items-center justify-between pt-4 border-t border-slate-200">
        <span>SummrHome · {location.city}</span>
        <span>Firebase Cloud Auth & Real-Time Firestore</span>
      </footer>
    </div>
  );
}
