import { useState } from 'react';
import { cn } from '../../utils/cn';

/**
 * Simple accessible tabs.
 * <Tabs tabs={[{id,label}]} value activeId onChange /> — controlled or uncontrolled.
 */
export function Tabs({ tabs = [], value, defaultValue, onChange, className }) {
  const [internal, setInternal] = useState(defaultValue ?? tabs[0]?.id);
  const active = value ?? internal;
  const set = (id) => { if (value === undefined) setInternal(id); onChange?.(id); };

  return (
    <div role="tablist" className={cn('flex items-center gap-1 border-b border-line', className)}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={on}
            onClick={() => set(t.id)}
            className={cn(
              'relative -mb-px px-3.5 h-9 text-[12px] font-semibold uppercase tracking-wide transition-colors cursor-pointer',
              'border-b-2 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
              on ? 'text-accent border-accent' : 'text-muted border-transparent hover:text-text'
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
