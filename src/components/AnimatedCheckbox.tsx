import { useEffect, useState, type CSSProperties } from 'react';

type SparkleStyle = CSSProperties & {
  '--sparkle-angle': string;
  '--sparkle-distance': string;
  '--sparkle-delay': string;
  '--sparkle-size': string;
  '--sparkle-color': string;
  '--sparkle-duration': string;
};

interface AnimatedCheckboxProps {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  'aria-label'?: string;
  /** How many todos are checked so far today (including this one, once
   * checked) — drives the escalating sparkle burst so later checks in the
   * day feel a little more rewarding than the first. */
  checkedCount?: number;
}

const SPARKLE_COUNT = 7;
const BASE_DURATION = 400;
const BASE_MAX_DELAY = 60;
// log1p((n-1)/LINEAR_RANGE) behaves ~linearly while (n-1) is small compared
// to LINEAR_RANGE (log1p(x) ≈ x for small x), then gradually bends into
// logarithmic flattening for larger counts — so the first few checks feel
// like a steady, predictable climb instead of an immediate log curve.
const LINEAR_RANGE = 25;
function growthFor(checkedCount: number): number {
  return Math.log1p(Math.max(0, checkedCount - 1) / LINEAR_RANGE);
}
// Instead of hand-picked multipliers, state the desired extra value at 10
// checks and derive the (integer) multiplier from that — easier to retune.
const CHECKS_MILESTONE = 10;
const GROWTH_AT_MILESTONE = growthFor(CHECKS_MILESTONE);
const EXTRA_PARTICLES_AT_MILESTONE = 25;
const EXTRA_DISTANCE_AT_MILESTONE = 100;
const EXTRA_DURATION_AT_MILESTONE = 200;
const PARTICLES_MULTIPLIER = Math.round(EXTRA_PARTICLES_AT_MILESTONE / GROWTH_AT_MILESTONE);
const DISTANCE_MULTIPLIER = Math.round(EXTRA_DISTANCE_AT_MILESTONE / GROWTH_AT_MILESTONE);
const DURATION_MULTIPLIER = Math.round(EXTRA_DURATION_AT_MILESTONE / GROWTH_AT_MILESTONE);

interface Sparkle {
  id: number;
  angle: number;
  distance: number;
  delay: number;
  size: number;
  color: string;
  duration: number;
}

// Same palette as the day-complete confetti rain, so the two celebrations
// feel like part of the same visual language.
const SPARKLE_COLORS = [
  '#ff3b30', // red
  '#ff9500', // orange
  '#ffcc00', // yellow
  '#34c759', // green
  '#00c7be', // teal
  '#007aff', // blue
  '#af52de', // violet
  '#ff2d95', // pink
];

let sparkleSeq = 0;

function createSparkles(checkedCount: number): Sparkle[] {
  // See growthFor() above: ~linear for the first several checks, then
  // gradually flattens out so the burst never feels chaotic even on a very
  // productive day.
  const growth = growthFor(checkedCount);
  const extraParticles = Math.round(PARTICLES_MULTIPLIER * growth);
  const extraDistance = Math.round(DISTANCE_MULTIPLIER * growth);
  const extraDuration = Math.round(DURATION_MULTIPLIER * growth);
  const duration = BASE_DURATION + extraDuration;
  const count = SPARKLE_COUNT + extraParticles;
  // Spread emission out over a longer window as the burst gets bigger, so a
  // big burst trickles out over time instead of firing as one static ring.
  const maxDelay = BASE_MAX_DELAY + extraParticles * 12;

  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i + (Math.random() * 20 - 10);
    return {
      id: sparkleSeq++,
      angle,
      distance: 14 + extraDistance + Math.random() * 10,
      delay: Math.random() * maxDelay,
      size: 3 + Math.random() * 3,
      color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
      duration,
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
  checkedCount = 1,
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
      setSparkles(prefersReducedMotion ? [] : createSparkles(checkedCount));
    } else {
      setSparkles([]);
    }
  }

  useEffect(() => {
    if (sparkles.length === 0) return;
    // Clear after the longest sparkle's delay + duration (plus a little
    // buffer) so the cleanup always outlasts the actual animation.
    const longest = Math.max(...sparkles.map((s) => s.delay + s.duration));
    const timeout = window.setTimeout(() => setSparkles([]), longest + 100);
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
            '--sparkle-duration': `${s.duration}ms`,
          } as SparkleStyle}
        />
      ))}
    </span>
  );
}
