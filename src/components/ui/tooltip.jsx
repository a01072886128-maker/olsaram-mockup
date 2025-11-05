import { useState } from 'react';
import { cn } from '../../lib/utils';

export function Tooltip({ children, content, className }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && content && (
        <span
          role="tooltip"
          className={cn(
            'absolute top-full mt-2 w-max max-w-xs rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-lg',
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}

