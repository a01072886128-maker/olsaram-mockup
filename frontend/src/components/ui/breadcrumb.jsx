import { cn } from '../../lib/utils';

export function Breadcrumb({ items = [], className }) {
  if (!items.length) return null;

  return (
    <nav className={cn('flex items-center text-sm text-slate-500', className)} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center">
          {index > 0 && <span className="mx-2 text-slate-400">/</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-slate-700">
              {item.label}
            </a>
          ) : (
            <span className="text-slate-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

