'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

interface Dynamic3DCarouselLargeProps {
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

export default function Dynamic3DCarouselLarge({
  category,
  subcategory,
  intervalMs = 5000,
  className = ""
}: Dynamic3DCarouselLargeProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Number of images to show at once in the carousel
  const imagesPerPage = 8;
  const totalPages = Math.ceil(images.length / imagesPerPage);

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

  // Auto-rotate the carousel
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % imagesPerPage;
        // If we're at the end of current page, move to next page
        if (nextIndex === 0 && totalPages > 1) {
          setCurrentPage(prevPage => (prevPage + 1) % totalPages);
        }
        return nextIndex;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [images.length, intervalMs, imagesPerPage, totalPages]);

  // Modal handlers
  const openModal = (imageIndex: number) => {
    const absoluteIndex = currentPage * imagesPerPage + imageIndex;
    setModalImageIndex(absoluteIndex);
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
      <div className={`relative h-96 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black/30 mx-auto mb-4"></div>
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
          <p className="text-xl font-medium text-black/60 mb-2">No {category} images found</p>
          <p className="text-black/50">Upload images with category &quot;{category}&quot; through the admin panel</p>
          {subcategory && (
            <p className="text-black/40 text-sm mt-2">Looking for subcategory: {subcategory}</p>
          )}
        </div>
      </div>
    );
  }

  // Get current page images
  const currentPageImages = images.slice(
    currentPage * imagesPerPage,
    (currentPage + 1) * imagesPerPage
  );

  return (
    <div className={`relative h-96 ${className}`}>
      {/* Cylinder-style 3D Carousel */}
      <div 
        className="relative w-full h-full"
        style={{
          perspective: '1000px',
          perspectiveOrigin: '50% 50%'
        }}
      >
        <div 
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${-currentIndex * (360 / imagesPerPage)}deg)`,
            transition: 'transform 0.8s ease-in-out'
          }}
        >
          {currentPageImages.map((image, index) => {
            const angle = (360 / imagesPerPage) * index;
            const isActive = index === currentIndex;
            const radius = 250; // Larger radius for more images
            
            return (
              <div
                key={`${image.id}-${currentPage}-${index}`}
                className="absolute w-48 h-64 cursor-pointer group"
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: '-96px', // Half of width
                  marginTop: '-128px', // Half of height
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  transformStyle: 'preserve-3d'
                }}
                onClick={() => openModal(index)}
              >
                <div 
                  className={`w-full h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 ${
                    isActive 
                      ? 'scale-110 shadow-xl ring-4 ring-white/50' 
                      : 'scale-95 opacity-80 group-hover:scale-105 group-hover:opacity-100'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.customName || image.originalName}
                    className="w-full h-48 object-cover"
                    style={{
                      filter: isActive ? 'none' : 'brightness(0.8)'
                    }}
                  />
                  
                  {/* Shimmer effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                      transform: 'translateX(-100%)',
                      animation: isActive ? 'shimmerSweep 2s infinite' : 'none'
                    }}
                  />
                  
                  {/* Image info overlay */}
                  <div 
                    className={`absolute bottom-0 left-0 right-0 p-3 text-center transition-all duration-300 ${
                      isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-60 group-hover:translate-y-0 group-hover:opacity-100'
                    }`}
                    style={{
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <h3 className="text-black font-semibold text-sm truncate">
                      {image.customName || image.originalName}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Page Navigation */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-4">
          <button
            onClick={() => setCurrentPage(prev => (prev - 1 + totalPages) % totalPages)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-black font-bold hover:bg-white/30 transition-all duration-300"
          >
            ←
          </button>
          
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, pageIndex) => (
              <button
                key={pageIndex}
                onClick={() => setCurrentPage(pageIndex)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  pageIndex === currentPage
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => (prev + 1) % totalPages)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-black font-bold hover:bg-white/30 transition-all duration-300"
          >
            →
          </button>
        </div>
      )}

      {/* Image counter */}
      <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
        {currentPage * imagesPerPage + currentIndex + 1} / {images.length}
      </div>

      {/* Fullscreen Modal */}
      {isMounted && modalOpen && createPortal(
        (
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
          </div>
        ),
        document.body
      )}

      <style jsx>{`
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
