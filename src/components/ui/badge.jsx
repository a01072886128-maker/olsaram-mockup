import { cn } from '../../lib/utils';

const variantMap = {
  default: 'bg-[#0066CC] text-white',
  secondary: 'bg-slate-100 text-slate-700',
  outline: 'border border-slate-200 text-slate-700',
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantMap[variant] ?? variantMap.default,
        className
      )}
      {...props}
    />
  );
}

