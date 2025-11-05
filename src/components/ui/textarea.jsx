import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[120px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-100',
      className
    )}
    {...props}
  />
));

Textarea.displayName = 'Textarea';

