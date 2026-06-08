import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { parsePlannedMiles } from '../../utils/workoutTypes';
import { DAY_NAMES, getDateForCell, formatISO } from '../../utils/dates';

export default function WeeklyBarChart({ wi, week, logs }) {
  const data = week.d.map((workout, di) => {
    const dateStr = formatISO(getDateForCell(wi, di));
    const dayLogs = logs.filter(l => l.date === dateStr);
    const actual = dayLogs.reduce((sum, l) => sum + (parseFloat(l.miles) || 0), 0);

    return {
      day: DAY_NAMES[di],
      planned: parsePlannedMiles(workout),
      actual: Math.round(actual * 10) / 10,
    };
  });

  const totalPlanned = data.reduce((s, d) => s + d.planned, 0);
  const totalActual = data.reduce((s, d) => s + d.actual, 0);

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4}>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="planned" fill="#D1D5DB" name="Planned" radius={[4, 4, 0, 0]} />
          <Bar dataKey="actual" fill="#10B981" name="Actual" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-sm text-muted">
        {totalPlanned} mi planned · {totalActual} mi logged
      </p>
    </div>
  );
}
