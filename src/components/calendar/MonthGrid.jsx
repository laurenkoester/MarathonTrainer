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
import { eachDayOfInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import CalendarDay, { CalendarDayOverlay } from './CalendarDay';
import WeekTotal from './WeekTotal';
import { getCellForDate, formatISO, DAY_NAMES, getCurrentWeekIndex } from '../../utils/dates';
import { parsePlannedDistance } from '../../utils/workoutTypes';
import { getDayMiles } from '../../utils/activityMiles';
import { usePlan } from '../../hooks/usePlan';
import { INITIAL_PLAN } from '../../data/plan';

function parseDragId(id) {
  const [wi, di] = id.split('-').map(Number);
  return { wi, di };
}

function chunkWeeks(days) {
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function getWeekTotals(weekDays, logs, stravaRunsByDate) {
  let planned = 0;
  let actual = 0;

  for (const day of weekDays) {
    const cell = getCellForDate(day);
    const dateStr = formatISO(day);
    if (cell) {
      // Always use INITIAL_PLAN so edits/swaps don't change the goal mileage column
      const workout = INITIAL_PLAN[cell.wi]?.d[cell.di];
      planned += parsePlannedDistance(workout) || 0;
    }
    actual += getDayMiles(dateStr, logs, stravaRunsByDate);
  }

  return { planned, actual };
}

function getPlanWeekNumber(weekDays) {
  const wis = weekDays.map(d => getCellForDate(d)?.wi).filter(w => w != null);
  if (!wis.length || !wis.every(w => w === wis[0])) return null;
  return wis[0] + 1;
}

export default function MonthGrid({ month, logs, stravaRunsByDate = {}, editMode = false, onDayClick }) {
  const { plan, dispatch } = usePlan();
  const [activeId, setActiveId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 700, tolerance: 5 } }),
  );

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weeks = chunkWeeks(days);

  function getLogsForDate(dateStr) {
    return logs.filter(l => l.date === dateStr);
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
    setSelectedId(null);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const from = parseDragId(active.id);
    const to = parseDragId(over.id);

    dispatch({
      type: 'SWAP_DAYS',
      fromWi: from.wi,
      fromDi: from.di,
      toWi: to.wi,
      toDi: to.di,
    });
  }

  function handleDayClick(day, cell, workout) {
    if (editMode) {
      const id = `${cell.wi}-${cell.di}`;
      if (selectedId === null) {
        setSelectedId(id);
      } else if (selectedId === id) {
        setSelectedId(null);
      } else {
        const from = parseDragId(selectedId);
        dispatch({
          type: 'SWAP_DAYS',
          fromWi: from.wi,
          fromDi: from.di,
          toWi: cell.wi,
          toDi: cell.di,
        });
        setSelectedId(null);
      }
      return;
    }
    onDayClick?.(day, cell, workout);
  }

  const activeCell = activeId ? parseDragId(activeId) : null;
  const activeWorkout = activeCell ? plan[activeCell.wi].d[activeCell.di] : null;
  const activeDate = activeCell
    ? days.find(d => {
        const c = getCellForDate(d);
        return c?.wi === activeCell.wi && c?.di === activeCell.di;
      })
    : null;

  const grid = (
    <div>
      <div className="mb-2 grid grid-cols-[repeat(7,minmax(0,1fr))_2.5rem] gap-1 md:grid-cols-[repeat(7,minmax(0,1fr))_4.5rem]">
        {DAY_NAMES.map(d => (
          <div key={d} className="py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted md:py-2 md:text-xs">
            {d.slice(0, 1)}<span className="hidden sm:inline">{d.slice(1)}</span>
          </div>
        ))}
        <div className="py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted md:py-2 md:text-xs">
          <span className="hidden md:inline">Week</span>
          <span className="md:hidden">W</span>
        </div>
      </div>

      <div className="space-y-1">
        {weeks.map((weekDays, weekIndex) => {
          const totals = getWeekTotals(weekDays, logs, stravaRunsByDate);
          const planWeek = getPlanWeekNumber(weekDays);
          const currentWi = getCurrentWeekIndex();
          const isCurrent = planWeek != null && currentWi != null && planWeek === currentWi + 1;

          return (
            <div
              key={weekIndex}
              className="grid grid-cols-[repeat(7,minmax(0,1fr))_2.5rem] gap-1 md:grid-cols-[repeat(7,minmax(0,1fr))_4.5rem]"
            >
              {weekDays.map(day => {
                const cell = getCellForDate(day);
                const dateStr = formatISO(day);
                const workout = cell ? plan[cell.wi].d[cell.di] : null;
                const inPlan = cell !== null && isSameMonth(day, month);
                const dragId = cell ? `${cell.wi}-${cell.di}` : null;

                return (
                  <CalendarDay
                    key={dateStr}
                    date={day}
                    workout={workout}
                    logs={getLogsForDate(dateStr)}
                    stravaRuns={stravaRunsByDate[dateStr] ?? []}
                    inPlan={inPlan}
                    wi={cell?.wi}
                    di={cell?.di}
                    editMode={editMode}
                    dragId={inPlan ? dragId : null}
                    isSelected={editMode && selectedId === dragId}
                    onClick={() => cell && inPlan && handleDayClick(day, cell, workout)}
                  />
                );
              })}
              <WeekTotal
                planned={totals.planned}
                actual={totals.actual}
                planWeek={planWeek}
                isCurrent={isCurrent}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!editMode) return grid;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {grid}
      <DragOverlay dropAnimation={null}>
        {activeId && activeWorkout && activeDate && (
          <CalendarDayOverlay
            date={activeDate}
            workout={activeWorkout}
            logs={getLogsForDate(formatISO(activeDate))}
            stravaRuns={stravaRunsByDate[formatISO(activeDate)] ?? []}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
