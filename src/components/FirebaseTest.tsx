'use client';

import React, { useState } from 'react';
import { auth, db, analytics } from '@/firebase/config';
import { signUp, signIn, logOut } from '@/firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

const FirebaseTest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [user, setUser] = useState<User | null>(null);

  const handleSignUp = async () => {
    try {
      setStatus('Creating account...');
      const newUser = await signUp(email, password, 'Test User');
      setUser(newUser);
      setStatus('Account created successfully!');
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const handleSignIn = async () => {
    try {
      setStatus('Signing in...');
      const signedInUser = await signIn(email, password);
      setUser(signedInUser);
      setStatus('Signed in successfully!');
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setUser(null);
      setStatus('Signed out successfully!');
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const testFirestore = async () => {
    try {
      setStatus('Testing Firestore...');
      const docRef = await addDoc(collection(db, 'test'), {
        message: 'Hello from Firebase!',
        timestamp: new Date(),
        user: user?.uid || 'anonymous'
      });
      setStatus(`Firestore test successful! Doc ID: ${docRef.id}`);
    } catch (error: any) {
      setStatus(`Firestore error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Firebase Test</h2>
      
      {/* Status */}
      {status && (
        <div className={`mb-4 p-3 rounded ${
          status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {status}
        </div>
      )}

      {/* User Status */}
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <strong>User Status:</strong> {user ? `Signed in as ${user.email}` : 'Not signed in'}
      </div>

      {/* Auth Forms */}
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="flex space-x-2">
          <button
            onClick={handleSignUp}
            className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Sign Up
          </button>
          <button
            onClick={handleSignIn}
            className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Sign In
          </button>
        </div>

        {user && (
          <button
            onClick={handleSignOut}
            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        )}

        <button
          onClick={testFirestore}
          className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
        >
          Test Firestore
        </button>
      </div>

      {/* Firebase Services Status */}
      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">Firebase Services:</h3>
        <ul className="space-y-1">
          <li>✅ Auth: {auth ? 'Connected' : 'Not connected'}</li>
          <li>✅ Firestore: {db ? 'Connected' : 'Not connected'}</li>
          <li>✅ Analytics: {analytics ? 'Connected' : 'Not connected (SSR)'}</li>
        </ul>
      </div>
    </div>
  );
};

export default FirebaseTest; 