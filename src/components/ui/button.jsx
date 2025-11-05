import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const variantClasses = {
  default: 'bg-[#0066CC] text-white hover:bg-[#0052a3]',
  outline: 'border border-slate-300 text-slate-700 hover:bg-slate-100',
  ghost: 'text-slate-600 hover:bg-slate-100',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
};

const sizeClasses = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  lg: 'h-11 px-8',
  icon: 'h-10 w-10',
};

export const Button = forwardRef(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0066CC] disabled:opacity-50 disabled:pointer-events-none',
          variantClasses[variant] ?? variantClasses.default,
          sizeClasses[size] ?? sizeClasses.default,
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

