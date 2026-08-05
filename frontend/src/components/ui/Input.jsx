import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const base =
  'w-full bg-surface text-text placeholder:text-faint border border-line rounded-lg ' +
  'transition-colors focus:outline-none focus:border-accent ' +
  'focus:ring-2 focus:ring-accent/25 disabled:opacity-50';

/** Text input. size: sm|md|lg */
export const Input = forwardRef(function Input({ size = 'md', className, ...props }, ref) {
  const h = size === 'sm' ? 'h-7 text-[12px] px-2.5' : size === 'lg' ? 'h-9 text-sm px-3.5' : 'h-8 text-[13px] px-3';
  return <input ref={ref} className={cn(base, h, className)} {...props} />;
});

/** Multi-line input. */
export const Textarea = forwardRef(function Textarea({ className, rows = 4, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={cn(base, 'py-2 px-3 text-[13px] leading-relaxed resize-y', className)} {...props} />;
});

export default Input;
