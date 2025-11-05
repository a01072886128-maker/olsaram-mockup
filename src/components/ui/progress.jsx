import { cn } from '../../lib/utils';

export function Progress({ value = 0, className, ...props }) {
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={cn('h-2 w-full rounded-full bg-slate-200', className)}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <div
        className="h-full rounded-full bg-[#0066CC] transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

