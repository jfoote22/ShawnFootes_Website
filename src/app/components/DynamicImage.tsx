'use client';

import { useImageRotation } from '@/lib/hooks/useImageRotation';
import { useState, useEffect } from 'react';

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayImage, setDisplayImage] = useState<any>(null);

  // Handle smooth image transitions
  const currentImage = currentImages[0];
  
  useEffect(() => {
    if (currentImage && currentImage !== displayImage) {
      // If it's the first image load, don't transition
      if (!displayImage) {
        setDisplayImage(currentImage);
        return;
      }
      
      setIsTransitioning(true);
      
      // Preload the new image
      const img = new Image();
      img.onload = () => {
        setTimeout(() => {
          setDisplayImage(currentImage);
          setIsTransitioning(false);
        }, 150); // Brief delay for smooth transition
      };
      img.src = currentImage.url;
    }
  }, [currentImage, displayImage]);

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
    <div className={`relative overflow-hidden ${className} group`}>
      {/* Shimmering border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
      <div className="absolute inset-0 border-2 border-gray-300/60 group-hover:border-gray-400/80 transition-all duration-300 rounded-xl"></div>
      
      {/* Main image with advanced transitions */}
      <div className="relative w-full h-full rounded-xl overflow-hidden">
        {displayImage && (
          <img
            key={displayImage.id}
            src={displayImage.url}
            alt={alt}
            className={`
              w-full h-full object-cover absolute inset-0
              transition-all duration-700 ease-in-out
              ${isTransitioning ? 'opacity-0 scale-105 blur-sm' : 'opacity-100 scale-100 blur-0'}
              group-hover:scale-110 group-hover:brightness-110
            `}
            onLoad={() => setImageLoaded(true)}
          />
        )}
        
        {/* Glass overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Loading overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
