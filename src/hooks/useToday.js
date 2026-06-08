import { useMemo } from 'react';
import { usePlan } from './usePlan';
import {
  getTodayCell,
  getDateForCell,
  getCellForDate,
  formatISO,
  formatShort,
  formatDayName,
  isBeforePlan,
  isAfterPlan,
  PLAN_START,
  PLAN_END,
} from '../utils/dates';

export function useToday() {
  const { plan } = usePlan();

  return useMemo(() => {
    const today = new Date();
    const cell = getTodayCell();

    if (isBeforePlan(today)) {
      return { status: 'before', today, cell: null };
    }
    if (isAfterPlan(today)) {
      return { status: 'after', today, cell: null };
    }
    if (!cell) {
      return { status: 'outside', today, cell: null };
    }

    const { wi, di } = cell;
    const week = plan[wi];
    const workout = week.d[di];
    const date = getDateForCell(wi, di);

    const upcoming = [];
    for (let i = 1; i <= 3; i++) {
      const nextDi = di + i;
      if (nextDi < 7) {
        upcoming.push({
          wi,
          di: nextDi,
          workout: week.d[nextDi],
          date: getDateForCell(wi, nextDi),
        });
      } else {
        const nextWi = wi + 1;
        if (nextWi < plan.length) {
          const nd = nextDi - 7;
          upcoming.push({
            wi: nextWi,
            di: nd,
            workout: plan[nextWi].d[nd],
            date: getDateForCell(nextWi, nd),
          });
        }
      }
    }

    return {
      status: 'active',
      today,
      cell,
      wi,
      di,
      week,
      workout,
      date,
      dateStr: formatISO(date),
      displayDate: formatShort(date),
      dayName: formatDayName(date),
      upcoming,
    };
  }, [plan]);
}

export function useCellForDate(date) {
  const { plan } = usePlan();

  return useMemo(() => {
    const cell = getCellForDate(date);
    if (!cell) return null;

    const { wi, di } = cell;
    return {
      wi,
      di,
      week: plan[wi],
      workout: plan[wi].d[di],
      date: getDateForCell(wi, di),
    };
  }, [plan, date]);
}

export { PLAN_START, PLAN_END };
