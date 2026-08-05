import { cn } from '../../utils/cn';

/** Elevated surface container. */
export function Card({ className, children, ...props }) {
  return (
    <div className={cn('bg-surface border border-line rounded-xl shadow-[var(--cz-shadow-md)]', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 px-4 py-3 border-b border-line', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return <h3 className={cn('text-[14px] font-bold text-text', className)} {...props}>{children}</h3>;
}

export function CardBody({ className, children, ...props }) {
  return <div className={cn('p-4', className)} {...props}>{children}</div>;
}

export default Card;
