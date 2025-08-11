'use client';

import { useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

export default function FirebaseTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [testing, setTesting] = useState(false);

  const testFirebase = async () => {
    setTesting(true);
    setTestResult('Testing Firebase connection...\n');

    try {
      // Test 1: Write to Firestore
      setTestResult(prev => prev + 'Writing test document...\n');
      const docRef = await addDoc(collection(db, 'test'), {
        message: 'Hello Firebase!',
        timestamp: new Date()
      });
      setTestResult(prev => prev + `✅ Document written with ID: ${docRef.id}\n`);

      // Test 2: Read from Firestore
      setTestResult(prev => prev + 'Reading test documents...\n');
      const querySnapshot = await getDocs(collection(db, 'test'));
      setTestResult(prev => prev + `✅ Found ${querySnapshot.docs.length} documents\n`);

      setTestResult(prev => prev + '\n🎉 Firebase is working correctly!\n');
    } catch (error) {
      console.error('Firebase test failed:', error);
      setTestResult(prev => prev + `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold mb-4">Firebase Connection Test</h3>
      <button
        onClick={testFirebase}
        disabled={testing}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
      >
        {testing ? 'Testing...' : 'Test Firebase'}
      </button>
      
      {testResult && (
        <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-40">
          {testResult}
        </pre>
      )}
    </div>
  );
}
