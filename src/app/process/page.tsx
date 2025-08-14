'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

interface ProcessImage {
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

export default function Process() {
  const [images, setImages] = useState<ProcessImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProcessImages();
  }, []);

  const loadProcessImages = async () => {
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
        where('subcategory', '==', 'work-in-progress')
      );
      
      const querySnapshot = await getDocs(q);
      const imageList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProcessImage[];

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
      console.error('Error loading process images:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black/20 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-black text-lg">Loading process...</p>
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
            <h1 className="text-4xl font-bold text-black">Process</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Process Content */}
      <div className="container mx-auto px-8 py-12">
        {images.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🎨</div>
            <h2 className="text-3xl font-bold text-black mb-4">No Process Images Yet</h2>
            <p className="text-xl text-black/80 mb-8">
              No process images have been uploaded yet.
            </p>
            <p className="text-lg text-black/60">
              Work-in-progress images uploaded through the admin panel will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Process Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-black mb-4">
                Behind the Creation
              </h2>
              <p className="text-xl text-black/80 mb-6">
                {images.length} image{images.length !== 1 ? 's' : ''} documenting the artistic process
              </p>
              <p className="text-lg text-black/70 max-w-3xl mx-auto">
                Witness the journey from concept to completion. These images capture the evolution 
                of artwork, revealing the techniques, decisions, and transformations that occur 
                during the creative process.
              </p>
            </div>

            {/* Process Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {images.map((image) => (
                <div key={image.id} className="group cursor-pointer">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    {/* Process Image */}
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
                      
                      {/* Process Stage Badge */}
                      <div className="mt-3">
                        <span className="inline-block bg-cyan-100/80 text-cyan-800 px-3 py-1 rounded-full text-xs font-medium">
                          Work in Progress
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Process Information */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center py-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="text-3xl mb-4">💡</div>
                <h3 className="text-xl font-bold text-black mb-2">Ideation</h3>
                <p className="text-black/70">From initial concept to detailed planning</p>
              </div>
              <div className="text-center py-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="text-3xl mb-4">🖌️</div>
                <h3 className="text-xl font-bold text-black mb-2">Creation</h3>
                <p className="text-black/70">Layer by layer, bringing ideas to life</p>
              </div>
              <div className="text-center py-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="text-3xl mb-4">✨</div>
                <h3 className="text-xl font-bold text-black mb-2">Refinement</h3>
                <p className="text-black/70">Fine-tuning until the vision is complete</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
