'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import DynamicImage from "../components/DynamicImage";

interface StoreImage {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  category: string;
  uploadedAt: any;
  size: number;
  type: string;
  subcategory?: string; // Added subcategory for better categorization
}

export default function Store() {
  const [images, setImages] = useState<StoreImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    loadStoreImages();
  }, []);

  const loadStoreImages = async () => {
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
        where('category', '==', 'store')
      );
      
      const querySnapshot = await getDocs(q);
      const imageList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StoreImage[];

      // Sort by upload date (newest first)
      imageList.sort((a, b) => {
        const dateA = a.uploadedAt?.toDate?.() || new Date(a.uploadedAt) || new Date(0);
        const dateB = b.uploadedAt?.toDate?.() || new Date(b.uploadedAt) || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setImages(imageList);
    } catch (error) {
      console.error('Error loading store images:', error);
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
          <p className="text-black text-lg">Loading store...</p>
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
            <h1 className="text-4xl font-bold text-black">Store</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Store Content */}
      <div className="container mx-auto px-8 py-12">
        {images.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🛍️</div>
            <h2 className="text-3xl font-bold text-black mb-4">Store is Empty</h2>
            <p className="text-xl text-black/80 mb-8">
              No products have been uploaded to the store yet.
            </p>
            <p className="text-lg text-black/60">
              Products uploaded through the admin panel will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Store Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-black mb-4">
                Art Store
              </h2>
              <p className="text-xl text-black/80">
                {images.length} product{images.length !== 1 ? 's' : ''} available
              </p>
            </div>

            {/* All Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {images.map((image) => (
                <div key={image.id} className="group cursor-pointer">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    {/* Product Image */}
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.originalName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-black mb-2 truncate" title={image.originalName}>
                        {image.originalName}
                      </h3>
                      <div className="space-y-2 text-sm text-black/80">
                        <p><span className="font-medium">Category:</span> {image.subcategory ? image.subcategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Store'}</p>
                        <p><span className="font-medium">Uploaded:</span> {formatDate(image.uploadedAt)}</p>
                        <p><span className="font-medium">Size:</span> {formatFileSize(image.size)}</p>
                      </div>
                      
                      {/* Add to Cart Button */}
                      <button className="w-full mt-4 py-3 bg-white/20 hover:bg-white/30 text-black rounded-lg transition-all duration-300 border border-white/30 font-semibold">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Store Info */}
            <div className="text-center mt-20 bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
              <h3 className="text-3xl font-bold text-black mb-6">About Our Store</h3>
              <p className="text-lg text-black/80 max-w-3xl mx-auto mb-8">
                Each product in our store is carefully crafted to bring the beauty of original artwork into your daily life. 
                From fine art prints to wearable art, we offer multiple ways to experience and own pieces of artistic expression.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-black/60">
                <span>✓ Free Shipping on Orders Over $100</span>
                <span>✓ 30-Day Return Policy</span>
                <span>✓ Handcrafted Quality</span>
                <span>✓ Limited Edition Items</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
