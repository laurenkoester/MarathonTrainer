import { useContext } from 'react';
import { StravaContext } from '../context/StravaContext';

export function useStrava() {
  const ctx = useContext(StravaContext);
  if (!ctx) throw new Error('useStrava must be used within StravaProvider');
  return ctx;
}
