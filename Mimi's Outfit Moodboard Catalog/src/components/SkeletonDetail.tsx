import React from 'react';

export default function SkeletonDetail() {
  return (
    <div className="animate-pulse">
      {/* Back button skeleton */}
      <div className="h-10 w-24 bg-neutral-200 rounded-full mb-8" />
      
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image skeleton */}
        <div className="aspect-[3/4] bg-neutral-200 rounded-lg" />
        
        {/* Content skeleton */}
        <div className="space-y-6">
          {/* Brand */}
          <div className="h-4 bg-neutral-200 rounded w-1/4" />
          
          {/* Title */}
          <div className="h-8 bg-neutral-200 rounded w-3/4" />
          
          {/* Price */}
          <div className="h-6 bg-neutral-200 rounded w-1/3" />
          
          {/* Description lines */}
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-neutral-200 rounded w-full" />
            <div className="h-4 bg-neutral-200 rounded w-full" />
            <div className="h-4 bg-neutral-200 rounded w-5/6" />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <div className="h-12 bg-neutral-200 rounded-full flex-1" />
            <div className="h-12 w-12 bg-neutral-200 rounded-full" />
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-6">
            <div className="h-8 bg-neutral-200 rounded-full w-20" />
            <div className="h-8 bg-neutral-200 rounded-full w-24" />
            <div className="h-8 bg-neutral-200 rounded-full w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
