'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

interface GuestBookListModalProps {
  onClose: () => void;
}

interface GuestBookEntry {
  id: string;
  name: string;
  timestamp: any;
  message?: string;
}

export default function GuestBookListModal({ onClose }: GuestBookListModalProps) {
  const [entries, setEntries] = useState<GuestBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    loadGuestBookEntries();
  }, []);

  const loadGuestBookEntries = async () => {
    try {
      setLoading(true);
      const guestBookRef = collection(db, 'guestBook');
      const q = query(guestBookRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const entriesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GuestBookEntry[];
      
      setEntries(entriesList);
    } catch (error) {
      console.error('Error loading guest book entries:', error);
      alert('Error loading guest book entries. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this signature?')) return;
    
    setDeleteLoading(entryId);
    try {
      await deleteDoc(doc(db, 'guestBook', entryId));
      setEntries(entries.filter(entry => entry.id !== entryId));
      alert('Signature deleted successfully!');
    } catch (error) {
      console.error('Error deleting signature:', error);
      alert('Error deleting signature. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm pt-8"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl border border-white/20 max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-black">Guest Book Entries</h2>
            <p className="text-black/70 mt-1">
              {entries.length} signature{entries.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-black/60 hover:text-black transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading signatures...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <div className="text-xl font-medium text-gray-600 mb-2">No signatures yet</div>
              <div className="text-gray-500">When visitors sign your guest book, they'll appear here</div>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900 text-lg">{entry.name}</h4>
                        <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                      {entry.message && (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          "{entry.message}"
                        </p>
                      )}
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      disabled={deleteLoading === entry.id}
                      className="ml-4 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                      title="Delete this signature"
                    >
                      {deleteLoading === entry.id ? (
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
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total Signatures:</span> {entries.length}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
