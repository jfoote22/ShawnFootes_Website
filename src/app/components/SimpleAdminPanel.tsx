'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '@/lib/contexts/AuthContext';
import { collection, getDocs, deleteDoc, doc, query, where, orderBy, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/firebase';
import SimpleImageUpload from './SimpleImageUpload';
import GuestBookListModal from './GuestBookListModal';
import OrphanedImageFinder from './OrphanedImageFinder';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImageData {
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

type TabType = 'featured' | 'gallery' | 'store' | 'collaborations' | 'about' | 'website-settings';
type StoreSubcategory = 'original-works' | 'prints' | 'apparel' | 'commissions' | 'nfts';
type FeaturedSubcategory = 'hero-images' | 'showcase-pieces' | 'featured-collections' | 'spotlight-works';
type CollaborationsSubcategory = 'partnerships' | 'joint-projects' | 'gallery-collaborations' | 'artist-networks';
type AboutSubcategory = 'studio-shots' | 'artist-portraits' | 'work-in-progress' | 'behind-scenes' | 'press-coverage';

export default function SimpleAdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { isAdmin } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<TabType>('featured');
  const [storeSubcategory, setStoreSubcategory] = useState<StoreSubcategory>('original-works');
  const [featuredSubcategory, setFeaturedSubcategory] = useState<FeaturedSubcategory>('hero-images');
  const [collaborationsSubcategory, setCollaborationsSubcategory] = useState<CollaborationsSubcategory>('partnerships');
  const [aboutSubcategory, setAboutSubcategory] = useState<AboutSubcategory>('studio-shots');
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [websiteBackground, setWebsiteBackground] = useState<string | null>(null);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [guestBookListOpen, setGuestBookListOpen] = useState(false);
  const [guestBookStats, setGuestBookStats] = useState({ totalVisitors: 0, recentVisitors: 0 });
  const [orphanedImageFinderOpen, setOrphanedImageFinderOpen] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ customName: '', price: '', description: '' });
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  
  // Featured text editing state
  const [featuredText, setFeaturedText] = useState({ title: 'About This Piece', content: '' });
  const [editingFeaturedText, setEditingFeaturedText] = useState(false);
  const [featuredTextLoading, setFeaturedTextLoading] = useState(false);

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'images'), 
        where('category', '==', activeTab)
      );
      
      const querySnapshot = await getDocs(q);
      let imageList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ImageData[];

      // Filter by subcategory if it's the store or featured tab
      if (activeTab === 'store' && storeSubcategory) {
        imageList = imageList.filter(img => img.subcategory === storeSubcategory);
      } else if (activeTab === 'featured' && featuredSubcategory) {
        imageList = imageList.filter(img => img.subcategory === featuredSubcategory);
      } else if (activeTab === 'collaborations' && collaborationsSubcategory) {
        imageList = imageList.filter(img => img.subcategory === collaborationsSubcategory);
      } else if (activeTab === 'about' && aboutSubcategory) {
        imageList = imageList.filter(img => img.subcategory === aboutSubcategory);
      }

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
      console.error('Error loading images:', error);
      alert('Error loading images. Check console for details.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, storeSubcategory, featuredSubcategory, collaborationsSubcategory, aboutSubcategory]);

  // Load images when tab changes
  useEffect(() => {
    if (isOpen && isAdmin) {
      loadImages();
      if (activeTab === 'website-settings') {
        loadWebsiteBackground();
        loadGuestBookStats();
      }
      if (activeTab === 'featured') {
        loadFeaturedText();
      }
    }
  }, [activeTab, storeSubcategory, featuredSubcategory, collaborationsSubcategory, aboutSubcategory, isOpen, isAdmin, loadImages]);

  const loadWebsiteBackground = () => {
    const currentBackground = localStorage.getItem('websiteBackgroundImage');
    setWebsiteBackground(currentBackground);
  };

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBackgroundLoading(true);
    try {
      // Convert file to data URL for localStorage
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataURL = e.target?.result as string;
        localStorage.setItem('websiteBackgroundImage', dataURL);
        setWebsiteBackground(dataURL);
        setBackgroundLoading(false);
        alert('Background image updated successfully! Refresh the page to see changes.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading background image:', error);
      alert('Error uploading background image. Please try again.');
      setBackgroundLoading(false);
    }
  };

  const removeBackgroundImage = () => {
    localStorage.removeItem('websiteBackgroundImage');
    setWebsiteBackground(null);
    alert('Background image removed! Refresh the page to see changes.');
  };

  const loadGuestBookStats = async () => {
    try {
      // Load from localStorage for now (transitioning to Firestore)
      const savedEntries = localStorage.getItem('guestBookEntries');
      if (savedEntries) {
        const entries = JSON.parse(savedEntries);
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const recentVisitors = entries.filter((entry: any) => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= oneWeekAgo;
        }).length;
        
        setGuestBookStats({
          totalVisitors: entries.length,
          recentVisitors: recentVisitors,
        });
      } else {
        setGuestBookStats({
          totalVisitors: 0,
          recentVisitors: 0,
        });
      }
    } catch (error) {
      console.error('Error loading guest book stats:', error);
      setGuestBookStats({
        totalVisitors: 0,
        recentVisitors: 0,
      });
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, onClose]);

  const handleEditImage = (image: ImageData) => {
    setEditingImageId(image.id);
    setEditFormData({
      customName: image.customName || image.originalName.replace(/\.[^/.]+$/, ""),
      price: image.price || '',
      description: image.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingImageId(null);
    setEditFormData({ customName: '', price: '', description: '' });
  };

  const handleUpdateImage = async (imageId: string) => {
    setUpdateLoading(imageId);
    try {
      const updateData: Partial<ImageData> = {
        customName: editFormData.customName.trim() || undefined,
        price: editFormData.price.trim() || undefined,
        description: editFormData.description.trim() || undefined
      };

      await updateDoc(doc(db, 'images', imageId), updateData);
      
      // Update local state
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, ...updateData } : img
      ));

      setEditingImageId(null);
      setEditFormData({ customName: '', price: '', description: '' });
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Error updating image. Check console for details.');
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleDeleteImage = async (image: ImageData) => {
    if (!confirm(`Are you sure you want to delete "${image.customName || image.originalName}"?\n\nThis action cannot be undone.`)) return;

    setDeleteLoading(image.id);
    try {
      // Delete from Storage
      const storageRef = ref(storage, image.url);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'images', image.id));

      // Reload images
      loadImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image. Check console for details.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleMoveImageUp = async (imageIndex: number) => {
    if (imageIndex === 0) return; // Already at the top
    
    const currentImage = images[imageIndex];
    const previousImage = images[imageIndex - 1];
    
    try {
      // Assign sortOrder if not present
      const currentOrder = currentImage.sortOrder ?? imageIndex;
      const previousOrder = previousImage.sortOrder ?? (imageIndex - 1);
      
      // Swap the orders
      await updateDoc(doc(db, 'images', currentImage.id), { sortOrder: previousOrder });
      await updateDoc(doc(db, 'images', previousImage.id), { sortOrder: currentOrder });
      
      // Reload images to reflect new order
      loadImages();
    } catch (error) {
      console.error('Error moving image up:', error);
      alert('Error reordering image. Check console for details.');
    }
  };

  const handleMoveImageDown = async (imageIndex: number) => {
    if (imageIndex === images.length - 1) return; // Already at the bottom
    
    const currentImage = images[imageIndex];
    const nextImage = images[imageIndex + 1];
    
    try {
      // Assign sortOrder if not present
      const currentOrder = currentImage.sortOrder ?? imageIndex;
      const nextOrder = nextImage.sortOrder ?? (imageIndex + 1);
      
      // Swap the orders
      await updateDoc(doc(db, 'images', currentImage.id), { sortOrder: nextOrder });
      await updateDoc(doc(db, 'images', nextImage.id), { sortOrder: currentOrder });
      
      // Reload images to reflect new order
      loadImages();
    } catch (error) {
      console.error('Error moving image down:', error);
      alert('Error reordering image. Check console for details.');
    }
  };

  const loadFeaturedText = async () => {
    try {
      if (!db) return;
      
      const textDoc = await getDoc(doc(db, 'website-settings', 'featured-text'));
      if (textDoc.exists()) {
        const data = textDoc.data();
        setFeaturedText({
          title: data.title || 'About This Piece',
          content: data.content || `"Art is Alchemy" represents the transformative power of artistic creation. This mixed media piece combines traditional techniques with modern experimentation, embodying the philosophy that art has the ability to transmute ordinary materials into something extraordinary.`
        });
      }
    } catch (error) {
      console.error('Error loading featured text:', error);
    }
  };

  const saveFeaturedText = async () => {
    try {
      setFeaturedTextLoading(true);
      if (!db) return;
      
      await setDoc(doc(db, 'website-settings', 'featured-text'), {
        title: featuredText.title,
        content: featuredText.content,
        updatedAt: new Date()
      });
      
      setEditingFeaturedText(false);
      alert('Featured text updated successfully!');
    } catch (error) {
      console.error('Error saving featured text:', error);
      alert('Error saving featured text. Check console for details.');
    } finally {
      setFeaturedTextLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!isOpen || !isAdmin) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 pt-16"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white text-black rounded-2xl max-w-7xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Image Management Admin Panel</h2>
            <p className="text-gray-600 mt-1">Upload, organize, and manage your website images</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300"
            title="Close Admin Panel"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          {([
            { key: 'featured', label: 'Featured Work', description: 'Hero images, showcase pieces, and featured collections' },
            { key: 'gallery', label: 'Gallery Images', description: 'Portfolio and exhibition photos' },
            { key: 'store', label: 'Store Products', description: 'Product images for your store' },
            { key: 'collaborations', label: 'Collaborations', description: 'Partnerships, joint projects, and gallery collaborations' },
            { key: 'about', label: 'About the Artist', description: 'Studio shots, artist portraits, work in progress, and behind-the-scenes' },
            { key: 'website-settings', label: 'Website Settings', description: 'Manage website background image' }
          ] as const).map(({ key, label, description }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-8 py-4 text-left transition-all ${
                activeTab === key
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <div className="font-semibold text-lg">{label}</div>
              <div className="text-sm opacity-75">{description}</div>
            </button>
          ))}
        </div>

        {/* Featured Work Subcategory */}
        {activeTab === 'featured' && (
          <div className="p-4 border-b bg-gray-50">
            <label className="block text-sm font-medium mb-2">Featured Work Category:</label>
            <div className="flex gap-2 mb-3">
              {(['hero-images', 'showcase-pieces', 'featured-collections', 'spotlight-works'] as FeaturedSubcategory[]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setFeaturedSubcategory(sub)}
                  className={`px-3 py-1 rounded text-sm ${
                    featuredSubcategory === sub
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {sub.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Hero Images:</strong> Main landing page artwork • 
              <strong> Showcase Pieces:</strong> Highlighted individual works • 
              <strong> Featured Collections:</strong> Curated series and themes • 
              <strong> Spotlight Works:</strong> Special attention pieces
            </div>
            <div className="mt-3">
              {/* Hidden for now - can be restored later if needed */}
              {false && (
                <div>
                  <button
                    onClick={() => setOrphanedImageFinderOpen(true)}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    🔍 Find Orphaned Images
                  </button>
                  <span className="text-xs text-gray-500 ml-2">
                    Find images that don&apos;t appear in subcategory filters
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Featured Work Text Editor */}
        {activeTab === 'featured' && (
          <div className="p-4 border-b bg-gray-50">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-black mb-4">Featured Work Text</h3>
              <p className="text-black/80 text-sm mb-4">
                Edit the title and description text that appears next to the featured work on the homepage.
              </p>
              
              {editingFeaturedText ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Title:</label>
                    <input
                      type="text"
                      value={featuredText.title}
                      onChange={(e) => setFeaturedText({ ...featuredText, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Content:</label>
                    <textarea
                      value={featuredText.content}
                      onChange={(e) => setFeaturedText({ ...featuredText, content: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                      placeholder="Enter description..."
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={saveFeaturedText}
                      disabled={featuredTextLoading}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg text-sm transition-colors"
                    >
                      {featuredTextLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingFeaturedText(false);
                        loadFeaturedText(); // Reset to original values
                      }}
                      disabled={featuredTextLoading}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-black mb-2">{featuredText.title}</h5>
                    <p className="text-black/80 text-sm leading-relaxed">{featuredText.content}</p>
                  </div>
                  <button
                    onClick={() => setEditingFeaturedText(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                  >
                    Edit Text
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collaborations Subcategory */}
        {activeTab === 'collaborations' && (
          <div className="p-4 border-b bg-gray-50">
            <label className="block text-sm font-medium mb-2">Collaborations Category:</label>
            <div className="flex gap-2 mb-3">
              {(['partnerships', 'joint-projects', 'gallery-collaborations', 'artist-networks'] as CollaborationsSubcategory[]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setCollaborationsSubcategory(sub)}
                  className={`px-3 py-1 rounded text-sm ${
                    collaborationsSubcategory === sub
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {sub.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Partnerships:</strong> Business and creative partnerships • 
              <strong> Joint Projects:</strong> Collaborative artwork and exhibitions • 
              <strong> Gallery Collaborations:</strong> Work with galleries and institutions • 
              <strong> Artist Networks:</strong> Connections with other artists
            </div>
          </div>
        )}

        {/* About the Artist Subcategory */}
        {activeTab === 'about' && (
          <div className="p-4 border-b bg-gray-50">
            <label className="block text-sm font-medium mb-2">About the Artist Category:</label>
            <div className="flex gap-2 mb-3">
              {(['studio-shots', 'artist-portraits', 'work-in-progress', 'behind-scenes', 'press-coverage'] as AboutSubcategory[]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setAboutSubcategory(sub)}
                  className={`px-3 py-1 rounded text-sm ${
                    aboutSubcategory === sub
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {sub.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Studio Shots:</strong> Your workspace and creative environment • 
              <strong> Artist Portraits:</strong> Professional photos and self-portraits • 
              <strong> Work in Progress:</strong> Artwork during creation process • 
              <strong> Behind Scenes:</strong> Creative process and daily studio life • 
              <strong> Press Coverage:</strong> News articles, interviews, and press materials
            </div>
          </div>
        )}

        {/* Store Subcategory */}
        {activeTab === 'store' && (
          <div className="p-4 border-b bg-gray-50">
            <label className="block text-sm font-medium mb-2">Store Category:</label>
            <div className="flex gap-2 mb-3">
              {(['original-works', 'prints', 'apparel', 'commissions', 'nfts'] as StoreSubcategory[]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setStoreSubcategory(sub)}
                  className={`px-3 py-1 rounded text-sm ${
                    storeSubcategory === sub
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {sub.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Original Works:</strong> One-of-a-kind original pieces • 
              <strong> Prints:</strong> High-quality reproductions • 
              <strong> Apparel:</strong> Wearable art on clothing • 
              <strong> Commissions:</strong> Custom artwork created just for you • 
              <strong> NFTs:</strong> Digital collectibles and blockchain art
            </div>
          </div>
        )}

        {/* Website Settings Tab */}
        {activeTab === 'website-settings' && (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-black mb-4">Website Background Image</h3>
              <p className="text-black/80 text-sm mb-4">
                Upload a new background image for the entire website. This will replace the current background.
              </p>
              
              {/* Current Background Preview */}
              {websiteBackground && (
                <div className="mb-4">
                  <p className="text-sm text-black/80 mb-2">Current Background:</p>
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/20">
                    <img 
                      src={websiteBackground} 
                      alt="Current website background" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={removeBackgroundImage}
                    className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                  >
                    Remove Background
                  </button>
                </div>
              )}

              {/* Upload New Background */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                    id="background-upload"
                  />
                  <label
                    htmlFor="background-upload"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors text-sm"
                  >
                    {backgroundLoading ? 'Uploading...' : 'Choose Background Image'}
                  </label>
                  {backgroundLoading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  )}
                </div>
                
                <div className="text-xs text-black/60">
                  <p>• Recommended size: 1920x1080 or larger</p>
                  <p>• Supported formats: JPG, PNG, WebP</p>
                  <p>• File size: Under 5MB for best performance</p>
                </div>
              </div>
            </div>

            {/* Guest Book Management */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-black mb-4">Guest Book Management</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-black/80 text-sm mb-2">
                    Track visitor engagement and see who has signed your guest book.
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {guestBookStats.totalVisitors}
                      </div>
                      <div className="text-sm text-black/60">Total Visitors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {guestBookStats.recentVisitors}
                      </div>
                      <div className="text-sm text-black/60">This Week</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setGuestBookListOpen(true)}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  View All Signatures
                </button>
              </div>
            </div>


            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-black mb-3">Tips for Background Images</h4>
              <ul className="text-sm text-black/80 space-y-2">
                <li>• Choose images with good contrast so text remains readable</li>
                <li>• Dark or muted images work best with the current design</li>
                <li>• Consider how the image looks on different screen sizes</li>
                <li>• The image will be automatically scaled to fit all devices</li>
              </ul>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  📤 Upload New Images
                </h3>
                <p className="text-green-700 mb-4">
                  Add new images to your <strong>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</strong> section
                </p>
                
                <SimpleImageUpload
                  category={activeTab}
                  subcategory={
                    activeTab === 'store' ? storeSubcategory : 
                    activeTab === 'featured' ? featuredSubcategory : 
                    activeTab === 'collaborations' ? collaborationsSubcategory :
                    activeTab === 'about' ? aboutSubcategory :
                    undefined
                  }
                  onUploadComplete={loadImages}
                />
              </div>

              {/* Quick Stats */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">📊 Section Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{images.length}</div>
                    <div className="text-sm text-blue-700">Total Images</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatFileSize(images.reduce((acc, img) => acc + (img.size || 0), 0))}
                    </div>
                    <div className="text-sm text-blue-700">Total Size</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Images */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  🖼️ Current Images ({images.length})
                </h3>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading images...</span>
                  </div>
                ) : images.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📷</div>
                    <div className="text-xl font-medium text-gray-600 mb-2">No images yet</div>
                    <div className="text-gray-500">Upload your first image using the form on the left</div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {images.map((image, index) => (
                      <div key={image.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                        <div className="flex items-start space-x-4">
                          {/* Image Thumbnail */}
                          <div className="relative flex-shrink-0">
                            <img
                              src={image.url}
                              alt={image.originalName}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                            />
                            {(deleteLoading === image.id || updateLoading === image.id) && (
                              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                              </div>
                            )}
                          </div>

                          {/* Image Info / Edit Form */}
                          <div className="flex-1 min-w-0">
                            {editingImageId === image.id ? (
                              /* Edit Mode */
                              <div className="space-y-3">
                                <div className="text-xs text-gray-500 mb-2">
                                  Editing: {image.originalName}
                                </div>
                                
                                {/* Edit Form */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Display Name
                                    </label>
                                    <input
                                      type="text"
                                      value={editFormData.customName}
                                      onChange={(e) => setEditFormData(prev => ({ ...prev, customName: e.target.value }))}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      placeholder="Enter display name"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Price {activeTab === 'store' && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                      type="text"
                                      value={editFormData.price}
                                      onChange={(e) => setEditFormData(prev => ({ ...prev, price: e.target.value }))}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      placeholder={activeTab === 'store' ? "$0.00" : "Optional price"}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Description
                                    </label>
                                    <input
                                      type="text"
                                      value={editFormData.description}
                                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      placeholder="Brief description"
                                    />
                                  </div>
                                </div>

                                {/* Edit Actions */}
                                <div className="flex space-x-2 pt-2">
                                  <button
                                    onClick={() => handleUpdateImage(image.id)}
                                    disabled={updateLoading === image.id}
                                    className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                                  >
                                    {updateLoading === image.id ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                                        <span>Saving...</span>
                                      </>
                                    ) : (
                                      <>
                                        <span>💾</span>
                                        <span>Save</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    disabled={updateLoading === image.id}
                                    className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* View Mode */
                              <div className="flex items-start justify-between">
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-medium text-gray-900 truncate" title={image.customName || image.originalName}>
                                    {image.customName || image.originalName}
                                  </h4>
                                  {image.customName && (
                                    <div className="text-xs text-gray-400 truncate">
                                      Original: {image.originalName}
                                    </div>
                                  )}
                                  <div className="text-sm text-gray-500 mt-1 space-y-1">
                                    {image.price && (
                                      <div>💰 {image.price}</div>
                                    )}
                                    {image.description && (
                                      <div className="truncate" title={image.description}>📝 {image.description}</div>
                                    )}
                                    <div>📁 {image.filename}</div>
                                    <div>📅 {formatDate(image.uploadedAt)}</div>
                                    <div>💾 {formatFileSize(image.size)} • {image.type}</div>
                                  </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex-shrink-0 ml-4">
                                  <div className="flex space-x-2 mb-2">
                                    {/* Reorder Buttons */}
                                    <button
                                      onClick={() => handleMoveImageUp(index)}
                                      disabled={index === 0 || deleteLoading === image.id || editingImageId !== null}
                                      className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-2 py-1 rounded text-xs font-medium transition-colors flex items-center"
                                      title="Move up"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      onClick={() => handleMoveImageDown(index)}
                                      disabled={index === images.length - 1 || deleteLoading === image.id || editingImageId !== null}
                                      className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-2 py-1 rounded text-xs font-medium transition-colors flex items-center"
                                      title="Move down"
                                    >
                                      ↓
                                    </button>
                                  </div>
                                  <div className="space-y-1">
                                    <button
                                      onClick={() => handleEditImage(image)}
                                      disabled={deleteLoading === image.id || editingImageId !== null}
                                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                                      title="Edit this image"
                                    >
                                      <span>✏️</span>
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteImage(image)}
                                      disabled={deleteLoading === image.id || editingImageId !== null}
                                      className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                                      title="Delete this image"
                                    >
                                      {deleteLoading === image.id ? (
                                        <>
                                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
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
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Help Section */}
              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">💡 Tips & Help</h3>
                <ul className="text-sm text-yellow-700 space-y-2">
                  <li>• <strong>Featured Work:</strong> Use for hero images, main showcases, and featured pieces</li>
                  <li>• <strong>Gallery:</strong> Perfect for portfolio images, exhibition photos, and artwork collections</li>
                  <li>• <strong>Store:</strong> Ideal for product images, merchandise, and items for sale</li>
                  <li>• <strong>Edit Images:</strong> Click the &quot;✏️ Edit&quot; button to update name, price, and description</li>
                  <li>• <strong>Reorder Images:</strong> Use ↑ and ↓ arrows to change the display order of images</li>
                  <li>• <strong>Bulk Management:</strong> Only one image can be edited at a time for data safety</li>
                  <li>• Images are automatically organized by category and sorted by upload date</li>
                  <li>• Supported formats: JPG, PNG, GIF, WebP (max 10MB per file)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* Guest Book List Modal */}
        {guestBookListOpen && (
          <GuestBookListModal onClose={() => setGuestBookListOpen(false)} />
        )}
        
        {/* Orphaned Image Finder Modal */}
        {orphanedImageFinderOpen && (
          <OrphanedImageFinder onClose={() => setOrphanedImageFinderOpen(false)} />
        )}
      </div>
    </div>
  );
}
