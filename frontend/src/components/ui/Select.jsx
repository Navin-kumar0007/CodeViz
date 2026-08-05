import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

/** Styled native select (accessible, zero-dep). Pass <option>s as children. */
export const Select = forwardRef(function Select({ size = 'md', className, children, ...props }, ref) {
  const h = size === 'sm' ? 'h-7 text-[12px] pl-2.5' : size === 'lg' ? 'h-9 text-sm pl-3.5' : 'h-8 text-[13px] pl-3';
  return (
    <div className="relative inline-flex w-full">
      <select
        ref={ref}
        className={cn(
          'w-full appearance-none bg-surface text-text border border-line rounded-lg pr-8',
          'transition-colors focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25',
          'disabled:opacity-50 cursor-pointer',
          h,
          className
        )}
        {...props}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-faint text-[10px]">▼</span>
    </div>
  );
});

export default Select;
