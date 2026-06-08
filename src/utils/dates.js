import { format, differenceInCalendarDays, startOfDay, parseISO } from 'date-fns';

export const PLAN_START = new Date('2026-06-01T00:00:00');
export const PLAN_END = new Date('2026-09-06T00:00:00');

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_NAMES_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function getCellForDate(date) {
  const diff = differenceInCalendarDays(startOfDay(date), startOfDay(PLAN_START));
  if (diff < 0 || diff >= 98) return null;
  return { wi: Math.floor(diff / 7), di: diff % 7 };
}

export function getDateForCell(wi, di) {
  const d = new Date(PLAN_START);
  d.setDate(d.getDate() + wi * 7 + di);
  return d;
}

export function getTodayCell() {
  return getCellForDate(new Date());
}

export function getCurrentWeekIndex() {
  const cell = getTodayCell();
  return cell ? cell.wi : null;
}

export function formatShort(date) {
  return format(date, 'MMM d');
}

export function formatISO(date) {
  return format(date, 'yyyy-MM-dd');
}

export function formatDayName(date) {
  return format(date, 'EEE');
}

export function isSameDay(a, b) {
  return formatISO(a) === formatISO(b);
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

export function isBeforePlan(date) {
  return startOfDay(date) < startOfDay(PLAN_START);
}

export function isAfterPlan(date) {
  return startOfDay(date) > startOfDay(PLAN_END);
}

export { parseISO, startOfDay, format };
