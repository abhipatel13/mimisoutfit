import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-[3/4] bg-neutral-200" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Brand name */}
        <div className="h-3 bg-neutral-200 rounded w-1/3" />
        
        {/* Product name */}
        <div className="h-4 bg-neutral-200 rounded w-3/4" />
        
        {/* Price */}
        <div className="h-4 bg-neutral-200 rounded w-1/4" />
        
        {/* Button */}
        <div className="h-10 bg-neutral-200 rounded-full mt-4" />
      </div>
    </div>
  );
}
