import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Select = forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-10 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-100',
      className
    )}
    {...props}
  >
    {children}
  </select>
));

Select.displayName = 'Select';

