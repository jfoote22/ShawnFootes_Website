'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import DynamicImage from "../components/DynamicImage";

interface CollaborationImage {
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

export default function Collaborations() {
  const [images, setImages] = useState<CollaborationImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');

  useEffect(() => {
    loadCollaborationImages();
  }, []);

  const loadCollaborationImages = async () => {
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
        where('category', '==', 'collaborations')
      );
      
      const querySnapshot = await getDocs(q);
      const imageList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CollaborationImage[];

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
      console.error('Error loading collaboration images:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubcategoryImages = (subcategory: string) => {
    if (subcategory === 'all') return images;
    return images.filter(img => img.subcategory === subcategory);
  };

  const subcategories = [
    { key: 'all', label: 'All Collaborations', description: 'Complete collection of collaborative work' },
    { key: 'partnerships', label: 'Partnerships', description: 'Business and creative partnerships' },
    { key: 'joint-projects', label: 'Joint Projects', description: 'Collaborative artwork and exhibitions' },
    { key: 'gallery-collaborations', label: 'Gallery Collaborations', description: 'Work with galleries and institutions' },
    { key: 'artist-networks', label: 'Artist Networks', description: 'Connections with other artists' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black/20 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-black text-lg">Loading collaborations...</p>
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
            <h1 className="text-4xl font-bold text-black">Collaborations</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Collaborations Content */}
      <div className="container mx-auto px-8 py-12">
        {images.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🤝</div>
            <h2 className="text-3xl font-bold text-black mb-4">No Collaborations Yet</h2>
            <p className="text-xl text-black/80 mb-8">
              No collaborative work has been uploaded yet.
            </p>
            <p className="text-lg text-black/60">
              Collaboration projects uploaded through the admin panel will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Collaborations Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-black mb-4">
                Collaborative Projects
              </h2>
              <p className="text-xl text-black/80 mb-6">
                {images.length} collaboration{images.length !== 1 ? 's' : ''} showcasing creative partnerships
              </p>
              <p className="text-lg text-black/70 max-w-3xl mx-auto">
                Explore the power of creative collaboration through these projects that bring together 
                diverse artistic visions, partnerships, and joint creative endeavors.
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

            {/* Collaborations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {getSubcategoryImages(activeSubcategory).map((image) => (
                <div key={image.id} className="group cursor-pointer">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    {/* Collaboration Image */}
                    <div className="w-full h-64 overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.originalName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Collaboration Details */}
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
                      
                      {/* Collaboration Type Badge */}
                      {image.subcategory && (
                        <div className="mt-3">
                          <span className="inline-block bg-emerald-100/80 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium">
                            {image.subcategory.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16 py-12 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <h3 className="text-3xl font-bold text-black mb-4">Interested in Collaborating?</h3>
              <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
                I&apos;m always excited to work with other creatives, galleries, and organizations 
                to bring unique visions to life.
              </p>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-black px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 border border-white/30 hover:border-white/50">
                Start a Conversation
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
