import { cn } from '../../lib/utils';

export function Switch({ checked, onChange, className, disabled, id }) {
  const handleToggle = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={handleToggle}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:ring-offset-1',
        checked ? 'bg-[#0066CC]' : 'bg-slate-300',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

