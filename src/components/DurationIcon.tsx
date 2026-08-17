import { ClockIcon } from './ClockIcon';
import { clockFraction } from '../duration';

interface DurationIconProps {
  minutes: number;
  size?: number;
  className?: string;
}

/** Picks the right visual for a duration: pie clock at/under an hour, hour-count badge over an hour. */
export function DurationIcon({ minutes, size = 20, className }: DurationIconProps) {
  if (minutes > 60) {
    return <ClockIcon hours={minutes / 60} size={size} className={className} />;
  }
  return <ClockIcon fraction={clockFraction(minutes)} size={size} className={className} />;
}
