'use client';

import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function SafePhoto({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackLabel,
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-4 text-center">
        <ImageOff className="w-6 h-6 text-slate-400 mb-1.5" />
        <span className="text-xs font-medium text-slate-600 line-clamp-2">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
