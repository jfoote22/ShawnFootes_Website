'use client';
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import AdminLogin from "./components/AdminLogin";
import DynamicImage from "./components/DynamicImage";
import DynamicImageCarousel from "./components/DynamicImageCarousel";
import Dynamic3DCarousel from "./components/Dynamic3DCarousel";
import GuestBookModal from "./components/GuestBookModal";

export default function Home() {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [guestBookOpen, setGuestBookOpen] = useState(false);

  useEffect(() => {
    // Load background image from localStorage
    const savedBackground = localStorage.getItem('websiteBackgroundImage');
    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }
  }, []);

  return (
    <main className="min-h-screen relative">
      {/* Dynamic Background Image */}
      {backgroundImage && (
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        />
      )}
      
      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Header Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-white/20">
          <div className="container mx-auto px-8">
            <div className="flex items-center h-16">
              {/* Admin Login - Moved to far left */}
              <AdminLogin />
              
              {/* Logo - Moved closer to admin login */}
              <div className="text-2xl font-bold text-black ml-2">
                Shawn Foote
              </div>

              {/* Centered Navigation Menu */}
              <nav className="flex items-center space-x-8 mx-auto">
                <Link href="/featured-work" className="text-black/80 hover:text-black transition-colors font-medium">
                  Featured Work
                </Link>
                <Link href="/gallery" className="text-black/80 hover:text-black transition-colors font-medium">
                  Gallery
                </Link>
                <Link href="/store" className="text-black/80 hover:text-black transition-colors font-medium">
                  Store
                </Link>
                <a href="#collaborations" className="text-black/80 hover:text-black transition-colors font-medium">
                  Collaborations
                </a>
                <a href="#about" className="text-black/80 hover:text-black transition-colors font-medium">
                  About
                </a>
                <a href="#contact" className="text-black/80 hover:text-black transition-colors font-medium">
                  Contact
                </a>
              </nav>

              {/* Guest Book Button - Top Right */}
              <button
                onClick={() => setGuestBookOpen(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-black rounded-lg text-sm font-medium transition-all duration-300 border border-white/30 hover:border-white/50"
              >
                Sign My Guest Book
              </button>
            </div>
          </div>
        </header>

        {/* Guest Book Modal */}
        {guestBookOpen && (
          <GuestBookModal onClose={() => setGuestBookOpen(false)} />
        )}

      {/* Main Landing Section */}
      <section className="relative min-h-screen py-20 pt-32" id="featured">

                    {/* Featured Work & Gallery Layout */}
          <div className="container mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Side - Featured Artwork */}
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-black mb-6">Featured Work</h2>
              <Link href="/featured-work" className="block">
                <div className="relative group cursor-pointer">
                  {/* Fancy Border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-2 transform group-hover:scale-105 transition-transform duration-300">
                    <div className="bg-white rounded-xl p-2">
                      <div className="w-full h-[500px] rounded-lg relative overflow-hidden">
                        {/* Dynamic Featured Artwork */}
                        <DynamicImage
                          category="featured"
                          className="w-full h-full rounded-lg"
                          intervalMs={6000}
                          alt="Featured Artwork"
                          fallbackContent={
                            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                              <div className="text-center text-white p-8">
                                <h4 className="text-3xl font-bold mb-6">&quot;Art is Alchemy&quot;</h4>
                                <p className="text-xl mb-6">Upload featured artwork</p>
                                <p className="text-lg opacity-90">in admin panel</p>
                              </div>
                            </div>
                          }
                        />
                        
                        {/* Featured Badge */}
                        <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold text-white">
                          FEATURED
                        </div>

                        {/* Click Indicator */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
                            View Featured Works
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              
              {/* Featured Artwork Details */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h4 className="text-xl font-semibold text-black mb-4">About This Piece</h4>
                <p className="text-black/80 leading-relaxed">
                  &quot;Art is Alchemy&quot; represents the transformative power of artistic creation. This mixed media piece combines traditional techniques with modern experimentation, embodying the philosophy that art has the ability to transmute ordinary materials into something extraordinary.
                </p>
              </div>
            </div>

                          {/* Right Side - Gallery Carousel */}
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-black mb-6">Gallery Preview</h2>
              
                <div className="text-left mb-6">
                  <Link 
                    href="/gallery" 
                    className="inline-block bg-white/20 hover:bg-white/30 backdrop-blur-sm text-black px-6 py-3 rounded-full text-base font-semibold transition-all duration-300 border border-white/30 hover:border-white/50"
                  >
                    View Full Gallery
                  </Link>
                </div>
              
              {/* 3D Carousel Container */}
              <div className="relative rounded-2xl bg-white/10 backdrop-blur-sm p-6 border border-white/20 mt-32">
                <Dynamic3DCarousel
                  category="gallery"
                  count={6}
                  intervalMs={5000}
                  className="w-full"
                />
              </div>

                              {/* Gallery Navigation */}
                {/* The View Full Gallery button is now positioned right underneath the header */}
             </div>
            </div>
          </div>

          {/* Store Preview Section */}
          <div className="container mx-auto px-8 mt-40" id="store">
            <div className="text-left mb-8">
              <h2 className="text-4xl font-bold text-black mb-6">Store</h2>
              <div className="text-left mb-12">
                <Link 
                  href="/store" 
                  className="inline-block bg-white/20 hover:bg-white/30 backdrop-blur-sm text-black px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 border border-white/30 hover:border-white/50"
                >
                  Browse All Products
                </Link>
              </div>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Original Works Category */}
            <Link href="/store#paintings" className="group cursor-pointer">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <DynamicImage
                  category="store"
                  subcategory="original-works"
                  className="w-full h-48 rounded-xl mb-4"
                  intervalMs={7000}
                  alt="Original Works"
                  fallbackContent={
                    <div className="w-full h-48 bg-gradient-to-br from-red-400 to-pink-400 rounded-xl mb-4 flex items-center justify-center">
                      <p className="text-white font-semibold">Original Works</p>
                    </div>
                  }
                />
                <h3 className="text-xl font-semibold text-black mb-2">Original Works</h3>
                <p className="text-black/80 text-sm">One-of-a-kind original pieces</p>
              </div>
            </Link>

            {/* Prints Category */}
            <Link href="/store#prints" className="group cursor-pointer">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <DynamicImage
                  category="store"
                  subcategory="prints"
                  className="w-full h-48 rounded-xl mb-4"
                  intervalMs={7500}
                  alt="Prints"
                  fallbackContent={
                    <div className="w-full h-48 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl mb-4 flex items-center justify-center">
                      <p className="text-white font-semibold">Prints</p>
                    </div>
                  }
                />
                <h3 className="text-xl font-semibold text-black mb-2">Prints</h3>
                <p className="text-black/80 text-sm">High-quality reproductions of original artwork</p>
              </div>
            </Link>

            {/* Apparel Category */}
            <Link href="/store#apparel" className="group cursor-pointer">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <DynamicImage
                  category="store"
                  subcategory="apparel"
                  className="w-full h-48 rounded-xl mb-4"
                  intervalMs={8000}
                  alt="Apparel"
                  fallbackContent={
                    <div className="w-full h-48 bg-gradient-to-br from-green-400 to-blue-400 rounded-xl mb-4 flex items-center justify-center">
                      <p className="text-white font-semibold">Apparel</p>
                    </div>
                  }
                />
                <h3 className="text-xl font-semibold text-black mb-2">Art on Clothing</h3>
                <p className="text-black/80 text-sm">Wearable art on hoodies, t-shirts, and more</p>
              </div>
            </Link>

            {/* Commissions Category */}
            <Link href="/store#commissions" className="group cursor-pointer">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <DynamicImage
                  category="store"
                  subcategory="commissions"
                  className="w-full h-48 rounded-xl mb-4"
                  intervalMs={8500}
                  alt="Commissions"
                  fallbackContent={
                    <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-xl mb-4 flex items-center justify-center">
                      <p className="text-white font-semibold">Commissions</p>
                    </div>
                  }
                />
                <h3 className="text-xl font-semibold text-black mb-2">Commissions</h3>
                <p className="text-black/80 text-sm">Custom artwork created just for you</p>
              </div>
            </Link>
          </div>
          
          </div>

          {/* Collaborations Section */}
          <div className="container mx-auto px-8 mt-40" id="collaborations">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-6">Collaborations</h2>
              <p className="text-xl text-black/80 max-w-3xl mx-auto">
                Working together with other artists, galleries, and creative partners to bring unique projects to life
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Collaboration Image */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative">
                  <DynamicImage
                    category="collaborations"
                    className="w-full h-96 rounded-2xl shadow-2xl"
                    intervalMs={6000}
                    alt="Collaborations"
                    fallbackContent={
                      <div className="w-full h-96 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl shadow-2xl flex items-center justify-center">
                        <div className="text-center text-white p-8">
                          <div className="text-6xl mb-4">🤝</div>
                          <h3 className="text-2xl font-bold mb-4">Collaboration Space</h3>
                          <p className="text-lg opacity-90">Upload collaboration images</p>
                          <p className="text-base opacity-75">in admin panel</p>
                        </div>
                      </div>
                    }
                  />
                </div>
              </div>
              
              {/* Right Side - Collaboration Content */}
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-black">Let&apos;s Create Together</h3>
                <div className="space-y-4 text-lg text-black/80 leading-relaxed">
                  <p>
                    Collaboration is at the heart of artistic innovation. I&apos;m always excited to work with other creatives, 
                    galleries, and organizations to bring unique visions to life.
                  </p>
                  <p>
                    Whether it&apos;s joint exhibitions, mixed media projects, or creative partnerships, 
                    I believe the best art often comes from working together.
                  </p>
                  <p>
                    <strong>Interested in collaborating?</strong> Let&apos;s discuss how we can combine our creative energies 
                    to create something truly special.
                  </p>
                </div>
                
                {/* Collaboration CTA */}
                <div className="pt-4">
                  <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-black px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 border border-white/30 hover:border-white/50">
                    Start a Conversation
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="container mx-auto px-8 mt-20 pb-20" id="bio">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-4">About the Artist</h2>
            </div>
            <div className="hero-text-bg max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Bio Picture */}
                <div className="flex justify-center lg:justify-start">
                  <div className="relative">
                    <DynamicImage
                      category="about"
                      subcategory="artist-portraits"
                      className="w-80 h-96 rounded-2xl object-cover shadow-2xl"
                      intervalMs={7000}
                      alt="Shawn Foote - Artist"
                      fallbackContent={
                        <div className="w-80 h-96 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl shadow-2xl flex items-center justify-center">
                          <div className="text-center text-white p-8">
                            <div className="text-6xl mb-4">👨‍🎨</div>
                            <h3 className="text-2xl font-bold mb-4">Artist Portrait</h3>
                            <p className="text-lg opacity-90">Upload artist images</p>
                            <p className="text-base opacity-75">in admin panel</p>
                          </div>
                        </div>
                      }
                    />
                  </div>
                </div>
                
                {/* Right Side - Bio Text */}
                <div>
                  <p className="text-xl text-black/90 leading-relaxed">
                    From his Tacoma, WA studio, Shawn Foote makes art that weaves together nature, spirituality, and historical themes. His creations emerge through a thoughtful process, blending curiosity, technical skill, and experimentation, each work taking on its own vibrant essence. Foote now inspires as an art teacher in Spanaway. His resourceful approach to materials mirrors a personal journey of transformation. To Foote, &quot;Art is Alchemy.&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* About the Artist Image Grid */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-black mb-8 text-center">Studio & Process</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Studio Shots */}
                <DynamicImage
                  category="about"
                  subcategory="studio-shots"
                  className="w-full h-32 rounded-xl"
                  intervalMs={12000}
                  alt="Studio Shots"
                  fallbackContent={
                    <div className="w-full h-32 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-xl flex items-center justify-center">
                      <p className="text-white font-semibold text-sm">Studio</p>
                    </div>
                  }
                />
                
                {/* Work in Progress */}
                <DynamicImage
                  category="about"
                  subcategory="work-in-progress"
                  className="w-full h-32 rounded-xl"
                  intervalMs={13000}
                  alt="Work in Progress"
                  fallbackContent={
                    <div className="w-full h-32 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-xl flex items-center justify-center">
                      <p className="text-white font-semibold text-sm">In Progress</p>
                    </div>
                  }
                />
                
                {/* Behind Scenes */}
                <DynamicImage
                  category="about"
                  subcategory="behind-scenes"
                  className="w-full h-32 rounded-xl"
                  intervalMs={14000}
                  alt="Behind the Scenes"
                  fallbackContent={
                    <div className="w-full h-32 bg-gradient-to-br from-violet-400 to-purple-400 rounded-xl flex items-center justify-center">
                      <p className="text-white font-semibold text-sm">Behind Scenes</p>
                    </div>
                  }
                />
                
                {/* Artist Portraits */}
                <DynamicImage
                  category="about"
                  subcategory="artist-portraits"
                  className="w-full h-32 rounded-xl"
                  intervalMs={15000}
                  alt="Artist Portraits"
                  fallbackContent={
                    <div className="w-full h-32 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center">
                      <p className="text-white font-semibold text-sm">Portraits</p>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-white/10 backdrop-blur-sm border-t border-white/20 py-16" id="contact">
          <div className="container mx-auto px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-black mb-6">Get In Touch</h2>
                                      <p className="text-xl text-black/80 max-w-3xl mx-auto">
                          Ready to start a conversation about art, collaborations, or commissions? I&apos;d love to hear from you.
                        </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {/* Column 1 - Contact Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-black mb-6">Contact Information</h3>
                  <div className="space-y-4">
                    {/* Email */}
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">📧</span>
                      </div>
                      <div>
                        <p className="text-sm text-black/60 font-medium">Email</p>
                        <a 
                          href="mailto:3Foote@gmail.com" 
                          className="text-lg text-black hover:text-blue-600 transition-colors font-semibold"
                        >
                          3Foote@gmail.com
                        </a>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">📞</span>
                      </div>
                      <div>
                        <p className="text-sm text-black/60 font-medium">Phone</p>
                        <a 
                          href="tel:206-919-1614" 
                          className="text-lg text-black hover:text-green-600 transition-colors font-semibold"
                        >
                          206-919-1614
                        </a>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">📍</span>
                      </div>
                      <div>
                        <p className="text-sm text-black/60 font-medium">Studio</p>
                        <p className="text-lg text-black font-semibold">Tacoma, WA</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2 - Social Media */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">Follow My Work</h3>
                  <div className="space-y-3">
                    {/* Instagram */}
                    <div className="flex items-center space-x-4">
                      <a 
                        href="#" 
                        className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
                      >
                        <span className="text-white text-lg">📸</span>
                      </a>
                      <span className="text-black font-medium">Instagram</span>
                    </div>

                    {/* Facebook */}
                    <div className="flex items-center space-x-4">
                      <a 
                        href="#" 
                        className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
                      >
                        <span className="text-white text-lg">📘</span>
                      </a>
                      <span className="text-black font-medium">Facebook</span>
                    </div>

                    {/* X (Twitter) */}
                    <div className="flex items-center space-x-4">
                      <a 
                        href="#" 
                        className="w-10 h-10 bg-gradient-to-r from-gray-800 to-black rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
                      >
                        <span className="text-white text-lg">🐦</span>
                      </a>
                      <span className="text-black font-medium">X (Twitter)</span>
                    </div>

                    {/* LinkedIn */}
                    <div className="flex items-center space-x-4">
                      <a 
                        href="#" 
                        className="w-10 h-10 bg-gradient-to-r from-blue-700 to-blue-800 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
                      >
                        <span className="text-white text-lg">💼</span>
                      </a>
                      <span className="text-black font-medium">LinkedIn</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3 - Quick Contact Form */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-2xl font-bold text-black mb-6">Send a Quick Message</h4>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-black placeholder-black/60 focus:outline-none focus:border-white/50"
                    />
                    <input 
                      type="email" 
                      placeholder="Your Email" 
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-black placeholder-black/60 focus:outline-none focus:border-white/50"
                    />
                    <textarea 
                      placeholder="Your Message" 
                      rows={4}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-black placeholder-black/60 focus:outline-none focus:border-white/50 resize-none"
                    ></textarea>
                    <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-white/30 hover:border-white/50">
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
