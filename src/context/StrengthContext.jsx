import { createContext, useReducer, useEffect, useContext, useRef } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { AuthContext } from './AuthContext';
import { db } from '../lib/firebase';

const STORAGE_KEY = 'sb-strength-v1';

function strengthReducer(state, action) {
  switch (action.type) {
    case 'ADD_ENTRY':    return [...state, action.entry];
    case 'DELETE_ENTRY': return state.filter(e => e.id !== action.id);
    case 'LOAD':         return action.entries;
    default:             return state;
  }
}

export const StrengthContext = createContext(null);

export function StrengthProvider({ children }) {
  const { user } = useContext(AuthContext) ?? { user: null };
  const [entries, dispatch] = useReducer(strengthReducer, [], () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return [];
  });
  const remoteRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (!user || remoteRef.current) return;
    const ref = doc(db, 'users', user.uid, 'data', 'strength');
    setDoc(ref, { entries }).catch(console.error);
  }, [entries, user]);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'data', 'strength');
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
    <StrengthContext.Provider value={{ entries, dispatch }}>
      {children}
    </StrengthContext.Provider>
  );
}
