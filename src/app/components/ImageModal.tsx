'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  const [mounted, setMounted] = useState(false);

  const currentImage = images[currentImageIndex];

  useEffect(() => setMounted(true), []);

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

  return mounted && isOpen && createPortal(
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {/* Modal Image */}
        <img
          src={currentImage.url}
          alt={currentImage.customName || currentImage.originalName}
          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transform transition-all duration-500 ease-out animate-modalZoomIn"
          onClick={(e) => e.stopPropagation()}
        />
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-4xl z-[1001] hover:scale-110 transition-transform bg-black/30 rounded-full w-12 h-12 flex items-center justify-center"
        >
          &times;
        </button>

        {/* Image details overlay - keep existing hover overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md p-6 text-white rounded-b-xl opacity-0 hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-2xl font-bold mb-2">
            {currentImage.customName || currentImage.originalName}
          </h3>
          {currentImage.price && (
            <p className="text-xl text-green-400 font-semibold mb-2">
              {currentImage.price.startsWith('$') ? currentImage.price : `$${currentImage.price}`}
            </p>
          )}
          {currentImage.description && (
            <p className="text-sm opacity-80">{currentImage.description}</p>
          )}
        </div>
      </div>

      {/* Navigation buttons - moved outside image container for better visibility */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); navigatePrevious(); }}
            className="fixed left-8 top-1/2 transform -translate-y-1/2 z-[1002] w-16 h-16 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300 hover:scale-110"
          >
            ←
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigateNext(); }}
            className="fixed right-8 top-1/2 transform -translate-y-1/2 z-[1002] w-16 h-16 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300 hover:scale-110"
          >
            →
          </button>
        </>
      )}

      {/* Persistent Information Panel at Bottom of Screen */}
      <div className="fixed bottom-0 left-0 right-0 z-[999] bg-white/10 backdrop-blur-lg border-t border-white/20 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-black mb-3">
            {currentImage.customName || currentImage.originalName}
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
            {currentImage.price && (
              <div className="text-xl font-semibold text-green-400">
                {currentImage.price.startsWith('$') ? currentImage.price : `$${currentImage.price}`}
              </div>
            )}
            <div className="text-sm text-black/60">
              Gallery Collection
            </div>
          </div>
          {currentImage.description && (
            <p className="text-black/90 text-lg leading-relaxed max-w-2xl mx-auto">
              {currentImage.description}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
