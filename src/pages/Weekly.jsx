import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import WeekBoard from '../components/weekly/WeekBoard';
import WeeklyBarChart from '../components/weekly/WeeklyBarChart';
import { usePlan } from '../hooks/usePlan';
import { useLog } from '../hooks/useLog';
import { getCurrentWeekIndex, getDateForCell, formatShort } from '../utils/dates';

export default function Weekly() {
  const { plan } = usePlan();
  const { entries } = useLog();
  const defaultWi = getCurrentWeekIndex() ?? 0;
  const [wi, setWi] = useState(defaultWi);

  const week = plan[wi];
  const weekStart = getDateForCell(wi, 0);
  const weekEnd = getDateForCell(wi, 6);
  const isCurrentWeek = wi === getCurrentWeekIndex();

  return (
    <PageWrapper>
      <h1 className="font-display text-3xl tracking-widest sm:text-4xl">Weekly</h1>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setWi(w => Math.max(0, w - 1))}
          disabled={wi === 0}
          className="rounded-lg border border-border p-2 hover:bg-white disabled:opacity-30"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center">
          <p className="font-display text-2xl tracking-widest">
            Week {week.wk} · {formatShort(weekStart)}–{formatShort(weekEnd)}
          </p>
          <p className="text-sm text-muted">{week.p}</p>
          {week.t && (
            <span className="mt-1 inline-block rounded bg-accent/10 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-accent">
              {week.t}
            </span>
          )}
        </div>

        <button
          onClick={() => setWi(w => Math.min(plan.length - 1, w + 1))}
          disabled={wi === plan.length - 1}
          className="rounded-lg border border-border p-2 hover:bg-white disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className={`mt-6 rounded-xl p-4 ${isCurrentWeek ? 'border-2 border-accent' : ''}`}>
        {isCurrentWeek && (
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">Current Week</p>
        )}
        <WeekBoard wi={wi} logs={entries} />
      </div>

      <div className="mt-6">
        <WeeklyBarChart wi={wi} week={week} logs={entries} />
      </div>
    </PageWrapper>
  );
}
