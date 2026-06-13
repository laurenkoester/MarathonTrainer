export function formatMiles(n) {
  if (n == null || n === 0) return '0';
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

export default function WeekTotal({ planned, actual, planWeek = null, isCurrent = false }) {
  const hasActual = actual > 0;

  return (
    <div className="flex min-h-[56px] flex-col justify-center rounded-lg border border-border bg-white p-1.5 text-center md:min-h-[110px] md:p-2 md:min-h-[130px]">
      {planWeek != null && (
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted md:text-[10px]">
          W{planWeek}
        </p>
      )}
      <p className="hidden text-[10px] font-bold uppercase tracking-widest text-muted md:block">
        Total
      </p>

      {isCurrent && hasActual ? (
        <>
          <p className="text-[10px] font-bold text-emerald-600 md:mt-1 md:text-sm">
            {formatMiles(actual)}
          </p>
          <p className="text-[9px] text-dark md:text-[10px]">
            {formatMiles(planned)}
          </p>
        </>
      ) : hasActual ? (
        <>
          <p className="text-[10px] font-bold text-emerald-700 md:mt-1 md:text-sm">
            {formatMiles(actual)}
          </p>
          <p className="hidden text-[10px] text-muted md:block">
            {formatMiles(planned)} planned
          </p>
        </>
      ) : (
        <p className="text-[10px] font-bold text-dark md:mt-1 md:text-sm">
          {formatMiles(planned)}
        </p>
      )}
    </div>
  );
}
