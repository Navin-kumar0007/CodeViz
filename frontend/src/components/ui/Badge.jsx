import { cn } from '../../utils/cn';

const TONES = {
  neutral: 'text-muted bg-elevated border-line',
  accent: 'text-accent bg-accent/12 border-accent/35',
  success: 'text-success bg-success/12 border-success/35',
  warning: 'text-warning bg-warning/12 border-warning/35',
  danger: 'text-danger bg-danger/12 border-danger/35',
  info: 'text-info bg-info/12 border-info/35',
};

/** Small status pill. tone: neutral|accent|success|warning|danger|info */
export function Badge({ tone = 'neutral', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none',
        TONES[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

const DIFF = {
  easy: 'text-easy bg-easy/12 border-easy/35',
  medium: 'text-medium bg-medium/12 border-medium/35',
  hard: 'text-hard bg-hard/12 border-hard/35',
};

/** LeetCode-style difficulty badge. level: easy|medium|hard */
export function DifficultyBadge({ level = 'easy', className, ...props }) {
  const key = String(level).toLowerCase();
  const label = key.charAt(0).toUpperCase() + key.slice(1);
  return (
    <span
      className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none', DIFF[key] || DIFF.easy, className)}
      {...props}
    >
      {label}
    </span>
  );
}

export default Badge;
