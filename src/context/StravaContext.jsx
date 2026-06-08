import { createContext, useReducer, useEffect, useCallback } from 'react';
import { getStoredTokens, getTodayActivities, stravaActivityToLogFields } from '../utils/stravaApi';

const initialState = {
  connected: false,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  athleteId: null,
  activities: [],
  lastSynced: null,
  syncing: false,
  error: null,
};

function stravaReducer(state, action) {
  switch (action.type) {
    case 'SET_TOKENS':
      return {
        ...state,
        connected: true,
        accessToken: action.tokens.accessToken,
        refreshToken: action.tokens.refreshToken,
        expiresAt: action.tokens.expiresAt,
        athleteId: action.tokens.athleteId,
        error: null,
      };
    case 'DISCONNECT':
      return { ...initialState };
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.activities, lastSynced: new Date().toISOString(), syncing: false };
    case 'SET_SYNCING':
      return { ...state, syncing: action.syncing, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.error, syncing: false };
    default:
      return state;
  }
}

export const StravaContext = createContext(null);

export function StravaProvider({ children }) {
  const [state, dispatch] = useReducer(stravaReducer, initialState, () => {
    const tokens = getStoredTokens();
    if (tokens) {
      return {
        ...initialState,
        connected: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        athleteId: tokens.athleteId,
      };
    }
    return initialState;
  });

  const syncToday = useCallback(async () => {
    dispatch({ type: 'SET_SYNCING', syncing: true });
    try {
      const activities = await getTodayActivities();
      dispatch({ type: 'SET_ACTIVITIES', activities });
      return activities;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
      return [];
    }
  }, []);

  const getLogFieldsFromActivity = useCallback((activity) => {
    return stravaActivityToLogFields(activity);
  }, []);

  return (
    <StravaContext.Provider value={{ ...state, dispatch, syncToday, getLogFieldsFromActivity }}>
      {children}
    </StravaContext.Provider>
  );
}
