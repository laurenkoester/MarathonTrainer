import { useState } from 'react';
import LogForm from './LogForm';
import { useLog } from '../../hooks/useLog';

export default function LogEntryEdit({ entry, plannedWorkout, date, onDone }) {
  const { dispatch } = useLog();
  const [editing, setEditing] = useState(true);

  if (!editing) return null;

  return (
    <LogForm
      plannedWorkout={plannedWorkout ?? entry.wo}
      date={date ?? new Date(entry.date + 'T00:00:00')}
      wk={entry.wk}
      initialValues={entry}
      compact
      onSubmit={(updated) => {
        dispatch({
          type: 'EDIT_ENTRY',
          id: entry.id,
          updates: updated,
        });
        onDone?.();
        setEditing(false);
      }}
    />
  );
}
