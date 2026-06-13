import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import PageWrapper from '../components/layout/PageWrapper';
import { useLog } from '../hooks/useLog';
import { useStravaAllRuns } from '../hooks/useStravaAllRuns';
import {
  BUCKETS, buildRunsData, summarizeBucket, formatPaceDecimal, parsePaceDecimal,
} from '../utils/progressData';

// ─── helpers ────────────────────────────────────────────────────────────────

function paceYTick({ x, y, payload }) {
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill="#94A3B8" fontSize={11}>
      {formatPaceDecimal(payload.value)}
    </text>
  );
}

function PaceTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white p-3 shadow-lg text-xs">
      <p className="mb-1 font-bold text-dark">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {formatPaceDecimal(p.value)}/mi
        </p>
      ))}
    </div>
  );
}

// ─── stat card ──────────────────────────────────────────────────────────────

function StatPill({ label, value, sub }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-white px-4 py-3 shadow-sm text-center">
      <span className="font-display text-2xl tracking-wide">{value}</span>
      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted">{label}</span>
      {sub && <span className="mt-0.5 text-[10px] text-muted">{sub}</span>}
    </div>
  );
}

// ─── bucket summary card ─────────────────────────────────────────────────────

function BucketCard({ bucket, runs }) {
  const { count, avgPace, avgMiles, trend } = summarizeBucket(runs);
  const empty = count === 0;

  const trendLabel = trend == null ? null
    : trend > 0.05 ? `↑ ${formatPaceDecimal(trend)} faster`
    : trend < -0.05 ? `↓ ${formatPaceDecimal(Math.abs(trend))} slower`
    : '≈ steady';
  const trendColor = trend == null ? 'text-muted'
    : trend > 0.05 ? 'text-emerald-600'
    : trend < -0.05 ? 'text-red-500'
    : 'text-muted';

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: bucket.color }} />
        <span className="font-semibold text-sm">{bucket.label}</span>
        <span className="text-xs text-muted">{bucket.range}</span>
        {!empty && trendLabel && (
          <span className={`ml-auto text-xs font-semibold ${trendColor}`}>{trendLabel}</span>
        )}
      </div>

      {empty ? (
        <p className="mt-3 text-xs text-muted">No runs logged yet in this range.</p>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold">{count}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted">Runs</p>
          </div>
          <div>
            <p className="text-lg font-bold">{avgPace != null ? formatPaceDecimal(avgPace) : '—'}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted">Avg pace</p>
          </div>
          <div>
            <p className="text-lg font-bold">{avgMiles != null ? avgMiles.toFixed(1) : '—'}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted">Avg mi</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function Progress() {
  const { entries } = useLog();
  const { runsByDate } = useStravaAllRuns();
  const [activeFilter, setActiveFilter] = useState('all');

  const allRuns = useMemo(
    () => buildRunsData(entries, runsByDate),
    [entries, runsByDate],
  );

  // Group runs by bucket for cards
  const byBucket = useMemo(() => {
    const map = {};
    for (const b of BUCKETS) map[b.key] = [];
    for (const r of allRuns) {
      if (r.bucket && map[r.bucket]) map[r.bucket].push(r);
    }
    return map;
  }, [allRuns]);

  // Build chart data: one point per run (x = display date, y per bucket key)
  // We need all dates with at least one pace reading, across visible buckets
  const visibleBuckets = activeFilter === 'all' ? BUCKETS : BUCKETS.filter(b => b.key === activeFilter);

  const chartData = useMemo(() => {
    const runsWithPace = allRuns.filter(r =>
      r.paceDecimal != null &&
      (activeFilter === 'all' || r.bucket === activeFilter),
    );

    // Group by date string for the X axis — if same date has multiple runs just take first per bucket
    const byDate = {};
    for (const r of runsWithPace) {
      if (!byDate[r.dateStr]) byDate[r.dateStr] = { dateStr: r.dateStr, date: r.date };
      // Only set if not already set for this bucket (first run wins per day per bucket)
      if (byDate[r.dateStr][r.bucket] == null) {
        byDate[r.dateStr][r.bucket] = r.paceDecimal;
      }
    }

    return Object.values(byDate)
      .sort((a, b) => a.date - b.date)
      .map(d => ({
        ...d,
        label: d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }));
  }, [allRuns, activeFilter]);

  // Y-axis domain: a bit of padding around the actual pace range
  const allPaceValues = chartData.flatMap(d =>
    BUCKETS.map(b => d[b.key]).filter(v => v != null),
  );
  const minPace = allPaceValues.length ? Math.min(...allPaceValues) - 0.5 : 7;
  const maxPace = allPaceValues.length ? Math.max(...allPaceValues) + 0.5 : 12;

  const totalRuns = allRuns.length;
  const totalMiles = allRuns.reduce((s, r) => s + r.miles, 0);
  const runsWithPace = allRuns.filter(r => r.paceDecimal != null);
  const overallAvgPace = runsWithPace.length
    ? runsWithPace.reduce((s, r) => s + r.paceDecimal, 0) / runsWithPace.length
    : null;

  const hasData = allRuns.length > 0;

  return (
    <PageWrapper>
      <h1 className="font-display text-3xl tracking-widest sm:text-4xl">Progress</h1>
      <p className="mt-0.5 text-sm text-muted">Pace trends across your training block</p>

      {/* Season summary pills */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <StatPill label="Runs" value={totalRuns} />
        <StatPill label="Total miles" value={totalMiles.toFixed(0)} />
        <StatPill label="Avg pace" value={overallAvgPace != null ? formatPaceDecimal(overallAvgPace) : '—'} />
      </div>

      {/* Filter chips */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
            activeFilter === 'all'
              ? 'border-dark bg-dark text-white'
              : 'border-border bg-white text-muted hover:text-dark'
          }`}
        >
          All runs
        </button>
        {BUCKETS.map(b => (
          <button
            key={b.key}
            onClick={() => setActiveFilter(b.key)}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === b.key
                ? 'border-transparent text-white'
                : 'border-border bg-white text-muted hover:text-dark'
            }`}
            style={activeFilter === b.key ? { backgroundColor: b.color, borderColor: b.color } : {}}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: activeFilter === b.key ? 'white' : b.color }}
            />
            {b.label} <span className="opacity-70">{b.range}</span>
          </button>
        ))}
      </div>

      {/* Pace over time chart */}
      <div className="mt-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Pace over time</p>

        {!hasData ? (
          <p className="py-10 text-center text-sm text-muted">No runs logged yet — connect Strava or log a run to see your trends.</p>
        ) : chartData.length < 2 ? (
          <p className="py-10 text-center text-sm text-muted">Log at least 2 runs with pace to see a trend line.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minPace, maxPace]}
                tick={paceYTick}
                tickLine={false}
                axisLine={false}
                width={36}
                reversed
              />
              <Tooltip content={<PaceTooltip />} />
              {visibleBuckets.map(b => (
                <Line
                  key={b.key}
                  type="monotone"
                  dataKey={b.key}
                  name={`${b.label} (${b.range})`}
                  stroke={b.color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: b.color, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
        <p className="mt-2 text-center text-[10px] text-muted">Lower = faster pace · Y-axis is min/mi</p>
      </div>

      {/* Per-bucket summary cards */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">By distance</p>
        <div className="space-y-3">
          {BUCKETS.map(b => (
            <BucketCard key={b.key} bucket={b} runs={byBucket[b.key] ?? []} />
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
