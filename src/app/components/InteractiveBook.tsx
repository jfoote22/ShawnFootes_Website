'use client';

import { useState, useCallback } from 'react';

interface BookPage {
  id: number;
  content: {
    title: string;
    text: string;
    image?: string;
  };
}

export default function InteractiveBook() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward'>('forward');

  // Sample book pages - these will be replaceable via admin panel later
  const bookPages: BookPage[] = [
    {
      id: 0,
      content: {
        title: "Welcome to the Adventure",
        text: "Begin your journey into the realms of imagination where anything is possible...",
        image: "/ShawnBG.jpg"
      }
    },
    {
      id: 1,
      content: {
        title: "Chapter 1: The Creative Mind",
        text: "Discover the power that lies within your creative consciousness...",
        image: "/bio_pic.jpg"
      }
    },
    {
      id: 2,
      content: {
        title: "Chapter 2: Artistic Vision",
        text: "Learn to see the world through the eyes of an artist...",
        image: "/LonelyWarrior.jpg"
      }
    },
    {
      id: 3,
      content: {
        title: "Chapter 3: Colors of Imagination",
        text: "Explore how colors can express the deepest emotions and ideas...",
        image: "/shawns_interview.jpg"
      }
    },
    {
      id: 4,
      content: {
        title: "Chapter 4: Beyond Reality",
        text: "Step into worlds that exist only in the realm of imagination...",
        image: "/ShawnBG.jpg"
      }
    },
    {
      id: 5,
      content: {
        title: "The End... Or Is It?",
        text: "Every ending is a new beginning. What will you create next?",
        image: "/bio_pic.jpg"
      }
    }
  ];

  const totalPages = bookPages.length;

  const handlePageClick = useCallback((side: 'left' | 'right') => {
    if (isFlipping) return;

    if (side === 'right' && currentPage < totalPages - 2) {
      setIsFlipping(true);
      setFlipDirection('forward');
      setTimeout(() => {
        setCurrentPage(prev => prev + 2);
        setIsFlipping(false);
      }, 600);
    } else if (side === 'left' && currentPage > 0) {
      setIsFlipping(true);
      setFlipDirection('backward');
      setTimeout(() => {
        setCurrentPage(prev => prev - 2);
        setIsFlipping(false);
      }, 600);
    }
  }, [currentPage, totalPages, isFlipping]);

  const currentPageData = bookPages[currentPage];
  const nextPageData = currentPage < totalPages - 1 ? bookPages[currentPage + 1] : null;

  return (
    <div className="book-container">
      <div className="book">
        {/* Left Page */}
        <div 
          className={`page page-left ${isFlipping && flipDirection === 'backward' ? 'flipping-backward' : ''}`}
          onClick={() => handlePageClick('left')}
        >
          <div className="page-content">
            <div 
              className="page-background"
              style={{
                backgroundImage: currentPageData.content.image ? `url(${currentPageData.content.image})` : 'none'
              }}
            ></div>
            <div className="page-overlay">
              <h2 className="page-title">{currentPageData.content.title}</h2>
              <p className="page-text">{currentPageData.content.text}</p>
              <div className="page-number">{currentPage + 1}</div>
            </div>
          </div>
        </div>

        {/* Right Page */}
        <div 
          className={`page page-right ${isFlipping && flipDirection === 'forward' ? 'flipping-forward' : ''}`}
          onClick={() => handlePageClick('right')}
        >
          <div className="page-content">
            {nextPageData ? (
              <>
                <div 
                  className="page-background"
                  style={{
                    backgroundImage: nextPageData.content.image ? `url(${nextPageData.content.image})` : 'none'
                  }}
                ></div>
                <div className="page-overlay">
                  <h2 className="page-title">{nextPageData.content.title}</h2>
                  <p className="page-text">{nextPageData.content.text}</p>
                  <div className="page-number">{currentPage + 2}</div>
                </div>
              </>
            ) : (
              <div className="page-overlay end-page">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-600 mb-4">The End</h2>
                  <p className="text-gray-500">Thank you for reading!</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Book Spine */}
        <div className="book-spine"></div>
      </div>

      {/* Navigation Info */}
      <div className="book-navigation">
        <div className="nav-info">
          Pages {currentPage + 1}-{nextPageData ? currentPage + 2 : currentPage + 1} of {totalPages}
        </div>
        <div className="nav-buttons">
          <button 
            onClick={() => handlePageClick('left')}
            disabled={currentPage === 0 || isFlipping}
            className="nav-btn prev-btn"
          >
            ← Previous
          </button>
          <button 
            onClick={() => handlePageClick('right')}
            disabled={currentPage >= totalPages - 2 || isFlipping}
            className="nav-btn next-btn"
          >
            Next →
          </button>
        </div>
      </div>

      <style jsx>{`
        .book-container {
          perspective: 1500px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .book {
          position: relative;
          width: 1000px;
          height: 600px;
          transform-style: preserve-3d;
          margin: 0 auto;
        }

        .page {
          position: absolute;
          width: 500px;
          height: 600px;
          background: white;
          border: 2px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .page-left {
          left: 0;
          z-index: 2;
          transform-origin: right center;
        }

        .page-right {
          left: 500px;
          z-index: 1;
          transform-origin: left center;
        }

        .page-content {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 6px;
        }

        .page-background {
          position: absolute;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0.3;
        }

        .page-overlay {
          position: relative;
          z-index: 2;
          padding: 2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
        }

        .page-title {
          font-size: 2rem;
          font-weight: bold;
          color: #1a202c;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .page-text {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #4a5568;
          flex: 1;
        }

        .page-number {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          font-size: 0.9rem;
          color: #a0aec0;
          font-weight: 600;
        }

        .end-page {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(237, 242, 247, 0.9) 0%, rgba(226, 232, 240, 0.8) 100%);
        }

        .book-spine {
          position: absolute;
          left: 500px;
          top: 0;
          width: 4px;
          height: 600px;
          background: linear-gradient(to bottom, #8b5cf6, #ec4899);
          border-radius: 2px;
          z-index: 10;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
        }

        .page:hover {
          transform: rotateY(-5deg);
        }

        .page-right:hover {
          transform: rotateY(5deg);
        }

        .flipping-forward {
          transform: rotateY(-180deg) !important;
          z-index: 3;
        }

        .flipping-backward {
          transform: rotateY(180deg) !important;
          z-index: 3;
        }

        .book-navigation {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 1000px;
          margin-top: 2rem;
          gap: 1rem;
        }

        .nav-info {
          font-size: 1.1rem;
          font-weight: 600;
          color: #4a5568;
        }

        .nav-buttons {
          display: flex;
          gap: 1rem;
        }

        .nav-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
        }

        .nav-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
        }

        .nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 1100px) {
          .book {
            width: 800px;
            height: 480px;
          }

          .page {
            width: 400px;
            height: 480px;
          }

          .page-right {
            left: 400px;
          }

          .book-spine {
            left: 400px;
            height: 480px;
          }

          .book-navigation {
            width: 800px;
          }
        }

        @media (max-width: 768px) {
          .book {
            width: 700px;
            height: 420px;
          }

          .page {
            width: 350px;
            height: 420px;
          }

          .page-right {
            left: 350px;
          }

          .book-spine {
            left: 350px;
            height: 420px;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .page-text {
            font-size: 1rem;
          }

          .page-overlay {
            padding: 1.5rem;
          }

          .book-navigation {
            width: 700px;
          }
        }

        @media (max-width: 640px) {
          .book {
            width: 500px;
            height: 350px;
          }

          .page {
            width: 250px;
            height: 350px;
          }

          .page-right {
            left: 250px;
          }

          .book-spine {
            left: 250px;
            height: 350px;
          }

          .page-title {
            font-size: 1.2rem;
          }

          .page-text {
            font-size: 0.9rem;
          }

          .page-overlay {
            padding: 1rem;
          }

          .book-navigation {
            width: 500px;
          }
        }
      `}</style>
    </div>
  );
}