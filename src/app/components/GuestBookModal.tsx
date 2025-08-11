'use client';
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

interface GuestBookModalProps {
  onClose: () => void;
}

interface GuestBookEntry {
  id: string;
  name: string;
  timestamp: Date;
  message?: string;
}

export default function GuestBookModal({ onClose }: GuestBookModalProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [entries, setEntries] = useState<GuestBookEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadGuestBookEntries();
  }, []);

  const loadGuestBookEntries = async () => {
    try {
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    
    try {
      // Create new entry in Firestore
      const newEntry = {
        name: name.trim(),
        timestamp: new Date(),
        message: message.trim() || undefined
      };

      await addDoc(collection(db, 'guestBook'), newEntry);
      
      // Reload entries to get the updated count
      await loadGuestBookEntries();
      
      setSubmitted(true);
      setLoading(false);
      
      // Reset form
      setName('');
      setMessage('');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting guest book entry:', error);
      alert('Error submitting your signature. Please try again.');
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-black mb-2">Guest Book</h2>
          <p className="text-black/70">
            {submitted 
              ? "Thank you for signing my guest book! 🎉" 
              : "Leave your mark and let me know you were here!"
            }
          </p>
        </div>

        {!submitted ? (
          /* Sign Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black/80 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg text-black placeholder-black/60 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-black/80 mb-2">
                Message (Optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a message, comment, or just say hello!"
                rows={3}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg text-black placeholder-black/60 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 rounded-lg font-semibold transition-colors duration-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing...' : 'Sign Guest Book'}
            </button>
          </form>
        ) : (
          /* Success Message */
          <div className="text-center">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-lg text-black/80 mb-4">
              Thanks for visiting, <strong>{entries[0]?.name}</strong>!
            </p>
            <p className="text-sm text-black/60">
              You're visitor #{entries.length} in my guest book.
            </p>
          </div>
        )}

        {/* Guest Book Stats */}
        {entries.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/30">
            <div className="text-center">
              <p className="text-sm text-black/60">
                <strong>{entries.length}</strong> visitor{entries.length !== 1 ? 's' : ''} have signed the guest book
              </p>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-black/60 hover:text-black transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
