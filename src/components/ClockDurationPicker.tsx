import { useEffect, useRef, useState } from 'react';
import { DURATION_OPTIONS, angleForIndex, formatDuration, type DurationMinutes } from '../duration';
import { DurationIcon } from './DurationIcon';
import { useLocale } from '../i18n/useLocale';

const DIAL_SIZE = 220;
const MARK_RADIUS = 82;
const HAND_LENGTH = 66;

interface ClockDurationPickerProps {
  value: number;
  onChange: (minutes: DurationMinutes) => void;
  /** 'button' = icon-only add-todo trigger (default). 'badge' = renders as the
   * existing todo-item duration badge (icon + label) so it can double as the
   * edit trigger for an existing todo. */
  variant?: 'button' | 'badge';
}

export function ClockDurationPicker({ value, onChange, variant = 'button' }: ClockDurationPickerProps) {
  const [open, setOpen] = useState(false);
  const dialRef = useRef<HTMLDivElement | null>(null);
  const { t } = useLocale();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const selectedIndex = Math.max(
    0,
    DURATION_OPTIONS.findIndex((m) => m === value),
  );

  const selectFromPointer = (clientX: number, clientY: number) => {
    const dial = dialRef.current;
    if (!dial) return;
    const rect = dial.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    // Angle clockwise from 12 o'clock (0deg = up).
    let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    const step = 360 / DURATION_OPTIONS.length;
    const index = Math.round(angle / step) % DURATION_OPTIONS.length;
    onChange(DURATION_OPTIONS[index]);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    selectFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    selectFromPointer(e.clientX, e.clientY);
  };

  const handleDialKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(DURATION_OPTIONS[(selectedIndex + 1) % DURATION_OPTIONS.length]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(DURATION_OPTIONS[(selectedIndex - 1 + DURATION_OPTIONS.length) % DURATION_OPTIONS.length]);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  const handAngle = angleForIndex(selectedIndex);

  return (
    <>
      <button
        type="button"
        className={
          variant === 'badge' ? 'todo-item__duration todo-item__duration--editable' : 'duration-picker__trigger'
        }
        aria-label={`${t.durationLabelAria}: ${formatDuration(value, t)}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <DurationIcon minutes={value} size={variant === 'badge' ? 14 : 22} />
        {variant === 'badge' && formatDuration(value, t)}
      </button>

      {open && (
        <div className="duration-picker__backdrop" onClick={handleBackdropClick}>
          <div className="duration-picker__panel" role="dialog" aria-label={t.durationPickerTitle}>
            <p className="duration-picker__title">{t.durationPickerTitle}</p>

            <div
              className="duration-picker__dial"
              ref={dialRef}
              style={{ width: DIAL_SIZE, height: DIAL_SIZE }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              tabIndex={0}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={DURATION_OPTIONS.length - 1}
              aria-valuenow={selectedIndex}
              aria-valuetext={formatDuration(value, t)}
              onKeyDown={handleDialKeyDown}
            >
              {DURATION_OPTIONS.map((minutes, i) => {
                const angle = angleForIndex(i);
                const rad = (angle * Math.PI) / 180;
                const x = DIAL_SIZE / 2 + MARK_RADIUS * Math.sin(rad);
                const y = DIAL_SIZE / 2 - MARK_RADIUS * Math.cos(rad);
                return (
                  <span
                    key={minutes}
                    className={`duration-picker__mark${minutes === value ? ' duration-picker__mark--selected' : ''}`}
                    style={{ left: x, top: y }}
                  >
                    {formatDuration(minutes, t)}
                  </span>
                );
              })}

              <span
                className="duration-picker__hand"
                style={{ height: HAND_LENGTH, marginTop: -HAND_LENGTH, transform: `rotate(${handAngle}deg)` }}
              />
              <span className="duration-picker__center" />
            </div>

            <button type="button" className="duration-picker__done" onClick={() => setOpen(false)}>
              {t.durationPickerDone}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
