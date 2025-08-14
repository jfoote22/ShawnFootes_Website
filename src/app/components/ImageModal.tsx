'use client';

import { useState, useEffect } from 'react';

interface ImageData {
  id: string;
  url: string;
  originalName: string;
  customName?: string;
  price?: string;
  description?: string;
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageData[];
  currentImageIndex: number;
  onNavigate: (index: number) => void;
}

export default function ImageModal({
  isOpen,
  onClose,
  images,
  currentImageIndex,
  onNavigate
}: ImageModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentImage = images[currentImageIndex];

  const navigatePrevious = () => {
    if (images.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
      onNavigate(newIndex);
      setImageLoaded(false);
      setIsTransitioning(false);
    }, 150);
  };

  const navigateNext = () => {
    if (images.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
      onNavigate(newIndex);
      setImageLoaded(false);
      setIsTransitioning(false);
    }, 150);
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          navigatePrevious();
          break;
        case 'ArrowRight':
          navigateNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Prevent scrolling

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentImageIndex, onClose, navigatePrevious, navigateNext]);

  if (!isOpen || !currentImage) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center">
      {/* Background overlay - click to close */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300 hover:scale-110"
        >
          ×
        </button>

        {/* Image counter */}
        <div className="absolute top-6 left-6 z-10 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
          {currentImageIndex + 1} / {images.length}
        </div>

        {/* Previous button */}
        {images.length > 1 && (
          <button
            onClick={navigatePrevious}
            className="absolute left-6 z-10 w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300 hover:scale-110"
          >
            ←
          </button>
        )}

        {/* Next button */}
        {images.length > 1 && (
          <button
            onClick={navigateNext}
            className="absolute right-6 z-10 w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300 hover:scale-110"
          >
            →
          </button>
        )}

        {/* Main image */}
        <div className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center">
          <img
            src={currentImage.url}
            alt={currentImage.customName || currentImage.originalName}
            className={`
              max-w-full max-h-full object-contain rounded-lg shadow-2xl
              transition-all duration-500 ease-in-out
              ${isTransitioning ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}
              ${imageLoaded ? 'animate-fadeInUp' : ''}
            `}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Loading indicator */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Image details */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 max-w-2xl text-center">
          <div className="bg-black/50 backdrop-blur-sm text-white px-6 py-4 rounded-2xl">
            <h3 className="text-2xl font-bold mb-2">
              {currentImage.customName || currentImage.originalName}
            </h3>
            {currentImage.price && (
              <p className="text-green-400 font-bold text-lg mb-2">
                {currentImage.price.startsWith('$') ? currentImage.price : `$${currentImage.price}`}
              </p>
            )}
            {currentImage.description && (
              <p className="text-white/90 leading-relaxed">
                {currentImage.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
