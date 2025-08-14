'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface SwiperGalleryCarouselProps {
  category: string;
  subcategory?: string;
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

export default function SwiperGalleryCarousel({
  category,
  subcategory,
  intervalMs = 5000,
  className = ""
}: SwiperGalleryCarouselProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
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
      
      // Use the same query structure as the admin panel
      const q = query(
        collection(db, 'images'),
        where('category', '==', category),
        ...(subcategory ? [where('subcategory', '==', subcategory)] : [])
      );

      const querySnapshot = await getDocs(q);
      
      const imageList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          url: data.url,
          filename: data.filename,
          originalName: data.originalName || data.filename,
          customName: data.customName,
          price: data.price,
          description: data.description,
          sortOrder: data.sortOrder,
          category: data.category,
          subcategory: data.subcategory,
          uploadedAt: data.uploadedAt,
          size: data.size,
          type: data.type
        };
      }) as ImageData[];

      // Sort by custom order first, then by upload date (same as admin panel)
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

      setImages(imageList);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  }, [category, subcategory]);

  // Load images once and keep them stable
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Mark mounted for portal usage
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Modal handlers
  const openModal = (imageIndex: number) => {
    setModalImageIndex(imageIndex);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const navigateModal = (direction: 'prev' | 'next') => {
    setModalImageIndex(prev => {
      if (direction === 'prev') {
        return prev === 0 ? images.length - 1 : prev - 1;
      } else {
        return (prev + 1) % images.length;
      }
    });
  };

  // Handle keyboard navigation for modal
  useEffect(() => {
    if (!modalOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowLeft') {
        navigateModal('prev');
      } else if (e.key === 'ArrowRight') {
        navigateModal('next');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [modalOpen]);

  if (loading) {
    return (
      <div className={`relative h-[600px] flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black/30 mx-auto mb-4"></div>
          <p className="text-black/60">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (!loading && images.length === 0) {
    return (
      <div className={`relative h-[600px] flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <p className="text-xl font-medium text-black/60 mb-2">No {category} images found</p>
          <p className="text-black/50">Upload images with category &quot;{category}&quot; through the admin panel</p>
          {subcategory && (
            <p className="text-black/40 text-sm mt-2">Looking for subcategory: {subcategory}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Modern Swiper Carousel */}
      <div className="w-full h-[600px]">
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={true}
          autoplay={{
            delay: intervalMs,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={images.length > 1}
          modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
          className="gallery-swiper"
        >
          {images.map((image, index) => (
            <SwiperSlide key={`${image.id}-${index}`} className="swiper-slide-custom">
              <div 
                className="relative w-[450px] h-[450px] mx-auto cursor-pointer group overflow-hidden rounded-2xl shadow-2xl"
                onClick={() => openModal(index)}
              >
                {/* Image Container with Glass Effect */}
                <div className="relative w-full h-full">
                  <img
                    src={image.url}
                    alt={image.customName || image.originalName}
                    className="w-full h-full object-cover transition-all duration-700"
                  />
                  
                  {/* Shimmer Effect - ON by default, less frequent, OFF on hover for active slide only */}
                  <div 
                    className="shimmer-layer absolute inset-0 opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                      transform: 'translateX(-100%)',
                      animation: 'shimmerSweepSlow 8s infinite'
                    }}
                  />
                  
                  {/* Overlay with Glass Effect - appears on hover for active slide only */}
                  <div className="glass-overlay absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-all duration-500" />
                  
                  {/* Image Info Overlay - VISIBLE by default, HIDDEN on hover for active slide only */}
                  <div 
                    className="nameplate absolute bottom-0 left-0 right-0 p-4 text-center transform translate-y-0 transition-all duration-500"
                    style={{
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <h3 className="text-black font-bold text-lg mb-1 truncate">
                      {image.customName || image.originalName}
                    </h3>
                    {image.price && (
                      <p className="text-green-600 font-semibold text-sm">
                        {image.price.startsWith('$') ? image.price : `$${image.price}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>



      {/* Fullscreen Modal */}
      {isMounted && modalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          onClick={closeModal}
        >
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-[90vw] max-h-[90vh] flex items-center justify-center">
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

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateModal('prev'); }}
                  className="fixed left-8 top-1/2 transform -translate-y-1/2 z-[1002] w-16 h-16 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300 hover:scale-110"
                >
                  ←
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateModal('next'); }}
                  className="fixed right-8 top-1/2 transform -translate-y-1/2 z-[1002] w-16 h-16 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300 hover:scale-110"
                >
                  →
                </button>
              </>
            )}
          </div>

          {/* Persistent Information Panel */}
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
        </div>,
        document.body
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        .gallery-swiper {
          width: 100%;
          padding-top: 50px;
          padding-bottom: 50px;
        }

        .gallery-swiper .swiper-slide {
          background-position: center;
          background-size: cover;
          width: 450px;
          height: 450px;
        }

        .gallery-swiper .swiper-slide-active {
          transform: scale(1.1);
        }

        .gallery-swiper .swiper-pagination {
          position: relative;
          margin-top: 30px;
        }

        .gallery-swiper .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          margin: 0 8px;
          transition: all 0.3s ease;
        }

        .gallery-swiper .swiper-pagination-bullet-active {
          background: rgba(255, 255, 255, 1);
          transform: scale(1.3);
        }

        .gallery-swiper .swiper-button-next,
        .gallery-swiper .swiper-button-prev {
          color: rgba(255, 255, 255, 0.8);
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          margin-top: -25px;
          transition: all 0.3s ease;
        }

        .gallery-swiper .swiper-button-next:hover,
        .gallery-swiper .swiper-button-prev:hover {
          background: rgba(0, 0, 0, 0.5);
          color: rgba(255, 255, 255, 1);
          transform: scale(1.1);
        }

        .gallery-swiper .swiper-button-next:after,
        .gallery-swiper .swiper-button-prev:after {
          font-size: 20px;
          font-weight: bold;
        }

        @keyframes shimmerSweep {
          0% { 
            transform: translateX(-150%); 
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% { 
            transform: translateX(250%); 
            opacity: 0;
          }
        }

        @keyframes shimmerSweepSlow {
          0% { 
            transform: translateX(-150%); 
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          15% {
            opacity: 1;
          }
          20% { 
            transform: translateX(250%); 
            opacity: 0;
          }
          21% {
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        /* Only apply hover effects to the active slide */
        .gallery-swiper .swiper-slide-active .group:hover img {
          transform: scale(1.25);
        }

        .gallery-swiper .swiper-slide-active .group:hover .shimmer-layer {
          opacity: 0;
        }

        .gallery-swiper .swiper-slide-active .group:hover .glass-overlay {
          opacity: 1;
        }

        .gallery-swiper .swiper-slide-active .group:hover .nameplate {
          transform: translateY(100%);
        }
      `}</style>
    </div>
  );
}
