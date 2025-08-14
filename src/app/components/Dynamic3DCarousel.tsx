'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

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

  // Mark mounted for portal usage
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-rotate the carousel index only - images stay stable
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [images.length, intervalMs]);

  // Modal handlers
  const openModal = (imageIndex: number) => {
    setModalImageIndex(imageIndex);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Handle keyboard navigation for modal
  useEffect(() => {
    if (!modalOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [modalOpen]);

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
         <div className={`relative h-[28rem] ${className}`}>
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
                   transform: `rotateY(${angle}deg) translateZ(315px)`,
                 }}
              >
                              <div 
                className={`carousel-3d-image ${isActive ? 'active' : ''} ${isActive && category !== 'collaborations' ? 'cursor-pointer' : ''}`}
                onClick={isActive && category !== 'collaborations' ? () => openModal(index) : undefined}
              >
                <img
                  src={image.url}
                  alt={image.customName || image.originalName}
                  className="w-full h-full object-contain"
                />

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

      {/* Fullscreen Modal via Portal (anchored to viewport center) */}
      {isMounted && modalOpen && createPortal(
        (
          <div 
            className="fixed inset-0 z-[1000] flex items-center justify-center"
            onClick={closeModal}
          >
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-[90vw] max-h-[90vh] flex items-center justify-center">
              {/* Modal Image */}
              <img
                src={images[modalImageIndex]?.url}
                alt={images[modalImageIndex]?.customName || images[modalImageIndex]?.originalName}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transform transition-all duration-500 ease-out animate-modalZoomIn"
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* Close button */}
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 text-white text-4xl z-[1001] hover:scale-110 transition-transform bg-black/30 rounded-full w-12 h-12 flex items-center justify-center"
              >
                &times;
              </button>

              {/* Image details overlay - keep existing hover overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md p-6 text-white rounded-b-xl opacity-0 hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-2xl font-bold mb-2">
                  {images[modalImageIndex]?.customName || images[modalImageIndex]?.originalName}
                </h3>
                {images[modalImageIndex]?.price && (
                  <p className="text-xl text-green-400 font-semibold mb-2">
                    {images[modalImageIndex]?.price.startsWith('$') ? images[modalImageIndex]?.price : `$${images[modalImageIndex]?.price}`}
                  </p>
                )}
                {images[modalImageIndex]?.description && (
                  <p className="text-sm opacity-80">{images[modalImageIndex]?.description}</p>
                )}
              </div>
            </div>

            {/* Persistent Information Panel at Bottom of Screen */}
            <div className="fixed bottom-0 left-0 right-0 z-[999] bg-white/10 backdrop-blur-lg border-t border-white/20 p-6">
              <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-2xl font-bold text-black mb-3">
                  {images[modalImageIndex]?.customName || images[modalImageIndex]?.originalName}
                </h3>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
                  {images[modalImageIndex]?.price && (
                    <div className="text-xl font-semibold text-green-400">
                      {images[modalImageIndex]?.price.startsWith('$') ? images[modalImageIndex]?.price : `$${images[modalImageIndex]?.price}`}
                    </div>
                  )}
                  <div className="text-sm text-black/60">
                    Gallery Collection
                  </div>
                </div>
                {images[modalImageIndex]?.description && (
                  <p className="text-black/90 text-lg leading-relaxed max-w-2xl mx-auto">
                    {images[modalImageIndex]?.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ),
        document.body
      )}

      <style jsx>{`
        @keyframes modalZoomIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(100px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-modalZoomIn {
          animation: modalZoomIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
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
           width: 315px;
           height: 315px;
           transform-style: preserve-3d;
           transition: transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
         }

         .carousel-3d-item {
           position: absolute;
           width: 315px;
           height: 315px;
           backface-visibility: hidden;
         }

        .carousel-3d-image {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          border: 2px solid rgba(200, 200, 200, 0.4);
        }

        .carousel-3d-image::before {
          content: '';
          position: absolute;
          top: -20%;
          left: 0;
          width: 40%;
          height: 140%;
          background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.8), transparent);
          animation: shimmerWithPause 8s ease-in-out infinite;
          transform: skewX(-15deg);
          z-index: 1;
        }

        .carousel-3d-image:hover {
          transform: scale(1.08);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(200, 200, 200, 0.8);
        }

        .carousel-3d-image:hover::before {
          animation: shimmerWithPause 6s ease-in-out infinite;
        }

        .carousel-3d-image.active {
          transform: scale(1.12);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
          border: 2px solid rgba(200, 200, 200, 1);
        }

        .carousel-3d-image.active::before {
          animation: shimmerWithPause 5s ease-in-out infinite;
        }

        @keyframes shimmerWithPause {
          0% {
            transform: translateX(-200%) skewX(-15deg);
            opacity: 1;
          }
          25% {
            transform: translateX(350%) skewX(-15deg);
            opacity: 1;
          }
          30% {
            opacity: 0;
          }
          100% {
            transform: translateX(350%) skewX(-15deg);
            opacity: 0;
          }
        }

        .carousel-3d-image img {
          border-radius: 12px;
        }

        @media (max-width: 768px) {
          .carousel-3d {
            width: 250px;
            height: 250px;
          }

          .carousel-3d-item {
            width: 250px;
            height: 250px;
          }
        }

        @media (max-width: 480px) {
          .carousel-3d {
            width: 200px;
            height: 200px;
          }

          .carousel-3d-item {
            width: 200px;
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
}
