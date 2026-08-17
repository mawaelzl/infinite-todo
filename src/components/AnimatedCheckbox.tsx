import { useEffect, useState, type CSSProperties } from 'react';

type SparkleStyle = CSSProperties & {
  '--sparkle-angle': string;
  '--sparkle-distance': string;
  '--sparkle-delay': string;
  '--sparkle-size': string;
  '--sparkle-color': string;
};

interface AnimatedCheckboxProps {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  'aria-label'?: string;
}

const SPARKLE_COUNT = 7;

interface Sparkle {
  id: number;
  angle: number;
  distance: number;
  delay: number;
  size: number;
  color: string;
}

const SPARKLE_COLORS = ['var(--accent)', '#ffd166', '#ef476f', '#06d6a0', '#118ab2'];

let sparkleSeq = 0;

function createSparkles(): Sparkle[] {
  return Array.from({ length: SPARKLE_COUNT }, (_, i) => {
    const angle = (360 / SPARKLE_COUNT) * i + (Math.random() * 20 - 10);
    return {
      id: sparkleSeq++,
      angle,
      distance: 14 + Math.random() * 10,
      delay: Math.random() * 60,
      size: 3 + Math.random() * 3,
      color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
    };
  });
}

/**
 * Custom checkbox: keeps a real (visually hidden) input for accessibility,
 * animates an SVG checkmark drawing in, bounces on check, and briefly
 * sparkles when transitioning from unchecked -> checked.
 */
export function AnimatedCheckbox({
  checked,
  disabled,
  onChange,
  'aria-label': ariaLabel,
}: AnimatedCheckboxProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [prevChecked, setPrevChecked] = useState(checked);

  // Render-phase state adjustment (React-recommended pattern) instead of an
  // effect: detect the unchecked -> checked transition and spawn sparkles
  // without an extra render pass.
  if (checked !== prevChecked) {
    setPrevChecked(checked);
    if (checked) {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setSparkles(prefersReducedMotion ? [] : createSparkles());
    } else {
      setSparkles([]);
    }
  }

  useEffect(() => {
    if (sparkles.length === 0) return;
    const timeout = window.setTimeout(() => setSparkles([]), 700);
    return () => window.clearTimeout(timeout);
  }, [sparkles]);

  return (
    <span className="animated-checkbox">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={ariaLabel}
        className="animated-checkbox__input"
      />
      <span
        className={`animated-checkbox__box${checked ? ' animated-checkbox__box--checked' : ''}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="animated-checkbox__check">
          <path d="M5 12.5L10 17.5L19 6.5" />
        </svg>
      </span>
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="animated-checkbox__sparkle"
          aria-hidden="true"
          style={{
            '--sparkle-angle': `${s.angle}deg`,
            '--sparkle-distance': `${s.distance}px`,
            '--sparkle-delay': `${s.delay}ms`,
            '--sparkle-size': `${s.size}px`,
            '--sparkle-color': s.color,
          } as SparkleStyle}
        />
      ))}
    </span>
  );
}
