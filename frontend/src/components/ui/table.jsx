import { cn } from '../../lib/utils';

export function Table({ className, ...props }) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-lg border border-slate-200', className)}>
      <table className="w-full border-collapse text-left text-sm text-slate-700" {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn('bg-slate-100 text-slate-600', className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn('bg-white', className)} {...props} />;
}

export function TableRow({ className, ...props }) {
  return <tr className={cn('border-b border-slate-200 last:border-0', className)} {...props} />;
}

export function TableHead({ className, ...props }) {
  return <th className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wide', className)} {...props} />;
}

export function TableCell({ className, ...props }) {
  return <td className={cn('px-4 py-3 align-top text-sm', className)} {...props} />;
}

