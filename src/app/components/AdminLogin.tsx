'use client';

import { useContext, useState } from 'react';
import { AuthContext } from '@/lib/contexts/AuthContext';
import SimpleAdminPanel from './SimpleAdminPanel';

export default function AdminLogin() {
  const { user, loading, isAdmin, signInWithGoogle, signOut } = useContext(AuthContext);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  if (loading) {
    return (
      <div className="w-2 h-2 bg-black/20 rounded-full animate-pulse"></div>
    );
  }

  if (user && isAdmin) {
    return (
      <>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdminPanelOpen(true)}
            className="group relative"
            title="Admin Panel"
          >
            {/* Admin panel icon */}
            <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:bg-blue-600 transition-colors duration-300"></div>
            
            {/* Hover tooltip */}
            <div className="absolute right-0 top-8 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
              Admin Panel
            </div>
          </button>
          
          <button
            onClick={signOut}
            className="group relative"
            title="Admin - Click to logout"
          >
            {/* Logout indicator dot */}
            <div className="w-2 h-2 bg-green-500 rounded-full group-hover:bg-red-500 transition-colors duration-300"></div>
            
            {/* Hover tooltip */}
            <div className="absolute right-0 top-8 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
              Logout
            </div>
          </button>
        </div>
        
        <SimpleAdminPanel 
          isOpen={isAdminPanelOpen} 
          onClose={() => setIsAdminPanelOpen(false)} 
        />
      </>
    );
  }

  return (
    <div className="relative">
      {isAdmin ? (
        <button
          onClick={() => setIsAdminPanelOpen(true)}
          className="flex items-center space-x-1 text-black/80 hover:text-black transition-colors font-medium"
        >
          <span className="text-lg">••</span>
        </button>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="flex items-center space-x-1 text-black/80 hover:text-black transition-colors font-medium"
        >
          <span className="text-lg">•</span>
        </button>
      )}

      {isAdminPanelOpen && (
        <SimpleAdminPanel
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
        />
      )}
    </div>
  );
}
