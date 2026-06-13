import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLog } from '../../hooks/useLog';
import { usePlan } from '../../hooks/usePlan';
import { getCurrentWeekIndex, getDateForCell, formatISO } from '../../utils/dates';
import { getDayMiles } from '../../utils/activityMiles';

const PHASE_COLORS = {
  Recovery: '#94A3B8',
  Adaptation: '#10B981',
  'Base Build': '#3B82F6',
  'Peak Build': '#8B5CF6',
  Taper: '#F59E0B',
  'Race Week': '#EF4444',
};

// runsByDate is passed in from the parent to avoid duplicate Strava fetches.
export default function MileageChart({ runsByDate = {} }) {
  const { entries } = useLog();
  const { plan } = usePlan();
  const currentWi = getCurrentWeekIndex();

  const data = plan.map((week, wi) => {
    let actual = 0;
    for (let di = 0; di < 7; di++) {
      actual += getDayMiles(formatISO(getDateForCell(wi, di)), entries, runsByDate);
    }
    return {
      week: `W${week.wk}`,
      planned: week.m,
      actual: Math.round(actual * 10) / 10,
      phase: week.p,
      isCurrent: wi === currentWi,
    };
  });

  return (
    // Horizontally scrollable on mobile so all 14 weeks fit without crowding
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="min-w-[640px]">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barGap={2}>
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} width={28} />
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
            <Bar dataKey="planned" fill="#E5E7EB" name="Planned" radius={[3, 3, 0, 0]} />
            <Bar dataKey="actual" name="Actual" radius={[3, 3, 0, 0]}>
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
    </div>
  );
}
