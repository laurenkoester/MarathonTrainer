import { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from 'date-fns';
import { useStrava } from './useStrava';
import { getRunActivitiesInRange, groupRunsByDate } from '../utils/stravaApi';

export function useStravaMonth(month, refreshKey = 0) {
  const { connected } = useStrava();
  const [runsByDate, setRunsByDate] = useState({});
  const [loading, setLoading] = useState(false);

  const monthKey = format(month, 'yyyy-MM');

  useEffect(() => {
    if (!connected) {
      setRunsByDate({});
      return;
    }

    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    let cancelled = false;
    setLoading(true);

    getRunActivitiesInRange(gridStart, gridEnd)
      .then(activities => {
        if (!cancelled) setRunsByDate(groupRunsByDate(activities));
      })
      .catch(() => {
        if (!cancelled) setRunsByDate({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [connected, monthKey, month, refreshKey]);

  return { runsByDate, loading };
}
