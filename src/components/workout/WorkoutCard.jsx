import { WORKOUT_TYPES, inferType } from '../../utils/workoutTypes';
import WorkoutBadge from './WorkoutBadge';
import { formatShort } from '../../utils/dates';

export default function WorkoutCard({
  workout,
  date,
  isToday = false,
  isLogged = false,
  logCount = 0,
  size = 'md',
  tag = null,
  onClick,
  className = '',
}) {
  const type = inferType(workout);
  const { bar, bg, fg } = WORKOUT_TYPES[type];
  const [runPart, corePart] = workout.split('|').map(s => s.trim());

  const sizeClasses = {
    sm: 'p-3 min-h-[100px]',
    md: 'p-4 min-h-[120px]',
    lg: 'p-6 min-h-[160px]',
  };

  const textSizes = {
    sm: 'text-[10.5px] leading-snug line-clamp-3',
    md: 'text-sm leading-snug line-clamp-4',
    lg: 'text-base leading-relaxed',
  };

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-border bg-white text-left shadow-sm transition-shadow hover:shadow-md ${sizeClasses[size]} ${isToday ? 'ring-2 ring-accent' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ backgroundColor: bg }}
    >
      <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: bar }} />
      {size === 'lg' && (
        <div className="absolute left-0 top-0 h-1.5 w-full" style={{ backgroundColor: bar }} />
      )}
      {size !== 'lg' && (
        <div className="absolute left-0 top-0 h-[3px] w-full" style={{ backgroundColor: bar }} />
      )}

      <div className="relative pl-2">
        {date && size !== 'sm' && (
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-bold text-muted">{formatShort(date)}</span>
            <WorkoutBadge workout={workout} />
          </div>
        )}

        {size === 'sm' && date && (
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-bold">{formatShort(date)}</span>
          </div>
        )}

        {tag && (
          <span className="mb-2 inline-block rounded bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
            {tag}
          </span>
        )}

        <p className={`font-medium ${textSizes[size]}`} style={{ color: fg }}>
          {runPart}
        </p>

        {corePart && size !== 'sm' && (
          <>
            <hr className="my-2 border-border/60" />
            <p className="text-xs text-muted">{corePart}</p>
          </>
        )}

        {isToday && size === 'sm' && (
          <span className="absolute bottom-2 right-2 text-[10px] font-bold uppercase text-accent">today</span>
        )}
      </div>

      {isLogged && (
        <span className="absolute right-2 top-2 flex h-2.5 w-2.5 items-center justify-center">
          {logCount > 1 ? (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
              {logCount}
            </span>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          )}
        </span>
      )}
    </Tag>
  );
}
