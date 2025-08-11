'use client';

import { useImageRotation } from '@/lib/hooks/useImageRotation';
import { useState } from 'react';

interface DynamicImageProps {
  category: string;
  subcategory?: string;
  className?: string;
  fallbackSrc?: string;
  fallbackContent?: React.ReactNode;
  intervalMs?: number;
  alt?: string;
}

export default function DynamicImage({
  category,
  subcategory,
  className = "",
  fallbackSrc,
  fallbackContent,
  intervalMs = 5000,
  alt = "Dynamic image"
}: DynamicImageProps) {
  const { currentImages, loading, hasImages } = useImageRotation({
    category,
    subcategory,
    intervalMs,
    randomCount: 1
  });
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fadeClass, setFadeClass] = useState('opacity-100');

  // Handle image transitions with fade effect
  const currentImage = currentImages[0];

  if (loading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!hasImages) {
    if (fallbackContent) {
      return <div className={className}>{fallbackContent}</div>;
    }
    
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          onLoad={() => setImageLoaded(true)}
        />
      );
    }
    
    return (
      <div className={`${className} bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white`}>
        <div className="text-center">
          <p className="font-semibold">No images available</p>
          <p className="text-sm opacity-80">Upload images in admin panel</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        key={currentImage.id}
        src={currentImage.url}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${fadeClass}`}
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  );
}
