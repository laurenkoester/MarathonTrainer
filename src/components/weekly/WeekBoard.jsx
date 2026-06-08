import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import DayCard, { DayCardOverlay } from './DayCard';
import { usePlan } from '../../hooks/usePlan';
import { getDateForCell, formatISO } from '../../utils/dates';

export default function WeekBoard({ wi, logs }) {
  const { plan, dispatch } = usePlan();
  const week = plan[wi];
  const [activeId, setActiveId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  const dayIds = week.d.map((_, di) => `${wi}-${di}`);

  function getLogsForDay(di) {
    const date = getDateForCell(wi, di);
    const dateStr = formatISO(date);
    return logs.filter(l => l.date === dateStr);
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const [, fromDi] = active.id.split('-').map(Number);
    const [, toDi] = over.id.split('-').map(Number);

    dispatch({ type: 'SWAP_DAYS', fromWi: wi, fromDi, toWi: wi, toDi });
    setSelectedId(null);
  }

  function handleClick(id) {
    if (selectedId === null) {
      setSelectedId(id);
    } else if (selectedId === id) {
      setSelectedId(null);
    } else {
      const [, fromDi] = selectedId.split('-').map(Number);
      const [, toDi] = id.split('-').map(Number);
      dispatch({ type: 'SWAP_DAYS', fromWi: wi, fromDi, toWi: wi, toDi });
      setSelectedId(null);
    }
  }

  const activeDi = activeId ? Number(activeId.split('-')[1]) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={dayIds} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {week.d.map((workout, di) => {
            const id = `${wi}-${di}`;
            return (
              <DayCard
                key={id}
                id={id}
                wi={wi}
                di={di}
                workout={workout}
                date={getDateForCell(wi, di)}
                logs={getLogsForDay(di)}
                isSelected={selectedId === id}
                onClick={() => handleClick(id)}
              />
            );
          })}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeId !== null && activeDi !== null && (
          <DayCardOverlay
            workout={week.d[activeDi]}
            date={getDateForCell(wi, activeDi)}
            di={activeDi}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
