import { stravaRunsToDayDisplay } from './stravaApi';

// Distance buckets
export const BUCKETS = [
  { key: 'short',  label: 'Short',  range: '0–4 mi',  min: 0,  max: 4,   color: '#10B981' },
  { key: 'medium', label: 'Medium', range: '5–9 mi',  min: 5,  max: 9,   color: '#3B82F6' },
  { key: 'long',   label: 'Long',   range: '10+ mi',  min: 10, max: Infinity, color: '#8B5CF6' },
];

export function getBucket(miles) {
  const m = parseFloat(miles) || 0;
  return BUCKETS.find(b => m >= b.min && m <= b.max) ?? null;
}

// Parse "9:45" → 9.75 (decimal minutes). Returns null if unparseable.
export function parsePaceDecimal(paceStr) {
  if (!paceStr) return null;
  const match = String(paceStr).match(/^(\d+):(\d{2})$/);
  if (!match) return null;
  return parseInt(match[1], 10) + parseInt(match[2], 10) / 60;
}

// Format decimal minutes back to "9:45"
export function formatPaceDecimal(dec) {
  if (dec == null) return '—';
  const mins = Math.floor(dec);
  const secs = Math.round((dec - mins) * 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// Build the unified runs array from manual logs + Strava cache.
// Each item: { date, miles, paceStr, paceDecimal, bucket, source, label }
export function buildRunsData(logEntries, runsByDate) {
  const runs = [];

  // Collect all dates with activity
  const allDates = new Set([
    ...logEntries.map(e => e.date),
    ...Object.keys(runsByDate),
  ]);

  for (const dateStr of allDates) {
    const stravaDisplay = stravaRunsToDayDisplay(runsByDate[dateStr]);

    if (stravaDisplay) {
      const miles = parseFloat(stravaDisplay.miles) || 0;
      const bucket = getBucket(miles);
      if (!bucket || miles <= 0) continue;
      const paceDecimal = parsePaceDecimal(stravaDisplay.pace);
      runs.push({
        dateStr,
        date: new Date(dateStr),
        miles,
        paceStr: stravaDisplay.pace ?? null,
        paceDecimal,
        bucket: bucket.key,
        source: 'strava',
        label: stravaDisplay.stravaName ?? 'Strava run',
      });
    } else {
      // Manual logs for this date — one entry per log (no deduplication needed here)
      const dayLogs = logEntries.filter(e => e.date === dateStr);
      for (const entry of dayLogs) {
        const miles = parseFloat(entry.miles) || 0;
        const bucket = getBucket(miles);
        if (!bucket || miles <= 0) continue;
        const paceDecimal = parsePaceDecimal(entry.pace);
        runs.push({
          dateStr,
          date: new Date(dateStr),
          miles,
          paceStr: entry.pace ?? null,
          paceDecimal,
          bucket: bucket.key,
          source: 'manual',
          label: entry.actualWo ?? entry.wo ?? 'Manual log',
        });
      }
    }
  }

  // Sort chronologically
  runs.sort((a, b) => a.date - b.date);
  return runs;
}

// Summarize a bucket's runs: avg pace, avg miles, count, pace trend (first half vs second half)
export function summarizeBucket(runs) {
  const withPace = runs.filter(r => r.paceDecimal != null);
  const avgPace = withPace.length
    ? withPace.reduce((s, r) => s + r.paceDecimal, 0) / withPace.length
    : null;
  const avgMiles = runs.length
    ? runs.reduce((s, r) => s + r.miles, 0) / runs.length
    : null;

  // Trend: compare avg pace of first half vs second half
  let trend = null;
  if (withPace.length >= 4) {
    const mid = Math.floor(withPace.length / 2);
    const firstHalf = withPace.slice(0, mid);
    const secondHalf = withPace.slice(mid);
    const avgFirst = firstHalf.reduce((s, r) => s + r.paceDecimal, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, r) => s + r.paceDecimal, 0) / secondHalf.length;
    trend = avgFirst - avgSecond; // positive = got faster
  }

  return { count: runs.length, avgPace, avgMiles, trend };
}
