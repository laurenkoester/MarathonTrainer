import { WORKOUT_TYPES, inferType } from '../../utils/workoutTypes';

export default function WorkoutDetail({ workout }) {
  const type = inferType(workout);
  const { bar, fg } = WORKOUT_TYPES[type];
  const [runPart, corePart] = workout.split('|').map(s => s.trim());

  return (
    <div className="space-y-3">
      <p className="text-base font-medium leading-relaxed" style={{ color: fg }}>
        {runPart}
      </p>
      {corePart && (
        <>
          <hr className="border-border" />
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Core</p>
            <p className="text-sm text-gray-600">{corePart}</p>
          </div>
        </>
      )}
      <div className="h-1 w-12 rounded" style={{ backgroundColor: bar }} />
    </div>
  );
}
