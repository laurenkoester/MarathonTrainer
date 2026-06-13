import { useState, useEffect } from 'react';
import { useStrava } from './useStrava';
import { getRunActivitiesInRange, groupRunsByDate } from '../utils/stravaApi';
import { PLAN_START, PLAN_END } from '../utils/dates';

const CACHE_KEY = 'strava-runs-cache-v1';

function loadCache() {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
}

export function useStravaAllRuns(refreshKey = 0) {
  const { connected } = useStrava();

  // Seed from cache immediately so data is available on first render —
  // no loading flicker showing the planned workout card before Strava arrives.
  const [runsByDate, setRunsByDate] = useState(() => connected ? loadCache() : {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected) {
      setRunsByDate({});
      return;
    }

    let cancelled = false;
    setLoading(true);

    getRunActivitiesInRange(PLAN_START, PLAN_END)
      .then(activities => {
        if (!cancelled) {
          const grouped = groupRunsByDate(activities);
          saveCache(grouped);
          setRunsByDate(grouped);
        }
      })
      .catch(() => {
        // Keep showing cached data if the fetch fails (e.g. offline)
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [connected, refreshKey]);

  return { runsByDate, loading };
}
