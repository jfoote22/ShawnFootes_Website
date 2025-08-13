'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/firebase';

interface OrphanedImageData {
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

interface OrphanedImageFinderProps {
  onClose: () => void;
}

export default function OrphanedImageFinder({ onClose }: OrphanedImageFinderProps) {
  const [orphanedImages, setOrphanedImages] = useState<OrphanedImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    loadOrphanedImages();
  }, []);

  const loadOrphanedImages = async () => {
    try {
      setLoading(true);
      
      // Get all featured images
      const q = query(
        collection(db, 'images'),
        where('category', '==', 'featured')
      );
      
      const querySnapshot = await getDocs(q);
      const allFeaturedImages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OrphanedImageData[];

      // Find images without a subcategory or with null/undefined subcategory
      const orphaned = allFeaturedImages.filter(img => 
        !img.subcategory || 
        img.subcategory === null || 
        img.subcategory === undefined ||
        img.subcategory === ''
      );

      // Also look for images that might have "profile" in the name
      const profileImages = allFeaturedImages.filter(img =>
        img.originalName?.toLowerCase().includes('profile') ||
        img.filename?.toLowerCase().includes('profile')
      );

      // Combine and deduplicate
      const combined = [...orphaned, ...profileImages];
      const unique = combined.filter((img, index, self) => 
        index === self.findIndex(i => i.id === img.id)
      );

      setOrphanedImages(unique);
    } catch (error) {
      console.error('Error loading orphaned images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (image: OrphanedImageData) => {
    if (!confirm(`Are you sure you want to delete "${image.originalName}"?\n\nThis action cannot be undone.`)) return;

    setDeleteLoading(image.id);
    try {
      // Delete from Storage
      const storageRef = ref(storage, image.url);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'images', image.id));

      // Remove from local state
      setOrphanedImages(prev => prev.filter(img => img.id !== image.id));
      
      alert('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image. Check console for details.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-red-50 to-orange-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Orphaned Featured Images</h2>
            <p className="text-gray-600 mt-1">Images without subcategories that won&apos;t appear in admin panel</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading orphaned images...</span>
            </div>
          ) : orphanedImages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <div className="text-xl font-medium text-gray-600 mb-2">No orphaned images found</div>
              <div className="text-gray-500">All featured images have proper subcategories</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">Found {orphanedImages.length} orphaned image(s)</h3>
                                  <p className="text-yellow-700 text-sm">
                    These images are in the featured category but don&apos;t have a subcategory, 
                    making them invisible in the admin panel&apos;s subcategory filters.
                  </p>
              </div>

              {orphanedImages.map((image) => (
                <div key={image.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start space-x-4">
                    {/* Image Thumbnail */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={image.url}
                        alt={image.originalName}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                      />
                      {deleteLoading === image.id && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>

                    {/* Image Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-lg" title={image.originalName}>
                        {image.originalName}
                      </h4>
                      <div className="text-sm text-gray-500 mt-2 space-y-1">
                        <div><strong>Filename:</strong> {image.filename}</div>
                        <div><strong>Category:</strong> {image.category}</div>
                        <div><strong>Subcategory:</strong> {image.subcategory || 'None (this is the problem!)'}</div>
                        <div><strong>Uploaded:</strong> {formatDate(image.uploadedAt)}</div>
                        <div><strong>Size:</strong> {formatFileSize(image.size)} • {image.type}</div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleDeleteImage(image)}
                        disabled={deleteLoading === image.id}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        {deleteLoading === image.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b border-white"></div>
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <span>🗑️</span>
                            <span>Delete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
