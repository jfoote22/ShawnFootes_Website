'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

interface StudioImage {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  // Custom metadata fields
  customName?: string;
  price?: string;
  description?: string;
  sortOrder?: number;
  // Standard fields
  category: string;
  subcategory?: string;
  uploadedAt: any;
  size: number;
  type: string;
}

export default function Studio() {
  const [images, setImages] = useState<StudioImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudioImages();
  }, []);

  const loadStudioImages = async () => {
    try {
      setLoading(true);
      
      // Check if Firebase is available
      if (!db) {
        console.log('Firebase not initialized, skipping image load');
        setLoading(false);
        return;
      }
      
      const q = query(
        collection(db, 'images'),
        where('category', '==', 'about'),
        where('subcategory', '==', 'studio-shots')
      );
      
      const querySnapshot = await getDocs(q);
      const imageList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudioImage[];

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

      setImages(imageList);
    } catch (error) {
      console.error('Error loading studio images:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black/20 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-black text-lg">Loading studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/20 backdrop-blur-sm">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="text-black hover:text-black/80 transition-colors text-lg font-semibold"
            >
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-black">Studio</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Studio Content */}
      <div className="container mx-auto px-8 py-12">
        {images.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🏠</div>
            <h2 className="text-3xl font-bold text-black mb-4">No Studio Images Yet</h2>
            <p className="text-xl text-black/80 mb-8">
              No studio images have been uploaded yet.
            </p>
            <p className="text-lg text-black/60">
              Studio images uploaded through the admin panel will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Studio Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-black mb-4">
                Creative Workspace
              </h2>
              <p className="text-xl text-black/80 mb-6">
                {images.length} image{images.length !== 1 ? 's' : ''} showcasing the creative environment
              </p>
              <p className="text-lg text-black/70 max-w-3xl mx-auto">
                Step inside the studio where creativity comes to life. Explore the workspace, 
                tools, and environment that inspire and enable artistic creation.
              </p>
            </div>

            {/* Studio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {images.map((image) => (
                <div key={image.id} className="group cursor-pointer">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    {/* Studio Image */}
                    <div className="w-full h-64 overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.originalName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Image Details */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-black mb-3 truncate" title={image.customName || image.originalName}>
                        {image.customName || image.originalName}
                      </h3>
                      
                      {/* Description */}
                      {image.description && (
                        <p className="text-black/80 text-sm leading-relaxed">
                          {image.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16 py-12 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <h3 className="text-3xl font-bold text-black mb-4">Visit the Studio</h3>
              <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
                Interested in seeing the creative process in person? Studio visits can be arranged 
                for collectors, fellow artists, and art enthusiasts.
              </p>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-black px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 border border-white/30 hover:border-white/50">
                Schedule a Studio Visit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
