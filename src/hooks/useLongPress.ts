import { useRef, useCallback } from 'react';

const isTouchEvent = (e: Event): e is TouchEvent => 'touches' in e;

export const useLongPress = (
  callback: (target: EventTarget) => void,
  { ms = 500, moveThreshold = 50 } = {}
) => {
  const timeout = useRef<NodeJS.Timeout>();
  const targetRef = useRef<EventTarget>();
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if ('button' in e && e.button === 2) {
        return;
      }
      
      targetRef.current = e.currentTarget;

      if (isTouchEvent(e.nativeEvent)) {
        touchStartPos.current = { x: e.nativeEvent.touches[0].clientX, y: e.nativeEvent.touches[0].clientY };
      } else {
        touchStartPos.current = { x: (e.nativeEvent as MouseEvent).clientX, y: (e.nativeEvent as MouseEvent).clientY };
      }
      
      timeout.current = setTimeout(() => {
        if (targetRef.current) {
          callback(targetRef.current);
        }
      }, ms);
    },
    [callback, ms]
  );

  const clear = useCallback(() => {
    timeout.current && clearTimeout(timeout.current);
    touchStartPos.current = null;
  }, []);
  
  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStartPos.current) return;

    let currentX, currentY;
    if (isTouchEvent(e.nativeEvent)) {
      if (e.nativeEvent.touches.length === 0) return;
      currentX = e.nativeEvent.touches[0].clientX;
      currentY = e.nativeEvent.touches[0].clientY;
    } else {
      currentX = (e.nativeEvent as MouseEvent).clientX;
      currentY = (e.nativeEvent as MouseEvent).clientY;
    }
    
    const moveX = Math.abs(currentX - touchStartPos.current.x);
    const moveY = Math.abs(currentY - touchStartPos.current.y);

    if (moveX > moveThreshold || moveY > moveThreshold) {
      clear();
    }
  }, [clear, moveThreshold]);


  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: (e: React.TouchEvent) => start(e),
    onTouchEnd: clear,
    onTouchMove: (e: React.TouchEvent) => handleMove(e),
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
    }
  };
};
