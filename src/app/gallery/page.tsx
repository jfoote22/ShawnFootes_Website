'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

interface GalleryImage {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  category: string;
  uploadedAt: any;
  size: number;
  type: string;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadGalleryImages();
  }, []);

  const loadGalleryImages = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'images'),
        where('category', '==', 'gallery')
      );
      
      const querySnapshot = await getDocs(q);
      const imageList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryImage[];

      // Sort by upload date (newest first)
      imageList.sort((a, b) => {
        const dateA = a.uploadedAt?.toDate?.() || new Date(a.uploadedAt) || new Date(0);
        const dateB = b.uploadedAt?.toDate?.() || new Date(b.uploadedAt) || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setImages(imageList);
    } catch (error) {
      console.error('Error loading gallery images:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black/20 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-black text-lg">Loading gallery...</p>
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
            <h1 className="text-4xl font-bold text-black">Gallery</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="container mx-auto px-8 py-12">
        {images.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📷</div>
            <h2 className="text-3xl font-bold text-black mb-4">Gallery is Empty</h2>
            <p className="text-xl text-black/80 mb-8">
              No images have been uploaded to the gallery yet.
            </p>
            <p className="text-lg text-black/60">
              Images uploaded through the admin panel will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Gallery Stats */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4">
                Artwork Gallery
              </h2>
              <p className="text-xl text-black/80">
                {images.length} piece{images.length !== 1 ? 's' : ''} of artwork
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {images.map((image) => (
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
                      <h3 className="text-xl font-semibold text-black mb-2 truncate" title={image.originalName}>
                        {image.originalName}
                      </h3>
                      <div className="space-y-2 text-sm text-black/80">
                        <p><span className="font-medium">Uploaded:</span> {formatDate(image.uploadedAt)}</p>
                        <p><span className="font-medium">Size:</span> {formatFileSize(image.size)}</p>
                        <p><span className="font-medium">Type:</span> {image.type}</p>
                      </div>
                      
                      {/* View Details Button */}
                      <button className="w-full mt-4 py-2 bg-white/20 hover:bg-white/30 text-black rounded-lg transition-all duration-300 border border-white/30">
                        View Details
                      </button>
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
