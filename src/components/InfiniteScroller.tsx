import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Todo } from '../types';
import { offsetKey } from '../storage';
import { DayCard } from './DayCard';

const INITIAL_PAST_DAYS = 14;
const INITIAL_FUTURE_DAYS = 14;
const LOAD_MORE_STEP = 14;
const EDGE_THRESHOLD_PX = 600;
const TODAY_SCROLL_GAP_PX = 24;

interface InfiniteScrollerProps {
  getTodos: (dateKey: string) => Todo[];
  onAdd: (dateKey: string, text: string, durationMinutes?: number) => void;
  onToggle: (dateKey: string, id: string) => void;
  onDelete: (dateKey: string, id: string) => void;
  onUpdateDuration: (dateKey: string, id: string, durationMinutes: number) => void;
}

export function InfiniteScroller({
  getTodos,
  onAdd,
  onToggle,
  onDelete,
  onUpdateDuration,
}: InfiniteScrollerProps) {
  const [minOffset, setMinOffset] = useState(-INITIAL_PAST_DAYS);
  const [maxOffset, setMaxOffset] = useState(INITIAL_FUTURE_DAYS);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const todayCardRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledToToday = useRef(false);
  const prevMinOffset = useRef(minOffset);
  const prevScrollHeight = useRef(0);

  // Scroll today's card into view on first mount, leaving a small gap above
  // it instead of pinning it flush to the top edge (scrollIntoView otherwise
  // scrolls straight past the container's top padding).
  useEffect(() => {
    const container = containerRef.current;
    const card = todayCardRef.current;
    if (!hasScrolledToToday.current && container && card) {
      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const delta = cardRect.top - containerRect.top;
      container.scrollTop += delta - TODAY_SCROLL_GAP_PX;
      hasScrolledToToday.current = true;
    }
  }, []);

  // Preserve scroll position when new days are prepended above the viewport.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (minOffset < prevMinOffset.current) {
      const delta = container.scrollHeight - prevScrollHeight.current;
      container.scrollTop += delta;
    }
    prevMinOffset.current = minOffset;
  }, [minOffset]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    prevScrollHeight.current = container.scrollHeight;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop < EDGE_THRESHOLD_PX) {
      setMinOffset((m) => m - LOAD_MORE_STEP);
    }
    if (scrollHeight - (scrollTop + clientHeight) < EDGE_THRESHOLD_PX) {
      setMaxOffset((m) => m + LOAD_MORE_STEP);
    }
  }, []);

  const offsets: number[] = [];
  for (let o = minOffset; o <= maxOffset; o++) offsets.push(o);

  return (
    <div className="scroller" ref={containerRef} onScroll={handleScroll}>
      {offsets.map((offset) => {
        const dateKey = offsetKey(offset);
        return (
          <div
            key={dateKey}
            className="scroller__item"
            ref={offset === 0 ? todayCardRef : undefined}
          >
            <DayCard
              dateKey={dateKey}
              todos={getTodos(dateKey)}
              onAdd={(text, durationMinutes) => onAdd(dateKey, text, durationMinutes)}
              onToggle={(id) => onToggle(dateKey, id)}
              onDelete={(id) => onDelete(dateKey, id)}
              onUpdateDuration={(id, durationMinutes) => onUpdateDuration(dateKey, id, durationMinutes)}
            />
          </div>
        );
      })}
    </div>
  );
}
