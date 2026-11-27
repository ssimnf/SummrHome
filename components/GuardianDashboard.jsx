'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Phone,
  Clock,
  CheckCircle2,
  Send,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export default function GuardianDashboard() {
  const {
    currentUser,
    pgListings,
    guardianAlerts,
    chatMessages,
    updateAlertStatus,
    sendChatMessage,
  } = useAppState();

  const [msgText, setMsgText] = useState('');
  const linkedPG = pgListings[0];
  const threadId = 'guardian-owner-pg-sreerampore-1';
  const threadMessages = chatMessages.filter((m) => m.threadId === threadId);

  const handleSend = (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    sendChatMessage(threadId, msgText);
    setMsgText('');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-2 text-xs font-medium text-teal-700 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>
              Guardian Safety Portal
              {currentUser?.name ? ` · ${currentUser.name}` : ''}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {currentUser?.linkedStudentName || 'Student'} — Current PG Status
          </h1>
          <p className="text-sm text-slate-600 mt-1.5">
            Residing at{' '}
            <span className="font-semibold text-slate-900">
              {linkedPG?.title}
            </span>{' '}
            ({linkedPG?.neighborhood}, {linkedPG?.city}) · Double Sharing Bed
            #2B
          </p>
        </div>

        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5 text-xs">
          <div className="text-slate-500">PG Warden / Owner</div>
          <div className="text-sm font-bold text-slate-900">
            {linkedPG?.ownerName}
          </div>
          <div className="flex items-center gap-1.5 font-mono tabular-nums text-slate-700">
            <Phone className="w-3.5 h-3.5 text-teal-700" />
            <span>{linkedPG?.ownerMobile}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Check-In / Check-Out & Night-Out Alerts
            </h2>
            <span className="text-xs text-slate-500 tabular-nums">
              {guardianAlerts.length} recent logs
            </span>
          </div>

          <div className="space-y-3">
            {guardianAlerts.map((alert) => {
              const isNightOut = alert.type === 'Night-Out Request';
              const isPending = alert.status === 'Pending Approval';

              return (
                <div
                  key={alert.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      {isNightOut ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-teal-700" />
                      )}
                      <span
                        className={
                          isNightOut ? 'text-amber-800' : 'text-slate-900'
                        }
                      >
                        {alert.type}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-slate-500 font-normal flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{alert.timestamp}</span>
                      </span>
                    </div>

                    <span
                      className={`text-xs font-semibold ${
                        alert.status === 'Pending Approval'
                          ? 'text-amber-700'
                          : 'text-teal-700'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700">{alert.message}</p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{alert.locationNote}</span>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateAlertStatus(alert.id, 'Approved')
                          }
                          className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg cursor-pointer"
                        >
                          Approve Night-Out
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateAlertStatus(alert.id, 'Acknowledged')
                          }
                          className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col h-full min-h-[440px]">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Message PG Owner
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct verified thread with {linkedPG?.ownerName}
              </p>
            </div>

            <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[340px]">
              {threadMessages.map((msg) => {
                const isGuardian = msg.senderRole === 'guardian';
                return (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl text-xs ${
                      isGuardian
                        ? 'bg-teal-700 text-white ml-8'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] opacity-80 mb-1">
                      <span className="font-semibold">{msg.senderName}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={handleSend}
              className="pt-3 border-t border-slate-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="Ask warden about meals, gate entry, or safety..."
                className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              <button
                type="submit"
                aria-label="Send message to PG owner"
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer"
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
