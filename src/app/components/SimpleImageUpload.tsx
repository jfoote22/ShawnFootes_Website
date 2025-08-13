'use client';

import { useState, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase/firebase';

interface SimpleImageUploadProps {
  category: string;
  subcategory?: string;
  onUploadComplete: () => void;
}

interface FileMetadata {
  file: File;
  customName: string;
  price: string;
  description: string;
}

export default function SimpleImageUpload({ category, subcategory, onUploadComplete }: SimpleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileMetadata[]>([]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== fileArray.length) {
      alert('Some files were skipped - only image files are supported.');
    }
    
    const fileMetadata = imageFiles.map(file => ({
      file,
      customName: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension for default name
      price: '',
      description: ''
    }));
    
    setSelectedFiles(fileMetadata);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const updateFileMetadata = (index: number, field: keyof Omit<FileMetadata, 'file'>, value: string) => {
    setSelectedFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress([]);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const fileMetadata = selectedFiles[i];
        const file = fileMetadata.file;
        setUploadProgress(prev => [...prev, `🚀 Starting upload: ${fileMetadata.customName || file.name}`]);

        // Create unique filename
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const path = subcategory ? `${category}/${subcategory}/${fileName}` : `${category}/${fileName}`;

        setUploadProgress(prev => [...prev, `📤 Uploading to: ${path}`]);

        // Upload to Firebase Storage
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        
        setUploadProgress(prev => [...prev, `✅ Uploaded: ${file.name}`]);

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        setUploadProgress(prev => [...prev, `🔗 Got URL: ${downloadURL.substring(0, 50)}...`]);

        // Save metadata to Firestore with custom fields
        const imageData = {
          url: downloadURL,
          filename: fileName,
          originalName: file.name,
          // Custom metadata fields
          customName: fileMetadata.customName || file.name.replace(/\.[^/.]+$/, ""),
          price: fileMetadata.price || null,
          description: fileMetadata.description || null,
          sortOrder: Date.now(), // Use timestamp for initial sort order
          // Standard fields
          category,
          subcategory: subcategory || null,
          uploadedAt: new Date(),
          size: file.size,
          type: file.type
        };

        const docRef = await addDoc(collection(db, 'images'), imageData);
        setUploadProgress(prev => [...prev, `💾 Saved metadata: ${docRef.id}`]);
      }

      setUploadProgress(prev => [...prev, `🎉 All uploads complete!`]);
      onUploadComplete();
      
      // Clear everything
      setSelectedFiles([]);
      setUploadProgress([]);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(prev => [...prev, `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setUploadProgress([]);
  };

  return (
    <div className="space-y-4">
      {/* File Input Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-3">
          <div className="text-4xl">📁</div>
          <div className="text-lg font-medium text-gray-700">
            {dragActive ? 'Drop images here' : 'Drag & drop images here'}
          </div>
          <div className="text-sm text-gray-500">
            or click to browse files
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg cursor-pointer transition-colors"
          >
            📂 Choose Files
          </label>
        </div>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-700">
              Selected Files ({selectedFiles.length})
            </h4>
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedFiles.map((fileMetadata, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border">
                {/* File Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">
                      📷
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {fileMetadata.file.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(fileMetadata.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove file"
                  >
                    ×
                  </button>
                </div>

                {/* Metadata Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={fileMetadata.customName}
                      onChange={(e) => updateFileMetadata(index, 'customName', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter display name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Price {category === 'store' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={fileMetadata.price}
                      onChange={(e) => updateFileMetadata(index, 'price', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder={category === 'store' ? "$0.00" : "Optional price"}
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={fileMetadata.description}
                      onChange={(e) => updateFileMetadata(index, 'description', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Brief description"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <span>🚀</span>
              <span>Upload {selectedFiles.length} Image{selectedFiles.length !== 1 ? 's' : ''}</span>
            </>
          )}
        </button>
      )}

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Upload Progress:</h4>
          <div className="space-y-2">
            {uploadProgress.map((message, index) => (
              <div key={index} className="text-xs text-gray-600 font-mono bg-white p-2 rounded border">
                {message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
