import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLog } from '../../hooks/useLog';
import { usePlan } from '../../hooks/usePlan';
import { getCurrentWeekIndex } from '../../utils/dates';

const PHASE_COLORS = {
  Recovery: '#94A3B8',
  Adaptation: '#10B981',
  'Base Build': '#3B82F6',
  'Peak Build': '#8B5CF6',
  Taper: '#F59E0B',
  'Race Week': '#EF4444',
};

export default function MileageChart() {
  const { entries } = useLog();
  const { plan } = usePlan();
  const currentWi = getCurrentWeekIndex();

  const data = plan.map((week, wi) => {
    const weekLogs = entries.filter(e => e.wk === week.wk);
    const actual = weekLogs.reduce((sum, e) => sum + (parseFloat(e.miles) || 0), 0);

    return {
      week: `W${week.wk}`,
      planned: week.m,
      actual: Math.round(actual * 10) / 10,
      phase: week.p,
      isCurrent: wi === currentWi,
    };
  });

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barGap={2}>
          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-border bg-white p-3 text-sm shadow-md">
                  <p className="font-semibold">{d.week} · {d.phase}</p>
                  <p>Planned: {d.planned} mi</p>
                  <p>Actual: {d.actual} mi</p>
                </div>
              );
            }}
          />
          <Bar dataKey="planned" fill="#E5E7EB" name="Planned" radius={[4, 4, 0, 0]} />
          <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={PHASE_COLORS[entry.phase] ?? '#10B981'}
                stroke={entry.isCurrent ? '#F97316' : 'none'}
                strokeWidth={entry.isCurrent ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
