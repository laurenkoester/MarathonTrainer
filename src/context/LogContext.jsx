import { createContext, useReducer, useEffect } from 'react';

const STORAGE_KEY = 'sb-log-v1';

function logReducer(state, action) {
  switch (action.type) {
    case 'ADD_ENTRY':
      return [...state, action.entry];
    case 'EDIT_ENTRY':
      return state.map(e => e.id === action.id ? { ...e, ...action.updates } : e);
    case 'DELETE_ENTRY':
      return state.filter(e => e.id !== action.id);
    case 'LOAD':
      return action.entries;
    default:
      return state;
  }
}

export const LogContext = createContext(null);

export function LogProvider({ children }) {
  const [entries, dispatch] = useReducer(logReducer, [], (initial) => {
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
    <LogContext.Provider value={{ entries, dispatch }}>
      {children}
    </LogContext.Provider>
  );
}
