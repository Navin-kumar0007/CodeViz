import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const SIZES = { sm: 'h-7 w-7 text-[13px]', md: 'h-8 w-8 text-[15px]', lg: 'h-9 w-9 text-[17px]' };

/** Square icon-only button. Pass an emoji/icon node as children. */
export const IconButton = forwardRef(function IconButton(
  { size = 'md', className, type = 'button', 'aria-label': ariaLabel, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center rounded-lg border border-transparent text-muted',
        'hover:text-text hover:bg-elevated transition-colors cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        SIZES[size],
        className
      )}
      {...props}
    />
  );
});

export default IconButton;
