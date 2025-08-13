'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import DynamicImage from "../components/DynamicImage";

interface FeaturedImage {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  // Custom metadata fields
  customName?: string;
  price?: string;
  description?: string;
  // Standard fields
  category: string;
  subcategory?: string;
  uploadedAt: any;
  size: number;
  type: string;
}

export default function FeaturedWork() {
  const [images, setImages] = useState<FeaturedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');

  useEffect(() => {
    loadFeaturedImages();
  }, []);

  const loadFeaturedImages = async () => {
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
        where('category', '==', 'featured')
      );
      
      const querySnapshot = await getDocs(q);
      const imageList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeaturedImage[];

      // Sort by upload date (newest first)
      imageList.sort((a, b) => {
        const dateA = a.uploadedAt?.toDate?.() || new Date(a.uploadedAt) || new Date(0);
        const dateB = b.uploadedAt?.toDate?.() || new Date(b.uploadedAt) || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setImages(imageList);
    } catch (error) {
      console.error('Error loading featured images:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSubcategoryImages = (subcategory: string) => {
    if (subcategory === 'all') return images;
    return images.filter(img => img.subcategory === subcategory);
  };

  const subcategories = [
    { key: 'all', label: 'All Featured Work', description: 'Complete collection of featured artwork' },
    { key: 'hero-images', label: 'Hero Images', description: 'Main landing page artwork' },
    { key: 'showcase-pieces', label: 'Showcase Pieces', description: 'Highlighted individual works' },
    { key: 'featured-collections', label: 'Featured Collections', description: 'Curated series and themes' },
    { key: 'spotlight-works', label: 'Spotlight Works', description: 'Special attention pieces' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black/20 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-black text-lg">Loading featured work...</p>
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
            <h1 className="text-4xl font-bold text-black">Featured Work</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Featured Work Content */}
      <div className="container mx-auto px-8 py-12">
        {images.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🎨</div>
            <h2 className="text-3xl font-bold text-black mb-4">No Featured Work Yet</h2>
            <p className="text-xl text-black/80 mb-8">
              No featured artwork has been uploaded yet.
            </p>
            <p className="text-lg text-black/60">
              Featured work uploaded through the admin panel will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Work Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-black mb-4">
                Featured Artwork Collection
              </h2>
              <p className="text-xl text-black/80">
                {images.length} piece{images.length !== 1 ? 's' : ''} of featured artwork
              </p>
            </div>

            {/* Subcategory Filter */}
            <div className="mb-12">
              <div className="flex flex-wrap gap-4 justify-center">
                {subcategories.map((sub) => (
                  <button
                    key={sub.key}
                    onClick={() => setActiveSubcategory(sub.key)}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeSubcategory === sub.key
                        ? 'bg-white/30 text-black border border-white/50'
                        : 'bg-white/10 text-black/80 border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Work Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {getSubcategoryImages(activeSubcategory).map((image) => (
                <div key={image.id} className="group cursor-pointer">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    {/* Artwork Image */}
                    <div className="w-full h-64 overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.originalName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Artwork Details */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-black mb-3 truncate" title={image.customName || image.originalName}>
                        {image.customName || image.originalName}
                      </h3>
                      
                      {/* Price */}
                      {image.price && (
                        <div className="text-lg font-bold text-green-700 mb-3">
                          {image.price.startsWith('$') ? image.price : `$${image.price}`}
                        </div>
                      )}
                      
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
          </>
        )}
      </div>
    </div>
  );
}
