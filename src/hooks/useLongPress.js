import { useRef, useCallback } from 'react';

const MOVE_THRESHOLD = 10; // px — movement beyond this cancels the long-press

export function useLongPress(callback, delay = 500) {
  const timer = useRef(null);
  const startPos = useRef(null);
  const fired = useRef(false);

  const start = useCallback((e) => {
    const touch = e.touches?.[0] ?? e;
    startPos.current = { x: touch.clientX, y: touch.clientY };
    fired.current = false;
    timer.current = setTimeout(() => {
      fired.current = true;
      callback();
    }, delay);
  }, [callback, delay]);

  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const move = useCallback((e) => {
    if (!startPos.current || !timer.current) return;
    const touch = e.touches?.[0] ?? e;
    const dx = touch.clientX - startPos.current.x;
    const dy = touch.clientY - startPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) {
      cancel();
    }
  }, [cancel]);

  // Prevent the tap onClick from firing after a long-press
  const preventClickIfFired = useCallback((e) => {
    if (fired.current) {
      e.stopPropagation();
      fired.current = false;
    }
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: move,
    onClick: preventClickIfFired,
    // Desktop: right-click opens the modal
    onContextMenu: useCallback((e) => {
      e.preventDefault();
      callback();
    }, [callback]),
  };
}
