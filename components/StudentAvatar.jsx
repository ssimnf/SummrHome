'use client';

import React from 'react';
import { User } from 'lucide-react';

export default function StudentAvatar({
  src,
  alt = 'Student photo',
  size = 'md',
}) {
  const sizeClasses =
    size === 'xl'
      ? 'w-24 h-24'
      : size === 'lg'
      ? 'w-16 h-16'
      : size === 'sm'
      ? 'w-7 h-7'
      : 'w-11 h-11';

  const iconClasses =
    size === 'xl'
      ? 'w-12 h-12'
      : size === 'lg'
      ? 'w-8 h-8'
      : size === 'sm'
      ? 'w-4 h-4'
      : 'w-6 h-6';

  if (src) {
    return (
      <div
        className={`${sizeClasses} rounded-full overflow-hidden border border-slate-300 bg-slate-100 shrink-0`}
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full border-2 border-slate-300 bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden`}
      aria-label="No profile photo uploaded"
      title="Vacant profile photo"
    >
      <User
        className={`${iconClasses} text-slate-950 fill-slate-950`}
        strokeWidth={1.8}
        aria-hidden="true"
      />
    </div>
  );
}
