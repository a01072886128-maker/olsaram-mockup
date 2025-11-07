import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const variantClasses = {
  default: 'bg-primary-green text-white hover:bg-dark-green',
  outline: 'border border-border-color text-text-primary hover:bg-primary-green/10',
  ghost: 'text-text-secondary hover:bg-primary-green/10',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
  secondary: 'bg-primary-green/10 text-primary-green hover:bg-primary-green/20',
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
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-green disabled:opacity-50 disabled:pointer-events-none',
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
