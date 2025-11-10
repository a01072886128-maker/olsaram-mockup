import { cn } from '../../lib/utils';

export function Checkbox({ checked, onChange, className, disabled, id }) {
  const toggle = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      onClick={toggle}
      disabled={disabled}
      className={cn(
        'flex h-4 w-4 items-center justify-center rounded border border-slate-300 bg-white text-[#0066CC] focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:ring-offset-1',
        checked && 'bg-[#0066CC] text-white',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {checked && <span className="text-[10px]">✔</span>}
    </button>
  );
}

