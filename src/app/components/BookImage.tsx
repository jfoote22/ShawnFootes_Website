'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

interface BookImageProps {
  category: string;
  subcategory?: string;
  className?: string;
}

interface ImageData {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  customName?: string;
  sortOrder?: number;
  category: string;
  subcategory?: string;
  uploadedAt: any;
}

export default function BookImage({
  category,
  subcategory,
  className = ""
}: BookImageProps) {
  const [firstImage, setFirstImage] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFirstImage = useCallback(async () => {
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

      // Get the first image
      if (imageList.length > 0) {
        setFirstImage(imageList[0]);
      }
    } catch (error) {
      console.error('Error loading first image:', error);
    } finally {
      setLoading(false);
    }
  }, [category, subcategory]);

  useEffect(() => {
    loadFirstImage();
  }, [loadFirstImage]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!firstImage) {
    return (
      <div className={`bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center text-white p-8">
          <div className="text-4xl mb-4">📚</div>
          <p className="font-semibold">Book Image</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        src={firstImage.url}
        alt={firstImage.customName || firstImage.originalName}
        className="w-full h-full object-cover rounded-xl"
      />
    </div>
  );
}