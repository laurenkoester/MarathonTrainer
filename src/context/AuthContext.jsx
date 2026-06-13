import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out

  useEffect(() => {
    // Handle the redirect result when returning from Google sign-in
    getRedirectResult(auth).catch(console.error);
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  async function signIn() {
    try {
      // Redirect works on all browsers including mobile Safari
      await signInWithRedirect(auth, googleProvider);
    } catch (e) {
      console.error('Sign in failed', e);
    }
  }

  async function signOutUser() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
