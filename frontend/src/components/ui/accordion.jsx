import { useState } from 'react';
import { cn } from '../../lib/utils';

export function Accordion({ type = 'single', collapsible = false, children, className }) {
  return (
    <div className={cn('space-y-2', className)} data-type={type} data-collapsible={collapsible}>
      {children}
    </div>
  );
}

export function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <button
        type="button"
        className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{title}</span>
        <span className="text-xs text-slate-500">{open ? '닫기' : '열기'}</span>
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}
