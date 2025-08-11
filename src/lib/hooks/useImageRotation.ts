'use client';

import { useState, useEffect } from 'react';
import { getImagesByCategory, getRandomImages, ImageData } from '@/lib/firebase/imageUtils';

interface UseImageRotationOptions {
  category: string;
  subcategory?: string;
  intervalMs?: number;
  randomCount?: number;
}

export function useImageRotation({
  category,
  subcategory,
  intervalMs = 5000, // 5 seconds default
  randomCount = 1
}: UseImageRotationOptions) {
  const [currentImages, setCurrentImages] = useState<ImageData[]>([]);
  const [allImages, setAllImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load all images for this category
  useEffect(() => {
    const loadImages = async () => {
      try {
        const images = await getImagesByCategory(category, subcategory);
        setAllImages(images);
        
        if (images.length > 0) {
          const initialImages = randomCount > 1 
            ? getRandomImages(images, Math.min(randomCount, images.length))
            : [images[0]];
          setCurrentImages(initialImages);
        }
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [category, subcategory, randomCount]);

  // Set up rotation interval
  useEffect(() => {
    if (allImages.length <= randomCount) return;

    const interval = setInterval(() => {
      if (randomCount > 1) {
        // For multiple images, get a new random set
        const newImages = getRandomImages(allImages, randomCount);
        setCurrentImages(newImages);
      } else {
        // For single image, cycle through them
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % allImages.length;
          setCurrentImages([allImages[nextIndex]]);
          return nextIndex;
        });
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [allImages, intervalMs, randomCount]);

  // Refresh images (for when new images are added)
  const refreshImages = async () => {
    setLoading(true);
    try {
      const images = await getImagesByCategory(category, subcategory);
      setAllImages(images);
      
      if (images.length > 0) {
        const newImages = randomCount > 1 
          ? getRandomImages(images, Math.min(randomCount, images.length))
          : [images[0]];
        setCurrentImages(newImages);
      }
    } catch (error) {
      console.error('Error refreshing images:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    currentImages,
    allImages,
    loading,
    refreshImages,
    hasImages: allImages.length > 0
  };
}
