export function formatMiles(n) {
  if (n == null || n === 0) return '0';
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

export default function WeekTotal({ planned, actual, planWeek = null }) {
  const hasActual = actual > 0;

  return (
    <div className="flex min-h-[110px] flex-col justify-center rounded-lg border border-border bg-white p-2 text-center md:min-h-[130px]">
      {planWeek != null && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
          W{planWeek}
        </p>
      )}
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
        Total
      </p>
      {hasActual ? (
        <>
          <p className="mt-1 text-sm font-bold text-emerald-700">
            {formatMiles(actual)} mi
          </p>
          <p className="text-[10px] text-muted">
            {formatMiles(planned)} planned
          </p>
        </>
      ) : (
        <p className="mt-1 text-sm font-bold text-dark">
          {formatMiles(planned)} mi
        </p>
      )}
    </div>
  );
}
