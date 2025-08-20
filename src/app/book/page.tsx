'use client';

import Link from "next/link";
import InteractiveBook from "../components/InteractiveBook";

export default function BookPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 py-4">
        <div className="container mx-auto px-8 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-black hover:text-purple-600 transition-colors">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-black text-black text-center flex-1">
            The Super Spectacular Book of Imagination
          </h1>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Interactive Book Section */}
      <section className="py-16">
        <div className="container mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-black mb-6">
              Flip Through the Pages
            </h2>
            <p className="text-xl text-black/80 max-w-3xl mx-auto">
              Click on the pages to turn them and explore this wildly fantastic adventure in imagination.
              Use your mouse to interact with the book!
            </p>
          </div>

          {/* Interactive Book Component */}
          <div className="flex justify-center">
            <InteractiveBook />
          </div>
        </div>
      </section>
    </main>
  );
}