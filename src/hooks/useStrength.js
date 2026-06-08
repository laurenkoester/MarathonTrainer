import { useContext } from 'react';
import { StrengthContext } from '../context/StrengthContext';

export function useStrength() {
  const ctx = useContext(StrengthContext);
  if (!ctx) throw new Error('useStrength must be used within StrengthProvider');
  return ctx;
}
