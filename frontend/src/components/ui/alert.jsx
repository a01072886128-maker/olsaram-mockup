import { cn } from '../../lib/utils';

export function Alert({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'border-slate-200 text-slate-700',
    warning: 'border-orange-200 bg-orange-50 text-orange-900',
  };

  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4 [&>svg~div]:pl-10 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-slate-700',
        variants[variant] ?? variants.default,
        className
      )}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }) {
  return <h5 className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />;
}

export function AlertDescription({ className, ...props }) {
  return <div className={cn('text-sm leading-relaxed', className)} {...props} />;
}

