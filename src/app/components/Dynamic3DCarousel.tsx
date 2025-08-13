'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

interface Dynamic3DCarouselProps {
  category: string;
  subcategory?: string;
  count?: number;
  intervalMs?: number;
  className?: string;
}

interface ImageData {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  customName?: string;
  price?: string;
  description?: string;
  sortOrder?: number;
  category: string;
  subcategory?: string;
  uploadedAt: any;
  size: number;
  type: string;
}

export default function Dynamic3DCarousel({
  category,
  subcategory,
  count = 6,
  intervalMs = 4000,
  className = ""
}: Dynamic3DCarouselProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!db) {
        console.log('Firebase not initialized');
        setLoading(false);
        return;
      }
      
      const q = query(
        collection(db, 'images'),
        where('category', '==', category),
        ...(subcategory ? [where('subcategory', '==', subcategory)] : [])
      );
      
      const querySnapshot = await getDocs(q);
      const imageList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ImageData[];

      // Sort by custom order first, then by upload date
      imageList.sort((a, b) => {
        // If both have sortOrder, use that
        if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
          return a.sortOrder - b.sortOrder;
        }
        // If only one has sortOrder, prioritize it
        if (a.sortOrder !== undefined) return -1;
        if (b.sortOrder !== undefined) return 1;
        // If neither has sortOrder, sort by upload date (newest first)
        const dateA = a.uploadedAt?.toDate?.() || new Date(a.uploadedAt) || new Date(0);
        const dateB = b.uploadedAt?.toDate?.() || new Date(b.uploadedAt) || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      // Take the requested count and duplicate if needed for 3D effect
      const selectedImages = imageList.slice(0, count);
      if (selectedImages.length > 0 && selectedImages.length < count) {
        // Duplicate images to fill the carousel if we don't have enough
        while (selectedImages.length < count) {
          selectedImages.push(...imageList.slice(0, count - selectedImages.length));
        }
      }

      setImages(selectedImages);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  }, [category, subcategory, count]);

  // Load images once and keep them stable
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Auto-rotate the carousel index only - images stay stable
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [images.length, intervalMs]);

  if (loading) {
    return (
      <div className={`relative h-96 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black/60">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (!loading && images.length === 0) {
    return (
      <div className={`relative h-96 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <p className="text-xl font-medium text-black/60 mb-2">No gallery images yet</p>
          <p className="text-black/50">Upload images through the admin panel</p>
        </div>
      </div>
    );
  }

  return (
         <div className={`relative h-96 ${className}`}>
      <div className="carousel-3d-container">
        <div 
          className="carousel-3d"
          style={{
            transform: `rotateY(${-currentIndex * (360 / images.length)}deg)`
          }}
        >
          {images.map((image, index) => {
            const angle = (360 / images.length) * index;
            const isActive = index === currentIndex;
            
            return (
              <div
                key={`${image.id}-${index}`}
                className="carousel-3d-item"
                                 style={{
                   transform: `rotateY(${angle}deg) translateZ(300px)`,
                 }}
              >
                <div className={`carousel-3d-image ${isActive ? 'active' : ''}`}>
                  <img
                    src={image.url}
                    alt={image.customName || image.originalName}
                    className="w-full h-full object-cover"
                  />
                  <div className="carousel-3d-overlay">
                    <h3 className="text-white font-semibold text-lg mb-2">
                      {image.customName || image.originalName}
                    </h3>
                    {image.price && (
                      <p className="text-green-300 font-bold">
                        {image.price.startsWith('$') ? image.price : `$${image.price}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

             {/* Navigation Dots */}
       <div className="flex justify-center mt-16 space-x-2">
         {images.map((_, index) => (
           <button
             key={index}
             onClick={() => setCurrentIndex(index)}
             className={`w-3 h-3 rounded-full transition-all duration-300 ${
               index === currentIndex
                 ? 'bg-white scale-125'
                 : 'bg-white/50 hover:bg-white/75'
             }`}
           />
         ))}
       </div>

      <style jsx>{`
        .carousel-3d-container {
          position: relative;
          width: 100%;
          height: 100%;
          perspective: 1000px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

                 .carousel-3d {
           position: relative;
           width: 300px;
           height: 300px;
           transform-style: preserve-3d;
           transition: transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
         }

         .carousel-3d-item {
           position: absolute;
           width: 300px;
           height: 300px;
           backface-visibility: hidden;
         }

        .carousel-3d-image {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          position: relative;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .carousel-3d-image:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
        }

        .carousel-3d-image.active {
          transform: scale(1.1);
          box-shadow: 0 16px 64px rgba(0, 0, 0, 0.5);
        }

        .carousel-3d-image img {
          border-radius: 12px;
        }

        .carousel-3d-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          padding: 16px;
          transform: translateY(100%);
          transition: transform 0.3s ease;
        }

        .carousel-3d-image:hover .carousel-3d-overlay,
        .carousel-3d-image.active .carousel-3d-overlay {
          transform: translateY(0);
        }

                 @media (max-width: 768px) {
           .carousel-3d {
             width: 225px;
             height: 225px;
           }

           .carousel-3d-item {
             width: 225px;
             height: 225px;
           }

           .carousel-3d-item {
             transform: rotateY(var(--angle)) translateZ(225px) !important;
           }
         }
      `}</style>
    </div>
  );
}
