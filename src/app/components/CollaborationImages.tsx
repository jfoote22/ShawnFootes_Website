'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

interface CollabImage {
  id: string;
  url: string;
  filename: string;
  category: string;
}

export default function CollaborationImages({
  className = "",
}: {
  className?: string;
}) {
  const [images, setImages] = useState<CollabImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    async function loadImages() {
      try {
        console.log('=== COLLABORATION DEBUG START ===');
        
        if (!db) {
          console.log('❌ Firebase not initialized');
          setLoading(false);
          return;
        }

        console.log('✅ Firebase initialized, fetching all images...');
        const snapshot = await getDocs(collection(db, 'images'));
        
        console.log(`📊 Total images in database: ${snapshot.size}`);
        
        const allImages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CollabImage[];

        console.log('📋 All images:', allImages.map(img => ({ 
          id: img.id, 
          category: img.category, 
          filename: img.filename 
        })));

        const collaborationImages = allImages.filter(img => img.category === 'collaborations');
        
        console.log(`🤝 Collaboration images found: ${collaborationImages.length}`);
        console.log('🎯 Collaboration images:', collaborationImages);

        setImages(collaborationImages);
        console.log('=== COLLABORATION DEBUG END ===');
        
      } catch (error) {
        console.error('❌ Error loading images:', error);
      } finally {
        setLoading(false);
      }
    }

    loadImages();
  }, []);

  // Rotate images every 6 seconds with enhanced transition effect
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setTimeout(() => setIsTransitioning(false), 500); // Longer transition time
      }, 600); // Longer fade out time
    }, 6000);

    return () => clearInterval(interval);
  }, [images.length]);

  if (loading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={`${className} bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center`}>
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-4">🤝</div>
          <h3 className="text-2xl font-bold mb-4">Collaboration Space</h3>
          <p className="text-lg opacity-90">Upload collaboration images</p>
          <p className="text-base opacity-75">in the admin panel</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className={`relative overflow-hidden ${className} group`}>
      {/* Always visible shimmering border effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent animate-shimmer"></div>
        <div className="absolute inset-0 border-3 border-purple-400/70 group-hover:border-purple-500/90 transition-all duration-500 rounded-xl shadow-lg group-hover:shadow-purple-500/25"></div>
      </div>
      
      <div className="relative w-full h-full rounded-xl overflow-hidden">
        <img
          key={`collab-${currentImage.id}-${currentIndex}`}
          src={currentImage.url}
          alt={currentImage.filename}
          className={`
            w-full h-full object-cover transition-all duration-1000 ease-in-out
            group-hover:scale-105 group-hover:brightness-110
            ${isTransitioning 
              ? 'opacity-0 scale-90 blur-md transform translate-x-8 rotate-1' 
              : 'opacity-100 scale-100 blur-0 transform translate-x-0 rotate-0'
            }
          `}
        />
        
        {/* Enhanced slide-in overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-transparent to-indigo-500/30 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
        
        {/* Enhanced transition loading overlay */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-md flex items-center justify-center">
            <div className="relative">
              <div className="w-8 h-8 border-3 border-purple-400/60 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-8 h-8 border-3 border-transparent border-b-indigo-500 rounded-full animate-spin animate-reverse"></div>
            </div>
          </div>
        )}
        
        {/* Pulse effect during transitions */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-purple-500/10 animate-pulse"></div>
        )}
      </div>
    </div>
  );
}
