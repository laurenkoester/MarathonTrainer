import { stravaRunsToDayDisplay } from './stravaApi';

// Strava is the primary source of truth for a day's mileage.
// Manual log entries are a fallback used only when no Strava data exists.

export function getDayMiles(dateStr, logEntries, stravaRunsByDate) {
  const stravaDisplay = stravaRunsToDayDisplay(stravaRunsByDate[dateStr]);
  if (stravaDisplay) return parseFloat(stravaDisplay.miles) || 0;

  const dayLogs = logEntries.filter(e => e.date === dateStr);
  return dayLogs.reduce((sum, e) => sum + (parseFloat(e.miles) || 0), 0);
}

// Returns { entries, fromStrava } for display in calendar cells.
// entries is an array of display-compatible objects with at least { miles, pace, actualWo }.
export function resolveDayDisplay(logEntries, stravaRuns) {
  const stravaDisplay = stravaRunsToDayDisplay(stravaRuns);
  if (stravaDisplay) return { entries: [stravaDisplay], fromStrava: true };
  if (logEntries.length > 0) return { entries: logEntries, fromStrava: false };
  return { entries: [], fromStrava: false };
}

// Total miles + workout count across all plan days, Strava-first.
export function computeSeasonTotals(logEntries, stravaRunsByDate) {
  // Collect all dates that have any activity
  const allDates = new Set([
    ...logEntries.map(e => e.date),
    ...Object.keys(stravaRunsByDate),
  ]);

  let totalMiles = 0;
  let workoutCount = 0;

  for (const dateStr of allDates) {
    const miles = getDayMiles(dateStr, logEntries, stravaRunsByDate);
    if (miles > 0) {
      totalMiles += miles;
      workoutCount += 1;
    }
  }

  return { totalMiles: Math.round(totalMiles * 10) / 10, workoutCount };
}
