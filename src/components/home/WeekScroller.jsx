import { usePlan } from '../../hooks/usePlan';
import { useLog } from '../../hooks/useLog';
import { getCurrentWeekIndex, getDateForCell, formatISO } from '../../utils/dates';
import { getDayMiles } from '../../utils/activityMiles';

function getWeekActualMiles(wi, entries, runsByDate) {
  let total = 0;
  for (let di = 0; di < 7; di++) {
    total += getDayMiles(formatISO(getDateForCell(wi, di)), entries, runsByDate);
  }
  return Math.round(total * 10) / 10;
}

function WeekRow({ week, wi, actualMiles, isCurrent, isFuture }) {
  const pct = isFuture || week.m === 0 ? 0 : Math.min(100, (actualMiles / week.m) * 100);

  return (
    <div
      className={`rounded-xl border px-4 py-3 transition-all ${
        isCurrent
          ? 'border-accent bg-white shadow-sm'
          : 'border-border bg-white/60'
      } ${!isCurrent ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          {isCurrent && (
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
              This Week
            </p>
          )}
          <p className="text-sm font-semibold leading-tight">
            Wk {week.wk} · {week.p}
          </p>
          {week.t && (
            <span className="mt-0.5 inline-block text-[10px] font-bold uppercase tracking-widest text-muted">
              {week.t}
            </span>
          )}
        </div>

        <div className="shrink-0 text-right">
          {isFuture ? (
            <p className="text-sm font-bold text-muted">{week.m} mi planned</p>
          ) : (
            <>
              <p className="text-sm font-bold">
                <span className={isCurrent ? 'text-dark' : 'text-muted'}>
                  {actualMiles.toFixed(1)}
                </span>
                <span className="text-muted"> / {week.m} mi</span>
              </p>
              {isCurrent && week.m > 0 && (
                <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WeekScroller({ runsByDate = {} }) {
  const { plan } = usePlan();
  const { entries } = useLog();
  const currentWi = getCurrentWeekIndex();

  // Default to week 0 if plan hasn't started yet; clamp to last week if finished
  const wi = currentWi ?? 0;

  const rows = [
    { wi: wi - 1, label: 'last' },
    { wi,         label: 'current' },
    { wi: wi + 1, label: 'next' },
  ].filter(r => r.wi >= 0 && r.wi < plan.length);

  return (
    <div className="space-y-2">
      {rows.map(({ wi: rowWi, label }) => {
        const week = plan[rowWi];
        const isCurrent = label === 'current';
        const isFuture = label === 'next';
        const actualMiles = isFuture ? 0 : getWeekActualMiles(rowWi, entries, runsByDate);

        return (
          <WeekRow
            key={rowWi}
            week={week}
            wi={rowWi}
            actualMiles={actualMiles}
            isCurrent={isCurrent}
            isFuture={isFuture}
          />
        );
      })}
    </div>
  );
}
