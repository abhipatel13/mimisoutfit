import React from 'react';

export default function SkeletonMoodboard() {
  return (
    <div className="group relative overflow-hidden rounded-lg shadow-sm animate-pulse">
      {/* Cover image skeleton */}
      <div className="aspect-[4/5] bg-neutral-200" />
      
      {/* Overlay content skeleton */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          {/* Title */}
          <div className="h-6 bg-white/30 rounded w-2/3" />
          
          {/* Description */}
          <div className="h-4 bg-white/20 rounded w-full" />
          <div className="h-4 bg-white/20 rounded w-4/5" />
          
          {/* Button */}
          <div className="h-10 bg-white/30 rounded-full w-32 mt-4" />
        </div>
      </div>
    </div>
  );
}
