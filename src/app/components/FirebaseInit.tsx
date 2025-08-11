'use client';

import { useEffect } from 'react';
import { app } from '@/lib/firebase/firebase';

export default function FirebaseInit(): null {
  useEffect(() => {
    // Access app to ensure Firebase initializes on the client
    if (app) {
      console.log('✅ Firebase initialized successfully');
      console.log('📋 Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    } else {
      console.error('❌ Firebase initialization failed');
    }
  }, []);

  return null;
}


