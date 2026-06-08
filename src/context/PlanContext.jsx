import { createContext, useReducer, useEffect, useCallback } from 'react';
import { INITIAL_PLAN, deepCopyPlan } from '../data/plan';

const STORAGE_KEY = 'sb-plan-v1';
const PLAN_VERSION_KEY = 'sb-plan-version';
const CURRENT_PLAN_VERSION = 2;

function persistPlan(plan) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch { /* quota / private mode */ }
}

function loadPlan() {
  try {
    const version = parseInt(localStorage.getItem(PLAN_VERSION_KEY) || '0', 10);
    const stored = localStorage.getItem(STORAGE_KEY);
    let plan = stored ? deepCopyPlan(JSON.parse(stored)) : deepCopyPlan(INITIAL_PLAN);

    if (version < CURRENT_PLAN_VERSION) {
      for (let wi = 1; wi <= 4; wi++) {
        plan[wi] = { ...INITIAL_PLAN[wi], d: [...INITIAL_PLAN[wi].d] };
      }
      localStorage.setItem(PLAN_VERSION_KEY, String(CURRENT_PLAN_VERSION));
      persistPlan(plan);
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
      persistPlan(next);
      return next;
    }
    case 'EDIT_DAY': {
      const { wi, di, workout } = action;
      const next = deepCopyPlan(state);
      next[wi].d[di] = workout;
      persistPlan(next);
      return next;
    }
    case 'RESET': {
      localStorage.setItem(PLAN_VERSION_KEY, String(CURRENT_PLAN_VERSION));
      const next = deepCopyPlan(INITIAL_PLAN);
      persistPlan(next);
      return next;
    }
    case 'LOAD': {
      const next = deepCopyPlan(action.plan);
      persistPlan(next);
      return next;
    }
    default:
      return state;
  }
}

export const PlanContext = createContext(null);

export function PlanProvider({ children }) {
  const [plan, dispatch] = useReducer(planReducer, INITIAL_PLAN, () => loadPlan());

  const reloadFromStorage = useCallback(() => {
    dispatch({ type: 'LOAD', plan: loadPlan() });
  }, []);

  useEffect(() => {
    persistPlan(plan);
  }, [plan]);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          dispatch({ type: 'LOAD', plan: JSON.parse(e.newValue) });
        } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <PlanContext.Provider value={{ plan, dispatch, reloadFromStorage }}>
      {children}
    </PlanContext.Provider>
  );
}
