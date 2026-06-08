import { useLog } from '../../hooks/useLog';

export default function StatsRow() {
  const { entries } = useLog();

  const totalMiles = entries.reduce((sum, e) => sum + (parseFloat(e.miles) || 0), 0);
  const avgEffort = entries.length
    ? (entries.reduce((sum, e) => sum + e.diff, 0) / entries.length).toFixed(1)
    : '—';
  const workoutCount = entries.length;

  const stats = [
    { label: 'Total Miles Logged', value: totalMiles.toFixed(1) },
    { label: 'Avg Effort', value: avgEffort },
    { label: 'Workouts Logged', value: workoutCount },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map(s => (
        <div key={s.label} className="rounded-xl border border-border bg-white p-5 text-center shadow-sm">
          <p className="text-3xl font-bold">{s.value}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
