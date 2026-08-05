import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const VARIANTS = {
  primary: 'bg-accent text-accent-fg border border-transparent hover:bg-accent-hover',
  secondary: 'bg-surface text-text border border-line hover:border-accent',
  ghost: 'bg-transparent text-muted border border-transparent hover:text-text hover:bg-elevated',
  danger: 'bg-danger text-white border border-transparent hover:opacity-90',
  subtle: 'bg-elevated text-text border border-transparent hover:bg-line',
};

const SIZES = {
  sm: 'h-7 px-3 text-[12px] gap-1.5 rounded-md',
  md: 'h-8 px-3.5 text-[13px] gap-2 rounded-lg',
  lg: 'h-9 px-4 text-sm gap-2 rounded-lg',
};

/** Primary UI button. variant: primary|secondary|ghost|danger|subtle · size: sm|md|lg */
export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors',
        'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  );
});

export default Button;
