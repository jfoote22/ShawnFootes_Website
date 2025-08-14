'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

interface StoreImage {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  customName?: string;
  price?: string;
  description?: string;
  category: string;
  uploadedAt: any;
  size: number;
  type: string;
  subcategory?: string;
}

export default function NFTs() {
  const [images, setImages] = useState<StoreImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      
      if (!db) {
        console.log('Firebase not initialized, skipping image load');
        setLoading(false);
        return;
      }
      
      const q = query(
        collection(db, 'images'),
        where('category', '==', 'store'),
        where('subcategory', '==', 'nfts')
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
      console.error('Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black/20 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-black text-lg">Loading NFTs...</p>
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
              href="/store" 
              className="text-black hover:text-black/80 transition-colors text-lg font-semibold"
            >
              ← Back to Store
            </Link>
            <div className="flex items-center">
              <span className="text-4xl mr-4">💎</span>
              <h1 className="text-4xl font-bold text-black">NFTs</h1>
            </div>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-8 py-12">
        {images.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">💎</div>
            <h2 className="text-3xl font-bold text-black mb-4">No NFTs Available</h2>
            <p className="text-xl text-black/80 mb-8">
              No NFTs have been uploaded to this category yet.
            </p>
            <Link 
              href="/store"
              className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-black/80 transition-colors"
            >
              Browse All Categories
            </Link>
          </div>
        ) : (
          <>
            {/* Category Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-4">
                NFT Collection
              </h2>
              <p className="text-xl text-black/80 mb-4">
                Digital collectibles and blockchain art
              </p>
              <p className="text-lg text-black/60">
                {images.length} NFT{images.length !== 1 ? 's' : ''} available
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {images.map((image) => (
                <div key={image.id} className="group cursor-pointer">
                  <div className="glass-effect rounded-2xl overflow-hidden hover:scale-105 transition-all duration-500 image-card animate-fadeInUp">
                    {/* Product Image */}
                    <div className="w-full h-48 overflow-hidden relative">
                      <img
                        src={image.url}
                        alt={image.originalName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* NFT Badge */}
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        NFT
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="p-6">
                      <h4 className="text-xl font-semibold text-black mb-3 truncate" title={image.customName || image.originalName}>
                        {image.customName || image.originalName}
                      </h4>
                      
                      {/* Price Display */}
                      {image.price && (
                        <div className="text-2xl font-bold text-green-700 mb-3">
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

            {/* NFT Info */}
            <div className="text-center mt-20 bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
              <h3 className="text-3xl font-bold text-black mb-6">About Our NFTs</h3>
              <p className="text-lg text-black/80 max-w-3xl mx-auto mb-8">
                Our NFT collection represents the intersection of traditional art and cutting-edge blockchain technology. 
                Each digital artwork is minted as a unique token, providing verifiable ownership and authenticity on the blockchain.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-black/60">
                <span>✓ Blockchain Verified</span>
                <span>✓ Unique Digital Assets</span>
                <span>✓ Transferable Ownership</span>
                <span>✓ Collector&apos;s Items</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
