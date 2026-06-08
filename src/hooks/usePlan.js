import { useContext } from 'react';
import { PlanContext } from '../context/PlanContext';

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
}
