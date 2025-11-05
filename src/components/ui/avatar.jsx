import { cn } from '../../lib/utils';

export function Avatar({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AvatarFallback({ className, children, ...props }) {
  return (
    <span
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-700',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

