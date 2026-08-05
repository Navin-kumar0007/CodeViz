import { cn } from '../../utils/cn';

/** Spinner. size in px. */
export function Spinner({ size = 18, className }) {
  return (
    <span
      className={cn('inline-block rounded-full animate-spin align-[-2px]', className)}
      style={{
        width: size, height: size,
        border: `2px solid color-mix(in srgb, var(--cz-accent) 25%, transparent)`,
        borderTopColor: 'var(--cz-accent)',
      }}
      role="status"
      aria-label="Loading"
    />
  );
}

/** Skeleton placeholder block. */
export function Skeleton({ className, style }) {
  return (
    <span
      className={cn('block rounded-md animate-pulse bg-elevated', className)}
      style={style}
      aria-hidden="true"
    />
  );
}

/** Keyboard key hint. */
export function Kbd({ children, className }) {
  return (
    <kbd className={cn('inline-flex items-center h-5 min-w-5 px-1.5 rounded border border-line bg-elevated text-faint text-[11px] font-mono', className)}>
      {children}
    </kbd>
  );
}

/** Empty state. */
export function EmptyState({ icon = '📭', title, hint, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center gap-2 py-12', className)}>
      <div className="text-3xl opacity-70">{icon}</div>
      <div className="text-text font-semibold text-sm">{title}</div>
      {hint && <div className="text-muted text-[13px] max-w-sm">{hint}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
