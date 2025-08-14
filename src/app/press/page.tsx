'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

interface PressImage {
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

export default function Press() {
  const [images, setImages] = useState<PressImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPressImages();
  }, []);

  const loadPressImages = async () => {
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
        where('subcategory', '==', 'press-coverage')
      );
      
      const querySnapshot = await getDocs(q);
      const imageList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PressImage[];

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
      console.error('Error loading press images:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black/20 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-black text-lg">Loading press coverage...</p>
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
            <h1 className="text-4xl font-bold text-black">Press</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Press Content */}
      <div className="container mx-auto px-8 py-12">
        {images.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📰</div>
            <h2 className="text-3xl font-bold text-black mb-4">No Press Coverage Yet</h2>
            <p className="text-xl text-black/80 mb-8">
              No press materials have been uploaded yet.
            </p>
            <p className="text-lg text-black/60">
              Press coverage, articles, and interviews uploaded through the admin panel will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Press Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-black mb-4">
                Press Coverage & Media
              </h2>
              <p className="text-xl text-black/80 mb-6">
                {images.length} press item{images.length !== 1 ? 's' : ''} featuring coverage and interviews
              </p>
              <p className="text-lg text-black/70 max-w-3xl mx-auto">
                Discover media coverage, interviews, articles, and press releases that showcase 
                the artistic journey, exhibitions, and recognition in the art world.
              </p>
            </div>

            {/* Featured Press Item */}
            {images.length > 0 && (
              <div className="mb-16">
                <h3 className="text-2xl font-bold text-black mb-8 text-center">Featured Coverage</h3>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300 max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    <div className="h-64 lg:h-auto overflow-hidden">
                      <img
                        src={images[0].url}
                        alt={images[0].originalName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-8">
                      <h4 className="text-2xl font-bold text-black mb-4">
                        {images[0].customName || images[0].originalName}
                      </h4>
                      {images[0].description && (
                        <p className="text-black/80 text-lg leading-relaxed mb-4">
                          {images[0].description}
                        </p>
                      )}
                      <div className="text-sm text-black/60">
                        {formatDate(images[0].uploadedAt)}
                      </div>
                      <div className="mt-4">
                        <span className="inline-block bg-purple-100/80 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                          Featured Press
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Press Items Grid */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-black mb-8 text-center">All Press Coverage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {images.map((image) => (
                  <div key={image.id} className="group cursor-pointer">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                      {/* Press Image */}
                      <div className="w-full h-48 overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.originalName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      
                      {/* Press Details */}
                      <div className="p-6">
                        <h4 className="text-lg font-semibold text-black mb-3 truncate" title={image.customName || image.originalName}>
                          {image.customName || image.originalName}
                        </h4>
                        
                        {/* Description */}
                        {image.description && (
                          <p className="text-black/80 text-sm leading-relaxed mb-3 line-clamp-3">
                            {image.description}
                          </p>
                        )}
                        
                        {/* Date */}
                        <div className="text-xs text-black/60 mb-3">
                          {formatDate(image.uploadedAt)}
                        </div>
                        
                        {/* Press Type Badge */}
                        <div>
                          <span className="inline-block bg-purple-100/80 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                            Press Coverage
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Press Categories */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center py-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="text-2xl mb-3">📄</div>
                <h4 className="text-lg font-semibold text-black mb-2">Articles</h4>
                <p className="text-black/70 text-sm">News articles and features</p>
              </div>
              <div className="text-center py-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="text-2xl mb-3">🎤</div>
                <h4 className="text-lg font-semibold text-black mb-2">Interviews</h4>
                <p className="text-black/70 text-sm">Artist interviews and profiles</p>
              </div>
              <div className="text-center py-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="text-2xl mb-3">🏆</div>
                <h4 className="text-lg font-semibold text-black mb-2">Awards</h4>
                <p className="text-black/70 text-sm">Recognition and accolades</p>
              </div>
              <div className="text-center py-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="text-2xl mb-3">📺</div>
                <h4 className="text-lg font-semibold text-black mb-2">Media</h4>
                <p className="text-black/70 text-sm">TV, radio, and digital coverage</p>
              </div>
            </div>

            {/* Contact for Press */}
            <div className="text-center mt-16 py-12 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <h3 className="text-3xl font-bold text-black mb-4">Press Inquiries</h3>
              <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
                For interviews, press releases, or media requests, please reach out 
                through the contact information below.
              </p>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-black px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 border border-white/30 hover:border-white/50">
                Contact for Press
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
