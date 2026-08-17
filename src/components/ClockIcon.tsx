interface ClockIconProps {
  /** Fraction (0-1) of the clock face to fill, like a pie chart. Ignored if `hours` is set. */
  fraction?: number;
  /** When set (durations of an hour or more), renders a solid circle with the hour count badged in the corner instead of a pie fill. */
  hours?: number;
  size?: number;
  className?: string;
}

/**
 * A small duration indicator. For sub-hour estimates it's a clock face whose
 * fill sweeps like a pie chart; for hour-plus estimates it's a solid circle
 * with the hour count badged in the lower right corner (a pie slice isn't
 * meaningful once you're counting whole hours).
 */
export function ClockIcon({ fraction = 0, hours, size = 20, className }: ClockIconProps) {
  if (hours !== undefined) {
    const badgeSize = Math.max(11, Math.round(size * 0.56));
    return (
      <span
        className={`clock-icon clock-icon--hours${className ? ` ${className}` : ''}`}
        style={{ width: size, height: size }}
      >
        <span
          className="clock-icon__hours-count"
          style={{
            width: badgeSize,
            height: badgeSize,
            fontSize: Math.max(8, Math.round(badgeSize * 0.62)),
            right: -badgeSize * 0.2,
            bottom: -badgeSize * 0.2,
          }}
        >
          {hours}
        </span>
      </span>
    );
  }

  const clamped = Math.max(0, Math.min(1, fraction));
  const deg = clamped * 360;

  return (
    <span
      className={`clock-icon${className ? ` ${className}` : ''}`}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(currentColor ${deg}deg, var(--accent-bg) ${deg}deg 360deg)`,
      }}
    />
  );
}
