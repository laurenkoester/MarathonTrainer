import { createContext, useReducer, useEffect } from 'react';

const STORAGE_KEY = 'sb-strength-v1';

function strengthReducer(state, action) {
  switch (action.type) {
    case 'ADD_ENTRY':
      return [...state, action.entry];
    case 'DELETE_ENTRY':
      return state.filter(e => e.id !== action.id);
    case 'LOAD':
      return action.entries;
    default:
      return state;
  }
}

export const StrengthContext = createContext(null);

export function StrengthProvider({ children }) {
  const [entries, dispatch] = useReducer(strengthReducer, [], (initial) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* use initial */ }
    return initial;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  return (
    <StrengthContext.Provider value={{ entries, dispatch }}>
      {children}
    </StrengthContext.Provider>
  );
}
