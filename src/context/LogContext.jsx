import { createContext, useReducer, useEffect, useContext, useRef } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { AuthContext } from './AuthContext';
import { db } from '../lib/firebase';

const STORAGE_KEY = 'sb-log-v1';

function logReducer(state, action) {
  switch (action.type) {
    case 'ADD_ENTRY':    return [...state, action.entry];
    case 'EDIT_ENTRY':   return state.map(e => e.id === action.id ? { ...e, ...action.updates } : e);
    case 'DELETE_ENTRY': return state.filter(e => e.id !== action.id);
    case 'LOAD':         return action.entries;
    default:             return state;
  }
}

export const LogContext = createContext(null);

export function LogProvider({ children }) {
  const { user } = useContext(AuthContext) ?? { user: null };
  const [entries, dispatch] = useReducer(logReducer, [], () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return [];
  });
  const remoteRef = useRef(false);

  // Keep localStorage in sync for offline / fast load
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // Write to Firestore on every change (skip if the change came from Firestore)
  useEffect(() => {
    if (!user || remoteRef.current) return;
    const ref = doc(db, 'users', user.uid, 'data', 'logs');
    setDoc(ref, { entries }).catch(console.error);
  }, [entries, user]);

  // Subscribe for real-time cross-device updates
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'data', 'logs');
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const { entries: remote } = snap.data();
      if (!remote) return;
      remoteRef.current = true;
      dispatch({ type: 'LOAD', entries: remote });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
      remoteRef.current = false;
    });
    return unsub;
  }, [user]);

  return (
    <LogContext.Provider value={{ entries, dispatch }}>
      {children}
    </LogContext.Provider>
  );
}
