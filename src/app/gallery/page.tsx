'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import ImageModal from "../components/ImageModal";

interface GalleryImage {
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

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    loadGalleryImages();
  }, []);

  const loadGalleryImages = async () => {
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

  const getFilteredImages = () => {
    if (activeFilter === 'all') return images;
    return images.filter(img => img.subcategory === activeFilter);
  };

  const openImageModal = (imageIndex: number) => {
    setSelectedImageIndex(imageIndex);
    setModalOpen(true);
  };

  const closeImageModal = () => {
    setModalOpen(false);
  };

  const navigateToImage = (index: number) => {
    setSelectedImageIndex(index);
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
                {getFilteredImages().length} piece{getFilteredImages().length !== 1 ? 's' : ''} of artwork
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {getFilteredImages().map((image, index) => (
                <div 
                  key={image.id} 
                  className="group cursor-pointer"
                  onClick={() => openImageModal(index)}
                >
                  <div className="glass-effect rounded-2xl overflow-hidden hover:scale-105 transition-all duration-500 image-card animate-fadeInUp">
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

      {/* Image Modal */}
      <ImageModal
        isOpen={modalOpen}
        onClose={closeImageModal}
        images={getFilteredImages()}
        currentImageIndex={selectedImageIndex}
        onNavigate={navigateToImage}
      />
    </div>
  );
}
