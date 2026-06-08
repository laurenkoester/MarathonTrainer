import { useContext, useMemo } from 'react';
import { LogContext } from '../context/LogContext';

export function useLog() {
  const ctx = useContext(LogContext);
  if (!ctx) throw new Error('useLog must be used within LogProvider');
  return ctx;
}

export function useLogForDate(dateStr) {
  const { entries } = useLog();
  return useMemo(
    () => entries.filter(e => e.date === dateStr),
    [entries, dateStr],
  );
}

export function useLogForWeek(wk) {
  const { entries } = useLog();
  return useMemo(
    () => entries.filter(e => e.wk === wk),
    [entries, wk],
  );
}
