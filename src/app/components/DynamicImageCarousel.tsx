'use client';

import { useImageRotation } from '@/lib/hooks/useImageRotation';

interface DynamicImageCarouselProps {
  category: string;
  subcategory?: string;
  count?: number;
  intervalMs?: number;
  className?: string;
  itemClassName?: string;
}

export default function DynamicImageCarousel({
  category,
  subcategory,
  count = 6,
  intervalMs = 8000, // 8 seconds for carousel
  className = "",
  itemClassName = ""
}: DynamicImageCarouselProps) {
  const { currentImages, loading, hasImages } = useImageRotation({
    category,
    subcategory,
    intervalMs,
    randomCount: count
  });

  if (loading) {
    return (
      <div className={`flex gap-6 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`bg-gray-200 animate-pulse rounded-xl ${itemClassName}`}>
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Loading...
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!hasImages) {
    return (
      <div className={`flex gap-6 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div 
            key={i} 
            className={`bg-gradient-to-br from-blue-400 to-green-400 rounded-xl flex items-center justify-center group cursor-pointer hover:scale-105 transition-transform duration-300 ${itemClassName}`}
          >
            <div className="text-center text-white">
              <p className="font-semibold text-lg mb-2">Artwork {i + 1}</p>
              <p className="text-sm opacity-90">Upload images</p>
              <p className="text-sm opacity-90">in admin panel</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fill remaining slots with placeholder if we don't have enough images
  const displayImages = [...currentImages];
  while (displayImages.length < count) {
    displayImages.push(...currentImages.slice(0, count - displayImages.length));
  }

  return (
    <div className={`flex gap-6 ${className}`}>
      {displayImages.slice(0, count).map((image, i) => (
        <div 
          key={`${image.id}-${i}`}
          className={`rounded-xl overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-300 ${itemClassName}`}
        >
          <img
            src={image.url}
            alt={`Gallery item ${i + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
