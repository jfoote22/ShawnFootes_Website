'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import BookImage from './BookImage';

export default function AnimatedBookBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [purchaseUrl, setPurchaseUrl] = useState<string>('');

  const loadPurchaseUrl = async () => {
    try {
      if (!db) return;
      
      const urlDoc = await getDoc(doc(db, 'website-settings', 'banner-purchase-url'));
      if (urlDoc.exists()) {
        const data = urlDoc.data();
        setPurchaseUrl(data.url || '');
      }
    } catch (error) {
      console.error('Error loading banner purchase URL:', error);
    }
  };

  const handlePurchase = () => {
    if (purchaseUrl) {
      window.open(purchaseUrl, '_blank', 'noopener,noreferrer');
    } else {
      console.log('No purchase URL configured');
    }
  };

  useEffect(() => {
    loadPurchaseUrl();
  }, []);

  useEffect(() => {
    const animationCycle = () => {
      // Start animation - slide down
      setIsAnimating(true);
      setTimeout(() => {
        setIsVisible(true);
      }, 50);

      // Hold for 20 seconds, then slide up
      setTimeout(() => {
        setIsVisible(false);
      }, 20000);

      // Complete animation cycle (wait for slide-up to finish)
      setTimeout(() => {
        setIsAnimating(false);
      }, 20700);
    };

    // Start first cycle after 5 seconds
    const initialTimer = setTimeout(animationCycle, 5000);

    // Repeat every 30 seconds (20 on + 10 off)
    const interval = setInterval(animationCycle, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Animated Banner - positioned under header */}
      <div
        className={`fixed top-16 left-0 right-0 z-[100] bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-2xl transform transition-all duration-700 ease-in-out overflow-hidden ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${isAnimating ? 'h-[360px] lg:h-[200px]' : 'h-0'}`}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 shimmer-overlay"></div>
        
        {/* Desktop Layout */}
        <div className="container mx-auto px-8 h-full hidden lg:flex items-center justify-between relative z-10">
          {/* Left Side - Large Book Image */}
          <div className="flex items-center space-x-8">
            <div className="relative">
              <BookImage
                category="collaborations"
                className="w-32 h-40 rounded-xl shadow-2xl border-4 border-white/50"
              />
            </div>
            
            {/* Title and Description */}
            <div className="max-w-2xl">
              <h3 className="text-5xl font-black text-black mb-4 drop-shadow-lg leading-tight">
                The Super Spectacular Book of Imagination!
              </h3>
              <p className="text-2xl font-bold text-black/90 leading-relaxed">
                Embark on your wildly fantastic adventure today!
              </p>
            </div>
          </div>

          {/* Right Side - Large Purchase Button */}
          <div className="flex items-center">
            <button 
              onClick={handlePurchase}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 rounded-2xl font-black text-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 border-4 border-white/30"
            >
              Purchase Now!
            </button>
          </div>
        </div>

        {/* Mobile Layout - Fully Clickable */}
        <div 
          className="container mx-auto px-4 h-full lg:hidden flex items-center justify-center relative z-10 cursor-pointer"
          onClick={handlePurchase}
        >
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <BookImage
                category="collaborations"
                className="w-24 h-32 rounded-lg shadow-xl border-2 border-white/50"
              />
            </div>
            <h3 className="text-2xl font-black text-black mb-2 drop-shadow-lg leading-tight">
              The Super Spectacular Book of Imagination!
            </h3>
            <p className="text-lg font-bold text-black/90 mb-4">
              Embark on your wildly fantastic adventure today!
            </p>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-black text-xl shadow-xl border-2 border-white/30 inline-block">
              Purchase Now!
            </div>
          </div>
        </div>
      </div>

      {/* Spacer div that pushes content down when banner is visible */}
      <div
        className={`transition-all duration-700 ease-in-out ${
          isVisible ? 'h-[360px] lg:h-[200px]' : 'h-0'
        }`}
      ></div>

      <style jsx>{`
        .shimmer-overlay {
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 0, 150, 0.1) 35%,
            rgba(0, 150, 255, 0.1) 40%,
            rgba(255, 100, 0, 0.1) 45%,
            rgba(255, 0, 100, 0.1) 50%,
            rgba(0, 255, 150, 0.1) 55%,
            transparent 70%
          );
          background-size: 200% 200%;
          animation: shimmerMove 3s ease-in-out infinite;
        }

        @keyframes shimmerMove {
          0% {
            background-position: -100% -100%;
          }
          50% {
            background-position: 100% 100%;
          }
          100% {
            background-position: -100% -100%;
          }
        }

        .hover\\:shadow-3xl:hover {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </>
  );
}