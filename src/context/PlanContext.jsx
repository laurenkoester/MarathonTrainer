import { createContext, useReducer, useEffect, useCallback, useContext, useRef } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { INITIAL_PLAN, deepCopyPlan } from '../data/plan';
import { AuthContext } from './AuthContext';
import { db } from '../lib/firebase';

const STORAGE_KEY = 'sb-plan-v1';
const PLAN_VERSION_KEY = 'sb-plan-version';
const CURRENT_PLAN_VERSION = 2;

function persistLocal(plan) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plan)); } catch { /* quota */ }
}

function loadLocal() {
  try {
    const version = parseInt(localStorage.getItem(PLAN_VERSION_KEY) || '0', 10);
    const stored = localStorage.getItem(STORAGE_KEY);
    let plan = stored ? deepCopyPlan(JSON.parse(stored)) : deepCopyPlan(INITIAL_PLAN);
    if (version < CURRENT_PLAN_VERSION) {
      for (let wi = 1; wi <= 4; wi++) {
        plan[wi] = { ...INITIAL_PLAN[wi], d: [...INITIAL_PLAN[wi].d] };
      }
      localStorage.setItem(PLAN_VERSION_KEY, String(CURRENT_PLAN_VERSION));
      persistLocal(plan);
    }
    return plan;
  } catch {
    return deepCopyPlan(INITIAL_PLAN);
  }
}

function planReducer(state, action) {
  switch (action.type) {
    case 'SWAP_DAYS': {
      const { fromWi, fromDi, toWi, toDi } = action;
      const next = deepCopyPlan(state);
      const temp = next[fromWi].d[fromDi];
      next[fromWi].d[fromDi] = next[toWi].d[toDi];
      next[toWi].d[toDi] = temp;
      return next;
    }
    case 'EDIT_DAY': {
      const next = deepCopyPlan(state);
      next[action.wi].d[action.di] = action.workout;
      return next;
    }
    case 'RESET':
      return deepCopyPlan(INITIAL_PLAN);
    case 'LOAD':
      return deepCopyPlan(action.plan);
    default:
      return state;
  }
}

export const PlanContext = createContext(null);

export function PlanProvider({ children }) {
  const { user } = useContext(AuthContext) ?? { user: null };
  const [plan, dispatch] = useReducer(planReducer, INITIAL_PLAN, () => loadLocal());
  const remoteRef = useRef(false); // true while applying a remote snapshot

  // Persist locally on every change
  useEffect(() => {
    persistLocal(plan);
  }, [plan]);

  // Sync to Firestore whenever plan changes (skip if the change came from Firestore)
  useEffect(() => {
    if (!user || remoteRef.current) return;
    const ref = doc(db, 'users', user.uid, 'data', 'plan');
    setDoc(ref, { weeks: plan }).catch(console.error);
  }, [plan, user]);

  // Subscribe to Firestore for real-time cross-device updates
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'data', 'plan');
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const { weeks } = snap.data();
      if (!weeks) return;
      remoteRef.current = true;
      dispatch({ type: 'LOAD', plan: weeks });
      persistLocal(weeks);
      remoteRef.current = false;
    });
    return unsub;
  }, [user]);

  const reloadFromStorage = useCallback(() => {
    dispatch({ type: 'LOAD', plan: loadLocal() });
  }, []);

  return (
    <PlanContext.Provider value={{ plan, dispatch, reloadFromStorage }}>
      {children}
    </PlanContext.Provider>
  );
}
