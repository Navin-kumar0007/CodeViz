import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { IconButton } from './IconButton';

/**
 * Accessible modal dialog (zero-dep). Closes on ESC or backdrop click.
 * <Dialog open onClose title> …body… </Dialog>
 */
export function Dialog({ open, onClose, title, children, className, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,6,12,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        onClick={(e) => e.stopPropagation()}
        className={cn('w-full bg-surface border border-line rounded-xl shadow-[var(--cz-shadow-lg)] overflow-hidden', width, className)}
      >
        {title && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line">
            <h3 className="text-[14px] font-bold text-text">{title}</h3>
            <IconButton size="sm" aria-label="Close" onClick={onClose}>✕</IconButton>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default Dialog;
