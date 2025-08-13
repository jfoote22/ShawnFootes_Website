import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';

export interface ImageData {
  id: string;
  url: string;
  filename: string;
  // Custom metadata fields
  customName?: string;
  price?: string;
  description?: string;
  // Standard fields
  category: 'featured' | 'gallery' | 'store';
  subcategory?: string; // For store: 'prints', 'original-works', 'apparel', 'other'
  uploadedAt: any; // Can be Firestore Timestamp or Date
  originalName?: string;
  size?: number;
  type?: string;
}

// Upload image to Firebase Storage
export async function uploadImage(
  file: File, 
  category: string, 
  subcategory?: string
): Promise<ImageData> {
  console.log(`Starting upload: ${file.name} to ${category}${subcategory ? `/${subcategory}` : ''}`);
  
  // Check if Firebase is available
  if (!storage || !db) {
    throw new Error('Firebase not initialized - check your environment variables');
  }
  
  try {
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const path = subcategory ? `${category}/${subcategory}/${filename}` : `${category}/${filename}`;
    
    console.log(`Upload path: ${path}`);
    
    const storageRef = ref(storage, path);
    console.log('Uploading to Firebase Storage...');
    
    const snapshot = await uploadBytes(storageRef, file);
    console.log('File uploaded, getting download URL...');
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', downloadURL);
    
    // Save metadata to Firestore
    const imageData: Omit<ImageData, 'id'> = {
      url: downloadURL,
      filename,
      category: category as ImageData['category'],
      subcategory,
      uploadedAt: new Date()
    };
    
    console.log('Saving metadata to Firestore...', imageData);
    const docRef = await addDoc(collection(db, 'images'), imageData);
    console.log('Metadata saved with ID:', docRef.id);
    
    const result = {
      id: docRef.id,
      ...imageData
    };
    
    console.log('Upload completed successfully:', result);
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Get all images for a category
export async function getImagesByCategory(
  category: string, 
  subcategory?: string
): Promise<ImageData[]> {
  // Check if Firebase is available
  if (!db) {
    console.log('Firebase not initialized, returning empty array');
    return [];
  }
  
  const imagesCollection = collection(db, 'images');
  const snapshot = await getDocs(imagesCollection);
  
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as ImageData))
    .filter(img => {
      if (subcategory) {
        return img.category === category && img.subcategory === subcategory;
      }
      return img.category === category;
    })
    .sort((a, b) => {
      // Handle Firestore timestamps properly
      const dateA = a.uploadedAt?.toDate?.() || new Date(a.uploadedAt) || new Date(0);
      const dateB = b.uploadedAt?.toDate?.() || new Date(b.uploadedAt) || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
}

// Delete image
export async function deleteImage(imageData: ImageData): Promise<void> {
  // Delete from Storage
  const storageRef = ref(storage, imageData.url);
  await deleteObject(storageRef);
  
  // Delete from Firestore
  await deleteDoc(doc(db, 'images', imageData.id));
}

// Get random images
export function getRandomImages<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
