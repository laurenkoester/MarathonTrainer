export const WORKOUT_TYPES = {
  rest:      { bar: '#94A3B8', bg: '#F8FAFC', fg: '#475569', label: 'Rest',      dot: '⬜' },
  nationals: { bar: '#60A5FA', bg: '#EFF6FF', fg: '#1E40AF', label: 'Nationals', dot: '🔵' },
  easy:      { bar: '#10B981', bg: '#F0FDF9', fg: '#065F46', label: 'Easy Run',  dot: '🟢' },
  long:      { bar: '#3B82F6', bg: '#EFF6FF', fg: '#1E3A8A', label: 'Long Run',  dot: '🔵' },
  tempo:     { bar: '#F97316', bg: '#FFF7ED', fg: '#C2410C', label: 'Tempo',     dot: '🟠' },
  mp:        { bar: '#8B5CF6', bg: '#F5F3FF', fg: '#5B21B6', label: 'MP Run',    dot: '🟣' },
  strength:  { bar: '#EAB308', bg: '#FEFCE8', fg: '#854D0E', label: 'Strength',  dot: '🟡' },
  race:      { bar: '#EF4444', bg: '#FFF1F2', fg: '#991B1B', label: 'Race Day',  dot: '🔴' },
};

export function inferType(workout) {
  const t = workout.toLowerCase();
  if (t.includes('race day')) return 'race';
  if (t.includes('nationals')) return 'nationals';
  if (t === 'rest') return 'rest';
  if (t.includes('strength')) return 'strength';
  if (t.includes('long run')) return 'long';
  if (t.includes('@mp')) return 'mp';
  if (t.includes('tempo') || t.includes('threshold')) return 'tempo';
  return 'easy';
}

export function parsePlannedMiles(workout) {
  const runPart = workout.split('|')[0].trim().toLowerCase();
  if (runPart === 'rest' || runPart.includes('nationals')) return 0;
  if (runPart.includes('strength') && !/\d+\s+mi\b/.test(runPart)) return 0;
  const matches = [...runPart.matchAll(/(\d+(?:\.\d+)?)\s+mi\b/g)];
  if (!matches.length) return 0;
  return matches.reduce((sum, m) => sum + parseFloat(m[1]), 0);
}

export function parsePlannedDistance(workout) {
  const runPart = workout.split('|')[0].trim().toLowerCase();
  if (runPart === 'rest' || runPart.includes('nationals')) return null;
  if (runPart.includes('race day')) return 26.2;
  if (runPart.includes('strength') && !/\d+\s+mi\b/.test(runPart)) return null;
  const match = runPart.match(/(\d+(?:\.\d+)?)\s+mi\b/);
  return match ? parseFloat(match[1]) : null;
}

export function parsePlannedPace(workout) {
  const runPart = workout.split('|')[0].trim();
  const paceMatch = runPart.match(/\(([\d:]+\s*[–-]\s*[\d:]+\s*\/\s*mi|[\d:]+\s*\/\s*mi)\)/i);
  if (!paceMatch) return null;
  return paceMatch[1].replace(/\s+/g, '');
}
